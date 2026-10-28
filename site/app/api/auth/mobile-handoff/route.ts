import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" };

/** Browser OAuth fallback for Android devices whose Credential Manager cannot reauthenticate. */
export async function POST(request: NextRequest) {
  const state = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("cli", "1");
  loginUrl.searchParams.set("reauth", "1");
  loginUrl.searchParams.set("state", state);
  const supabase = createAdminClient();
  const { error } = await supabase.from("cli_auth_sessions").insert({
    state,
    expires_at: expiresAt,
  });
  if (error) {
    return NextResponse.json({ error: "Could not start browser sign-in" }, { status: 503, headers: noStore });
  }
  return NextResponse.json({
    state,
    login_url: loginUrl.toString(),
    expires_at: expiresAt,
  }, { headers: noStore });
}

/** The random state is the one-time bearer secret. Tokens are consumed only by this poll. */
export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state") ?? "";
  if (!/^[a-f0-9]{64}$/.test(state)) {
    return NextResponse.json({ error: "Invalid sign-in state" }, { status: 400, headers: noStore });
  }
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data: pending, error } = await supabase.from("cli_auth_sessions")
    .select("access_token,expires_at")
    .eq("state", state)
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Could not check sign-in" }, { status: 503, headers: noStore });
  if (!pending || pending.expires_at <= now) {
    return NextResponse.json({ error: "Sign-in expired. Start again." }, { status: 410, headers: noStore });
  }
  if (!pending.access_token) return NextResponse.json({ status: "pending" }, { headers: noStore });

  const { data: session, error: consumeError } = await supabase.from("cli_auth_sessions")
    .delete()
    .eq("state", state)
    .gt("expires_at", now)
    .not("access_token", "is", null)
    .select("access_token,refresh_token,user_id,email,name")
    .maybeSingle();
  if (consumeError || !session?.access_token || !session.refresh_token || !session.user_id) {
    return NextResponse.json({ error: "Sign-in was already completed" }, { status: 410, headers: noStore });
  }
  return NextResponse.json({ status: "complete", ...session }, { headers: noStore });
}

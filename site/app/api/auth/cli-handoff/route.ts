import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { state, access_token, refresh_token, user_id, email, name } = body;

    if (!state || typeof state !== "string") {
      return NextResponse.json({ error: "Missing state" }, { status: 400 });
    }
    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("cli_auth_sessions")
      .update({
        access_token,
        refresh_token,
        user_id: user_id ?? null,
        email: email ?? null,
        name: name ?? null,
        completed_at: new Date().toISOString(),
      })
      .eq("state", state)
      .select("state")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "No pending CLI session for this state. Run fotoro login again from the CLI.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

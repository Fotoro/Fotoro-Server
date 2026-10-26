import { NextRequest, NextResponse } from "next/server";
import { verifySupabaseToken } from "@/lib/auth-verify";
import { createAdminClient } from "@/lib/supabase/admin";
import { relayFetch } from "@/lib/fotoro-relay";
import { normalizeFotoroServerUrl } from "@/lib/fotoro-url";

export async function POST(request: NextRequest) {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!bearer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const claims = await verifySupabaseToken(bearer);
    const userId = String(claims.sub ?? "");
    const supabase = createAdminClient();
    const { data: node, error } = await supabase.from("nodes")
      .select("tailnet_url")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!node?.tailnet_url) {
      return NextResponse.json({ error: "Private Tailscale Serve URL is not registered" }, { status: 503 });
    }
    const serverUrl = normalizeFotoroServerUrl(node.tailnet_url);
    const parsed = new URL(serverUrl);
    if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".ts.net")) {
      return NextResponse.json({ error: "Private Tailscale Serve URL is invalid" }, { status: 503 });
    }
    const upstream = await relayFetch(userId, bearer, "api/v1/pairing/sessions", "", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ server_url: serverUrl }),
    });
    const body = await upstream.json().catch(() => ({ error: "Pairing failed" }));
    return NextResponse.json(body, { status: upstream.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not create pairing session" }, { status: 503 });
  }
}

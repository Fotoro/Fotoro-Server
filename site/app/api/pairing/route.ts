import { NextRequest, NextResponse } from "next/server";
import { verifySupabaseToken } from "@/lib/auth-verify";
import { relayFetch, sanitizeRelayError } from "@/lib/fotoro-relay";
import { FOTORO_ENDPOINT_COOKIE } from "@/lib/fotoro-proxy-cookie";
import { tailscaleFunnelOrigin } from "@/lib/fotoro-url";

export async function POST(request: NextRequest) {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!bearer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const claims = await verifySupabaseToken(bearer);
    const userId = String(claims.sub ?? "");
    const endpoint = request.cookies.get(FOTORO_ENDPOINT_COOKIE)?.value;
    if (!endpoint) return NextResponse.json({ error: "Unlock the endpoint vault first" }, { status: 423 });
    const body = await request.json().catch(() => ({}));
    const serverUrl = tailscaleFunnelOrigin(typeof body.server_url === "string" ? body.server_url : null) ?? endpoint;
    const upstream = await relayFetch(userId, bearer, "api/v1/pairing/sessions", "", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ server_url: serverUrl }),
    }, endpoint);
    const responseBody = await upstream.json().catch(() => ({ error: "Pairing failed" }));
    return NextResponse.json(responseBody, { status: upstream.status, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const detail = sanitizeRelayError(error instanceof Error ? error.message : "Pairing service unavailable");
    return NextResponse.json({ error: `Could not reach your running Fotoro server. ${detail}` }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}

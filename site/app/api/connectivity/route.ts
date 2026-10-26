import { NextRequest, NextResponse } from "next/server";
import { verifySupabaseToken } from "@/lib/auth-verify";
import { diagnoseRelayConnectivity, sanitizeRelayError } from "@/lib/fotoro-relay";

/** Server-side connectivity check — browser never sees funnel URL or tailscale IP. */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ online: false, error: "Unauthorized" }, { status: 401 });
    }

    const bearer = authHeader.slice(7);
    const claims = await verifySupabaseToken(bearer);
    const userId = claims.sub as string;

    const diagnostic = await diagnoseRelayConnectivity(userId, bearer);
    return NextResponse.json({
      online: diagnostic.online,
      photos: diagnostic.photos ?? 0,
      error: diagnostic.online ? null : diagnostic.message,
      code: diagnostic.code,
      stage: diagnostic.stage,
      status: diagnostic.status,
      last_seen: diagnostic.lastSeen,
      has_public_url: diagnostic.hasPublicUrl,
      has_tailnet_url: diagnostic.hasTailnetUrl,
    });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "Connectivity check failed";
    let hint = sanitizeRelayError(raw);
    if (hint.includes("No server registered") || hint.includes("No relay configured")) {
      hint = "No server linked to your account. Run ./fotoro setup then ./fotoro nodesync.";
    } else if (!hint || hint === raw) {
      hint = "Cannot reach your home server through the secure relay. Run ./fotoro server.";
    }
    return NextResponse.json({ online: false, error: hint });
  }
}

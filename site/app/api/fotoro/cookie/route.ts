import { NextRequest, NextResponse } from "next/server";
import { verifySupabaseToken } from "@/lib/auth-verify";
import { FOTORO_ENDPOINT_COOKIE, FOTORO_PROXY_COOKIE } from "@/lib/fotoro-proxy-cookie";
import { tailscaleFunnelOrigin } from "@/lib/fotoro-url";

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = auth.slice(7);
  try {
    await verifySupabaseToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const endpoint = tailscaleFunnelOrigin(typeof body.endpoint === "string" ? body.endpoint : null);
  if (!endpoint) return NextResponse.json({ error: "Valid Tailscale HTTPS endpoint required" }, { status: 400 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(FOTORO_PROXY_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/fotoro",
    maxAge: 60 * 60 * 24,
  });
  res.cookies.set(FOTORO_ENDPOINT_COOKIE, endpoint, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api",
    maxAge: 60 * 60,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(FOTORO_PROXY_COOKIE, "", {
    httpOnly: true,
    path: "/api/fotoro",
    maxAge: 0,
  });
  res.cookies.set(FOTORO_ENDPOINT_COOKIE, "", {
    httpOnly: true,
    path: "/api",
    maxAge: 0,
  });
  return res;
}

import { NextRequest, NextResponse } from "next/server";
import { verifySupabaseToken } from "@/lib/auth-verify";
import { FOTORO_PROXY_COOKIE } from "@/lib/fotoro-proxy-cookie";

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

  const res = NextResponse.json({ ok: true });
  res.cookies.set(FOTORO_PROXY_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/fotoro",
    maxAge: 3600,
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
  return res;
}

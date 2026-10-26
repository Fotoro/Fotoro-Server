import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, context: RouteContext) {
  const configured = process.env.FOTORO_LOCAL_SERVER_URL?.trim();
  if (!configured) return NextResponse.json({ error: "Local Fotoro API is not configured" }, { status: 503 });
  let base: URL;
  try {
    base = new URL(configured);
  } catch {
    return NextResponse.json({ error: "Invalid local API configuration" }, { status: 503 });
  }
  if (base.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(base.hostname)) {
    return NextResponse.json({ error: "Local API must use loopback" }, { status: 503 });
  }
  const { path } = await context.params;
  if (!path?.length || path.some((item) => !item || item === "." || item === ".." || item.includes("/"))) {
    return NextResponse.json({ error: "Invalid API path" }, { status: 400 });
  }
  const apiPath = path.map((item) => encodeURIComponent(item)).join("/");
  const target = new URL(`/api/v1/${apiPath}${request.nextUrl.search}`, base.origin);
  const headers = new Headers();
  for (const name of ["authorization", "content-type", "upload-offset", "range", "if-range", "if-none-match", "if-modified-since"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const init: RequestInit = { method: request.method, headers, redirect: "manual", signal: AbortSignal.timeout(300_000) };
  if (["POST", "PATCH", "PUT"].includes(request.method)) {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 16 * 1024 * 1024 + 64 * 1024) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }
    const body = await request.arrayBuffer();
    if (body.byteLength > 16 * 1024 * 1024 + 64 * 1024) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }
    init.body = body;
  }
  try {
    const upstream = await fetch(target, init);
    const responseHeaders = new Headers();
    for (const name of ["content-type", "cache-control", "upload-offset", "upload-length", "location", "accept-ranges", "content-range", "etag", "last-modified"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    if (!responseHeaders.has("cache-control")) responseHeaders.set("Cache-Control", "private, no-store");
    return new NextResponse(request.method === "HEAD" ? null : upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json({ error: "Local Fotoro API unavailable" }, { status: 503 });
  }
}

export const GET = forward;
export const HEAD = forward;
export const POST = forward;
export const PATCH = forward;
export const DELETE = forward;

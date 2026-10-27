import { NextRequest, NextResponse } from "next/server";
import { verifySupabaseToken } from "@/lib/auth-verify";
import { FOTORO_PROXY_COOKIE } from "@/lib/fotoro-proxy-cookie";
import { getRelayBaseUrlForUser, sanitizeRelayError } from "@/lib/fotoro-relay";

const MAX_PROXY_BODY_BYTES = 16 * 1024 * 1024 + 64 * 1024;

/** Server-side proxy to the account's private home server. */
async function proxyToRelay(
  request: NextRequest,
  path: string,
  userId: string,
  bearer: string
) {
  const base = await getRelayBaseUrlForUser(userId);
  const target = new URL(path, base.endsWith("/") ? base : `${base}/`);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${bearer}`);

  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  for (const name of ["upload-offset", "range", "if-range", "if-none-match", "if-modified-since"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    signal: AbortSignal.timeout(300_000),
    redirect: "manual",
  };

  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_PROXY_BODY_BYTES) {
      return NextResponse.json({ error: "Upload chunk exceeds the proxy limit" }, { status: 413 });
    }
    const body = await request.arrayBuffer();
    if (body.byteLength > MAX_PROXY_BODY_BYTES) {
      return NextResponse.json({ error: "Upload chunk exceeds the proxy limit" }, { status: 413 });
    }
    init.body = body;
  }

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), init);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "fetch failed";
    return NextResponse.json(
      {
        error: sanitizeRelayError(msg) ||
          "Cannot reach your home server. Run ./fotoroctl start and ./fotoro nodesync.",
      },
      { status: 502 }
    );
  }

  const respHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) respHeaders.set("Content-Type", upstreamType);
  const isThumbnail = /^api\/thumbnail\/[a-f0-9]{64}$/.test(path) ||
    /^api\/v1\/media\/[a-f0-9]{64}\/thumbnail$/.test(path);
  if (upstream.ok && upstreamType?.startsWith("image/")) {
    // Content-addressed thumbnails can stay in the owner's browser cache.
    // Never forward a public cache directive from the private home server.
    respHeaders.set("Cache-Control", isThumbnail
      ? "private, max-age=31536000, immutable"
      : "private, max-age=3600");
  } else {
    respHeaders.set("Cache-Control", "private, no-store");
  }
  for (const name of ["upload-offset", "upload-length", "location", "accept-ranges", "content-range", "etag", "last-modified"]) {
    const value = upstream.headers.get(name);
    if (value) respHeaders.set(name, value);
  }

  if (upstreamType?.includes("application/json")) {
    const body = await upstream.text();
    return new NextResponse(body, { status: upstream.status, headers: respHeaders });
  }

  return new NextResponse(request.method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}

export async function HEAD(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    let bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!bearer && request.method === "GET") {
      bearer = request.cookies.get(FOTORO_PROXY_COOKIE)?.value ?? "";
    }

    if (!bearer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = await verifySupabaseToken(bearer);
    const userId = claims.sub as string;

    const { path: segments } = await context.params;
    if (!segments?.length || segments.some((segment) => !segment || segment === "." || segment === ".." || segment.includes("/"))) {
      return NextResponse.json({ error: "Invalid API path" }, { status: 400 });
    }
    const path = segments.map((segment) => encodeURIComponent(segment)).join("/");

    return proxyToRelay(request, path, userId, bearer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proxy error";
    return NextResponse.json(
      { error: sanitizeRelayError(message) || "Relay error" },
      { status: 500 }
    );
  }
}

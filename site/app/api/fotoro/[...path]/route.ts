import { NextRequest, NextResponse } from "next/server";
import { verifySupabaseToken } from "@/lib/auth-verify";
import { FOTORO_PROXY_COOKIE } from "@/lib/fotoro-proxy-cookie";
import { getRelayBaseUrlForUser, sanitizeRelayError } from "@/lib/fotoro-relay";

/** Server-side proxy to your home server via Tailscale funnel — URL never exposed to browser. */
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

  const init: RequestInit = {
    method: request.method,
    headers,
    signal: AbortSignal.timeout(30_000),
  };

  if (request.method === "POST" || request.method === "PUT") {
    const ct = request.headers.get("content-type") ?? "";
    if (ct.includes("multipart/form-data")) {
      init.body = await request.arrayBuffer();
    } else {
      init.body = await request.text();
    }
  }

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), init);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "fetch failed";
    return NextResponse.json(
      {
        error: sanitizeRelayError(msg) ||
          "Cannot reach your home server. Run ./fotoro server and ./fotoro nodesync.",
      },
      { status: 502 }
    );
  }

  const respHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) respHeaders.set("Content-Type", upstreamType);
  const cacheControl = upstream.headers.get("cache-control");
  if (cacheControl) {
    respHeaders.set("Cache-Control", cacheControl);
  } else if (upstreamType?.startsWith("image/")) {
    respHeaders.set("Cache-Control", "private, max-age=86400");
  }

  if (upstreamType?.includes("application/json")) {
    const body = await upstream.text();
    return new NextResponse(body, { status: upstream.status, headers: respHeaders });
  }

  return new NextResponse(upstream.body, {
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
    const path = (segments ?? []).join("/");

    return proxyToRelay(request, path, userId, bearer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proxy error";
    return NextResponse.json(
      { error: sanitizeRelayError(message) || "Relay error" },
      { status: 500 }
    );
  }
}

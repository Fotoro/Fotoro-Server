import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySupabaseToken } from "@/lib/auth-verify";
import { getNodeBaseUrl } from "@/lib/fotoro-url";
import { FOTORO_PROXY_COOKIE } from "@/lib/fotoro-proxy-cookie";

async function getUserNodeBaseUrl(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("nodes")
    .select("public_url, tailnet_url, magic_dns")
    .eq("user_id", userId)
    .order("last_seen", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("No server registered — run ./fotoro setup");

  const base = getNodeBaseUrl(data);
  if (!base) throw new Error("No funnel URL — run ./fotoro server");
  return base;
}

/** Server-side proxy to your Tailscale funnel (bypasses browser CORS/DNS issues). */
async function proxyToFunnel(
  request: NextRequest,
  path: string,
  userId: string,
  bearer: string
) {
  const base = await getUserNodeBaseUrl(userId);
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
        error: `Cannot reach your funnel at ${base}. Run ./fotoro server and: sudo tailscale funnel status. (${msg})`,
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

    return proxyToFunnel(request, path, userId, bearer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proxy error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { normalizeFotoroServerUrl } from "@/lib/fotoro-url";

/** Grid uses small thumbs; full image on click. */
export const GRID_THUMB_SIZE = "small";

/**
 * Direct funnel URL when available (1 hop) — otherwise Vercel proxy (2 hops).
 * access_token query param is only used for GET image/thumbnail on your server.
 */
export function resolveMediaUrl(
  funnelBase: string | null,
  token: string | null,
  apiPath: string
): string {
  const path = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;

  if (funnelBase && token) {
    const base = normalizeFotoroServerUrl(funnelBase);
    const u = new URL(path, base.endsWith("/") ? base : `${base}/`);
    u.searchParams.set("access_token", token);
    return u.toString();
  }

  return `/api/fotoro${path}`;
}

export function gridThumbPath(hash: string): string {
  return `/api/thumbnail/${hash}?size=${GRID_THUMB_SIZE}`;
}

export function fullImagePath(hash: string): string {
  return `/api/image/${hash}`;
}

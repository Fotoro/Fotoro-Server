/** All media loads through Vercel relay — no direct funnel URLs in the browser. */
export const GRID_THUMB_SIZE = "small";

export function proxyMediaUrl(apiPath: string): string {
  const path = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
  return `/api/fotoro${path}`;
}

export function gridThumbPath(hash: string): string {
  return `/api/thumbnail/${hash}?size=${GRID_THUMB_SIZE}`;
}

export function fullImagePath(hash: string): string {
  return `/api/image/${hash}`;
}

/**
 * Talks to your local Fotoro server via Vercel proxy (/api/fotoro/*).
 * Your Supabase login token is forwarded — no extra secrets needed.
 */

import { fetchPhotosPage } from "@/lib/fotoro-server-data";

export type ConnectivityState = "checking" | "online" | "offline" | "syncing";

export interface GalleryPhoto {
  id: string;
  caption: string;
  category: string;
  taken_at?: string;
  thumbnail: string;
}

export interface ServerStatus {
  status: string;
  photos: number;
  server: string;
  timestamp?: string;
}

export interface NodePublic {
  node_name: string;
  public_url?: string | null;
  tailnet_url?: string | null;
  magic_dns?: string | null;
  status: string;
  live?: boolean;
  connect_error?: string | null;
}

export { getNodeBaseUrl, normalizeFotoroServerUrl } from "@/lib/fotoro-url";

function authHeaders(supabaseToken: string): HeadersInit {
  return { Authorization: `Bearer ${supabaseToken}` };
}

async function proxyFetch(
  path: string,
  supabaseToken: string,
  init?: RequestInit
): Promise<Response> {
  const url = `/api/fotoro/${path.replace(/^\//, "")}`;
  return fetch(url, {
    ...init,
    headers: {
      ...authHeaders(supabaseToken),
      ...(init?.headers ?? {}),
    },
  });
}

export async function checkServerStatus(
  _baseUrl: string | null,
  supabaseToken: string
): Promise<{ state: ConnectivityState; error?: string }> {
  try {
    const res = await proxyFetch("status", supabaseToken, {
      signal: AbortSignal.timeout(12000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        state: "offline",
        error: (data as { error?: string }).error ?? `Server returned ${res.status}`,
      };
    }
    const status = data as ServerStatus;
    if (status.status === "syncing") return { state: "syncing" };
    return status.status === "online"
      ? { state: "online" }
      : { state: "offline", error: "Server status is not online" };
  } catch (err) {
    return {
      state: "offline",
      error: err instanceof Error ? err.message : "Connection failed",
    };
  }
}

export async function fetchPhotos(
  _baseUrl: string | null,
  supabaseToken: string,
  page = 1,
  limit = 60
): Promise<GalleryPhoto[]> {
  const data = await fetchPhotosPage(supabaseToken, page, limit);
  return data.photos;
}

export async function searchPhotos(
  _baseUrl: string | null,
  supabaseToken: string,
  query: string,
  limit = 48
): Promise<GalleryPhoto[]> {
  const res = await proxyFetch("search", supabaseToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, limit }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    throw new Error(`Search failed (${res.status})`);
  }
  const data = await res.json();
  return ((data.results ?? []) as Array<GalleryPhoto & { id: string }>).map(
    (r) => ({
      id: r.id,
      caption: r.caption,
      category: r.category,
      thumbnail: r.thumbnail,
    })
  );
}

export function thumbUrl(_baseUrl: string | null, photo: GalleryPhoto): string {
  let path = photo.thumbnail.startsWith("/")
    ? photo.thumbnail
    : `/thumb/${photo.id}`;
  if (!path.includes("size=")) {
    path += (path.includes("?") ? "&" : "?") + "size=medium";
  }
  return `/api/fotoro${path}`;
}

export function photoUrl(_baseUrl: string | null, id: string): string {
  return `/api/fotoro/photo/${id}`;
}

export async function fetchThumb(
  _baseUrl: string | null,
  supabaseToken: string,
  photo: GalleryPhoto
): Promise<string> {
  const res = await proxyFetch(
    thumbUrl(null, photo).replace("/api/fotoro/", ""),
    supabaseToken,
    { signal: AbortSignal.timeout(15000) }
  );
  if (!res.ok) throw new Error("Thumbnail load failed");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

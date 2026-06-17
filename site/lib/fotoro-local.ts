/**
 * Browser → local Fotoro server (Tailscale Funnel).
 * Uses your existing Supabase session token — no extra FOTORO_LOCAL_TOKEN_SECRET needed.
 * (Local server verifies JWT via Supabase JWKS; same keys already in your .env.)
 */

import { getNodeBaseUrl, normalizeFotoroServerUrl } from "@/lib/fotoro-url";

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

export { getNodeBaseUrl, normalizeFotoroServerUrl };

function authHeaders(supabaseToken: string): HeadersInit {
  return { Authorization: `Bearer ${supabaseToken}` };
}

export async function checkServerStatus(
  baseUrl: string,
  supabaseToken: string
): Promise<{ state: ConnectivityState; error?: string }> {
  const url = normalizeFotoroServerUrl(baseUrl);
  try {
    const res = await fetch(`${url}/status`, {
      headers: authHeaders(supabaseToken),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        state: "offline",
        error: `Server returned ${res.status}${text ? `: ${text.slice(0, 120)}` : ""}`,
      };
    }
    const data = (await res.json()) as ServerStatus;
    if (data.status === "syncing") return { state: "syncing" };
    return data.status === "online"
      ? { state: "online" }
      : { state: "offline", error: "Server status is not online" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Connection failed";
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      return {
        state: "offline",
        error:
          "Cannot reach your funnel URL. Run ./fotoro server and ensure Tailscale Funnel is active (sudo tailscale funnel status).",
      };
    }
    return { state: "offline", error: msg };
  }
}

export async function fetchPhotos(
  baseUrl: string,
  supabaseToken: string,
  page = 1,
  limit = 48
): Promise<GalleryPhoto[]> {
  const url = normalizeFotoroServerUrl(baseUrl);
  const res = await fetch(`${url}/photos?page=${page}&limit=${limit}`, {
    headers: authHeaders(supabaseToken),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    throw new Error(`Photos fetch failed (${res.status})`);
  }
  const data = await res.json();
  return (data.photos ?? []) as GalleryPhoto[];
}

export async function searchPhotos(
  baseUrl: string,
  supabaseToken: string,
  query: string,
  limit = 48
): Promise<GalleryPhoto[]> {
  const url = normalizeFotoroServerUrl(baseUrl);
  const res = await fetch(`${url}/search`, {
    method: "POST",
    headers: {
      ...authHeaders(supabaseToken),
      "Content-Type": "application/json",
    },
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

export function thumbUrl(baseUrl: string, photo: GalleryPhoto): string {
  const root = normalizeFotoroServerUrl(baseUrl);
  const path = photo.thumbnail.startsWith("/")
    ? photo.thumbnail
    : `/thumb/${photo.id}`;
  return `${root}${path}`;
}

export function photoUrl(baseUrl: string, id: string): string {
  return `${normalizeFotoroServerUrl(baseUrl)}/photo/${id}`;
}

export async function fetchThumb(
  baseUrl: string,
  supabaseToken: string,
  photo: GalleryPhoto
): Promise<string> {
  const res = await fetch(thumbUrl(baseUrl, photo), {
    headers: authHeaders(supabaseToken),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error("Thumbnail load failed");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

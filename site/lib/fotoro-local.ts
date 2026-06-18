/**
 * Talks to your local Fotoro server via Vercel proxy (/api/fotoro/*).
 * Uses the same /api/* routes as the Qt desktop (main.cpp).
 */

import {
  fetchPhotosPage,
  searchPhotosApi,
} from "@/lib/fotoro-server-data";
import { fullImagePath, resolveMediaUrl } from "@/lib/fotoro-media-url";

export type ConnectivityState = "checking" | "online" | "offline" | "syncing";

export interface GalleryPhoto {
  id: string;
  caption: string;
  category: string;
  taken_at?: string;
  thumbnail: string;
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

/** Online when /api/stats responds — same probe desktop uses. */
export async function checkServerStatus(
  _baseUrl: string | null,
  supabaseToken: string
): Promise<{ state: ConnectivityState; error?: string }> {
  try {
    const res = await proxyFetch("api/stats", supabaseToken, {
      signal: AbortSignal.timeout(12000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        state: "offline",
        error: (data as { error?: string }).error ?? `Server returned ${res.status}`,
      };
    }
    const total = (data as { total?: number }).total;
    if (total != null && total >= 0) return { state: "online" };
    return { state: "online" };
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
  limit = 100
): Promise<GalleryPhoto[]> {
  const data = await fetchPhotosPage(supabaseToken, page, limit);
  return data.photos;
}

export async function searchPhotos(
  _baseUrl: string | null,
  supabaseToken: string,
  query: string,
  _limit = 50
): Promise<GalleryPhoto[]> {
  return searchPhotosApi(supabaseToken, query);
}

export function thumbUrl(_baseUrl: string | null, photo: GalleryPhoto): string {
  return photo.thumbnail;
}

export function photoUrl(
  funnelBase: string | null,
  id: string,
  token?: string | null
): string {
  return resolveMediaUrl(funnelBase ?? null, token ?? null, fullImagePath(id));
}

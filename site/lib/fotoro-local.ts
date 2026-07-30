/**
 * Talks to your local Fotoro server only via Vercel secure relay (/api/fotoro/*).
 * Funnel URLs and tailscale IPs never reach the browser.
 */

import {
  fetchPhotosPage,
  searchPhotosApi,
} from "@/lib/fotoro-server-data";
import { fullImagePath, proxyMediaUrl } from "@/lib/fotoro-media-url";

export type ConnectivityState = "checking" | "online" | "offline" | "syncing";

export interface GalleryPhoto {
  id: string;
  caption: string;
  category: string;
  added_at?: string;
  taken_at?: string;
  thumbnail: string;
}

export interface NodePublic {
  node_name: string;
  status: string;
  live?: boolean;
  connect_error?: string | null;
  last_seen?: string;
}

export { normalizeFotoroServerUrl } from "@/lib/fotoro-url";

function authHeaders(supabaseToken: string): HeadersInit {
  return { Authorization: `Bearer ${supabaseToken}` };
}

/** Server-side relay probe — no funnel URL in browser. */
export async function checkServerStatus(
  _baseUrl: string | null,
  supabaseToken: string
): Promise<{ state: ConnectivityState; error?: string }> {
  try {
    const res = await fetch("/api/connectivity", {
      headers: authHeaders(supabaseToken),
      signal: AbortSignal.timeout(20_000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        state: "offline",
        error: (data as { error?: string }).error ?? "Relay check failed",
      };
    }
    if ((data as { online?: boolean }).online) {
      return { state: "online" };
    }
    return {
      state: "offline",
      error: (data as { error?: string }).error ?? "Home server offline",
    };
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

export function photoUrl(_baseUrl: string | null, id: string): string {
  return proxyMediaUrl(fullImagePath(id));
}

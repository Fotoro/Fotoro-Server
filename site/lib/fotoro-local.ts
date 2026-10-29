/**
 * Uses the website relay for authenticated metadata and scoped signed Funnel
 * links for media bytes when the home server provides them.
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
  thumbnailFallback?: string;
  preview?: string;
  previewFallback?: string;
  detail?: string;
  detailFallback?: string;
  original?: string;
  originalFallback?: string;
  originalName?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  media_kind?: string;
  mimeType?: string;
  safe_to_delete?: boolean;
}

export interface NodePublic {
  node_name: string;
  status: string;
  live?: boolean;
  connect_error?: string | null;
  last_seen?: string;
  direct_url?: string | null;
  private_url?: string | null;
}

export { normalizeFotoroServerUrl } from "@/lib/fotoro-url";

function authHeaders(supabaseToken: string): HeadersInit {
  return { Authorization: `Bearer ${supabaseToken}` };
}

/** Probe the owner's server from the browser, bypassing cloud relay timeouts. */
export async function checkServerStatus(
  baseUrl: string | null,
  supabaseToken: string
): Promise<{ state: ConnectivityState; error?: string; code?: string; stage?: string }> {
  try {
    const res = await fetch(baseUrl ? `${baseUrl}/api/v1/me` : "/api/connectivity", {
      headers: authHeaders(supabaseToken),
      signal: AbortSignal.timeout(7_000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        state: "offline",
        error: (data as { error?: string }).error ?? "Relay check failed",
        code: (data as { code?: string }).code,
        stage: (data as { stage?: string }).stage,
      };
    }
    if (baseUrl || (data as { online?: boolean }).online) {
      return { state: "online" };
    }
    return {
      state: "offline",
      error: (data as { error?: string }).error ?? "Home server offline",
      code: (data as { code?: string }).code,
      stage: (data as { stage?: string }).stage,
    };
  } catch (err) {
    return {
      state: "offline",
      error: err instanceof Error ? err.message : "Connection failed",
    };
  }
}

export async function fetchPhotos(
  baseUrl: string | null,
  supabaseToken: string,
  page = 1,
  limit = 100
): Promise<GalleryPhoto[]> {
  const data = await fetchPhotosPage(supabaseToken, page, limit, undefined, baseUrl);
  return data.photos;
}

export async function searchPhotos(
  baseUrl: string | null,
  supabaseToken: string,
  query: string,
  _limit = 50
): Promise<GalleryPhoto[]> {
  return searchPhotosApi(supabaseToken, query, baseUrl);
}

export function thumbUrl(_baseUrl: string | null, photo: GalleryPhoto): string {
  return photo.thumbnail;
}

export function photoUrl(_baseUrl: string | null, id: string): string {
  return proxyMediaUrl(fullImagePath(id));
}

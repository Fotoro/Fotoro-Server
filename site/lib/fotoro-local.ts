/**
 * Browser → local Fotoro server (via Tailscale Funnel / Serve).
 * Uses short-lived tokens minted by /api/local-token — never sends raw Supabase JWT to funnel.
 */

export type ConnectivityState = "checking" | "online" | "offline" | "syncing";

export interface LocalTokenResponse {
  local_token: string;
  expires_in: number;
  base_url: string;
  node_name?: string;
}

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
}

export function getNodeBaseUrl(node: NodePublic): string | null {
  const url = (node.public_url || node.tailnet_url || "").replace(/\/$/, "");
  return url || null;
}

let cachedLocal: {
  token: string;
  baseUrl: string;
  expiresAt: number;
} | null = null;

export async function fetchLocalCredentials(
  supabaseToken: string
): Promise<LocalTokenResponse> {
  const now = Date.now();
  if (cachedLocal && cachedLocal.expiresAt > now + 30_000) {
    return {
      local_token: cachedLocal.token,
      expires_in: Math.floor((cachedLocal.expiresAt - now) / 1000),
      base_url: cachedLocal.baseUrl,
    };
  }

  const res = await fetch("/api/local-token", {
    method: "POST",
    headers: { Authorization: `Bearer ${supabaseToken}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Could not get local access token");
  }

  cachedLocal = {
    token: data.local_token,
    baseUrl: data.base_url,
    expiresAt: now + (data.expires_in ?? 300) * 1000,
  };
  return data as LocalTokenResponse;
}

export function clearLocalTokenCache() {
  cachedLocal = null;
}

export async function checkServerStatus(
  baseUrl: string,
  localToken: string
): Promise<ConnectivityState> {
  try {
    const res = await fetch(`${baseUrl}/status`, {
      headers: { Authorization: `Bearer ${localToken}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return "offline";
    const data = (await res.json()) as ServerStatus;
    if (data.status === "syncing") return "syncing";
    return data.status === "online" ? "online" : "offline";
  } catch {
    return "offline";
  }
}

export async function fetchPhotos(
  baseUrl: string,
  localToken: string,
  page = 1,
  limit = 48
): Promise<GalleryPhoto[]> {
  const res = await fetch(
    `${baseUrl}/photos?page=${page}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${localToken}` },
      signal: AbortSignal.timeout(15000),
    }
  );
  if (!res.ok) {
    throw new Error(`Photos fetch failed (${res.status})`);
  }
  const data = await res.json();
  return (data.photos ?? []) as GalleryPhoto[];
}

export async function searchPhotos(
  baseUrl: string,
  localToken: string,
  query: string,
  limit = 48
): Promise<GalleryPhoto[]> {
  const res = await fetch(`${baseUrl}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localToken}`,
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
  const path = photo.thumbnail.startsWith("/")
    ? photo.thumbnail
    : `/thumb/${photo.id}`;
  return `${baseUrl}${path}`;
}

export function photoUrl(baseUrl: string, id: string): string {
  return `${baseUrl}/photo/${id}`;
}

export async function fetchThumb(
  baseUrl: string,
  localToken: string,
  photo: GalleryPhoto
): Promise<string> {
  const res = await fetch(thumbUrl(baseUrl, photo), {
    headers: { Authorization: `Bearer ${localToken}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error("Thumbnail load failed");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

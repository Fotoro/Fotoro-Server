import type { GalleryPhoto } from "@/lib/fotoro-local";

export const TBE = "TBE";

export interface ServerLibraryStats {
  photos_total: number;
  photos_processed: number;
  photos_failed: number;
  thumbnails_medium: number;
  storage_used_bytes: number;
  disk_total_bytes: number;
  disk_free_bytes: number;
  devices_count: number;
  people_count: number | null;
  places_count: number | null;
  ai_queue_pct: number | null;
}

export interface ServerDevice {
  id: string;
  name: string;
  platform: string;
  status: string;
  last_seen?: string;
  items: string;
}

export interface PhotosPage {
  photos: GalleryPhoto[];
  total: number;
  page: number;
  limit: number;
  count: number;
}

interface ApiImageRow {
  hash: string;
  caption: string;
  category: string;
  thumbnail: string;
}

interface ApiStats {
  total: number;
  processed: number;
  failed: number;
  thumbnails_medium?: number;
  storage_used_bytes?: number;
  disk_total_bytes?: number;
  disk_free_bytes?: number;
  devices_count?: number;
  people_count?: number | null;
  places_count?: number | null;
  ai_queue_pct?: number | null;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

async function proxyGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`/api/fotoro/${path.replace(/^\//, "")}`, {
    headers: authHeaders(token),
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

/** Same medium thumb path the Qt desktop uses, via Vercel proxy. */
export function thumbProxyUrl(hash: string, thumbnail?: string): string {
  let path = thumbnail?.startsWith("/")
    ? thumbnail.replace("size=small", "size=medium")
    : `/api/thumbnail/${hash}?size=medium`;
  if (!path.includes("size=")) {
    path += (path.includes("?") ? "&" : "?") + "size=medium";
  }
  return `/api/fotoro/${path.replace(/^\//, "")}`;
}

export function fullImageProxyUrl(hash: string): string {
  return `/api/fotoro/api/image/${hash}`;
}

function mapApiImage(row: ApiImageRow): GalleryPhoto {
  return {
    id: row.hash,
    caption: row.caption,
    category: row.category,
    thumbnail: thumbProxyUrl(row.hash, row.thumbnail),
  };
}

export async function fetchLibraryStats(token: string): Promise<ServerLibraryStats | null> {
  try {
    const data = await proxyGet<ApiStats>("api/stats", token);
    return {
      photos_total: data.total ?? 0,
      photos_processed: data.processed ?? 0,
      photos_failed: data.failed ?? 0,
      thumbnails_medium: data.thumbnails_medium ?? data.total ?? 0,
      storage_used_bytes: data.storage_used_bytes ?? 0,
      disk_total_bytes: data.disk_total_bytes ?? 0,
      disk_free_bytes: data.disk_free_bytes ?? 0,
      devices_count: data.devices_count ?? 1,
      people_count: data.people_count ?? null,
      places_count: data.places_count ?? null,
      ai_queue_pct: data.ai_queue_pct ?? null,
    };
  } catch {
    return null;
  }
}

export async function fetchServerDevices(token: string): Promise<ServerDevice[]> {
  try {
    const [stats, status] = await Promise.all([
      proxyGet<ApiStats>("api/stats", token),
      proxyGet<{ running?: boolean }>("api/server/status", token).catch(() => ({
        running: true,
      })),
    ]);
    return [
      {
        id: "local-server",
        name: "fotoro-server",
        platform: "server",
        status: status.running ? "active" : "idle",
        items: `${(stats.total ?? 0).toLocaleString()} photos`,
      },
    ];
  } catch {
    return [];
  }
}

/** Paginated gallery — mirrors desktop GET /api/images?page=N&per_page=50 */
export async function fetchPhotosPage(
  token: string,
  page = 1,
  limit = 50
): Promise<PhotosPage> {
  const [rows, stats] = await Promise.all([
    proxyGet<ApiImageRow[]>(`api/images?page=${page}&per_page=${limit}`, token),
    proxyGet<ApiStats>("api/stats", token).catch(() => ({ total: 0 } as ApiStats)),
  ]);
  const list = Array.isArray(rows) ? rows : [];
  return {
    photos: list.map(mapApiImage),
    total: stats.total ?? list.length,
    page,
    limit,
    count: list.length,
  };
}

/** Semantic search — mirrors desktop GET /api/search?q= */
export async function searchPhotosApi(
  token: string,
  query: string
): Promise<GalleryPhoto[]> {
  const data = await proxyGet<{ results?: ApiImageRow[] }>(
    `api/search?q=${encodeURIComponent(query)}`,
    token
  );
  const rows = data.results ?? [];
  return rows.map(mapApiImage);
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return TBE;
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}

export function formatCount(n: number | null | undefined): string {
  if (n == null || n < 0) return TBE;
  return n.toLocaleString();
}

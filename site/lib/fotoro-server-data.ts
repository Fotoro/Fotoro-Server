import type { GalleryPhoto } from "@/lib/fotoro-local";
import { gridThumbPath, proxyMediaUrl } from "@/lib/fotoro-media-url";

export interface ServerLibraryStats {
  photos_total: number;
  photos_processed: number;
  photos_failed: number;
  thumbnails_medium: number;
  storage_used_bytes: number;
  disk_total_bytes: number;
  disk_free_bytes: number;
  media_bytes: number;
  cache_bytes: number;
  staging_bytes: number;
  devices_count: number;
  photos_with_faces: number;
  queue_pending: number;
  queue_failed: number;
  search_vectors: number;
  backup_verified: number;
  backup_pending: number;
  backup_available: boolean;
  primary_available: boolean;
  configured_model: string;
  collected_at: string;
  stale: boolean;
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
  added_at?: string;
  taken_at?: string;
}

interface ApiMediaRow {
  id: string;
  sha256: string;
  media_kind: string;
  mime_type?: string;
  captured_at?: string;
  imported_at: string;
  thumbnail_url?: string;
  direct_thumbnail_url?: string;
  direct_preview_url?: string;
  direct_detail_url?: string;
  direct_content_url?: string;
  detail_url?: string;
  original_name?: string;
  file_size?: number;
  width?: number;
  height?: number;
  safe_to_delete: boolean;
}

interface ApiMediaPage {
  media: ApiMediaRow[];
  total: number;
  page: number;
  limit: number;
}

interface ApiStats {
  total: number;
  processed: number;
  failed: number;
  thumbnails_medium?: number;
  storage_used_bytes?: number;
  disk_total_bytes?: number;
  disk_free_bytes?: number;
  media_bytes?: number;
  cache_bytes?: number;
  staging_bytes?: number;
  devices_count?: number;
  photos_with_faces?: number;
  queue_pending?: number;
  queue_failed?: number;
  search_vectors?: number;
  backup_verified?: number;
  backup_pending?: number;
  backup_available?: boolean;
  primary_available?: boolean;
  configured_model?: string;
  collected_at?: string;
  stale?: boolean;
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

/** Relative API path — resolve to direct funnel or proxy at render time. */
export function thumbApiPath(hash: string, thumbnail?: string): string {
  void thumbnail;
  return gridThumbPath(hash);
}

function mapApiImage(row: ApiImageRow): GalleryPhoto {
  const apiPath = thumbApiPath(row.hash, row.thumbnail);
  return {
    id: row.hash,
    caption: row.caption,
    category: row.category,
    added_at: row.added_at,
    taken_at: row.taken_at,
    thumbnail: proxyMediaUrl(apiPath),
  };
}

function mapApiMedia(row: ApiMediaRow): GalleryPhoto {
  const thumbnailFallback = row.thumbnail_url ? proxyMediaUrl(row.thumbnail_url) : "";
  const previewFallback = row.thumbnail_url
    ? proxyMediaUrl(row.thumbnail_url.replace("size=small", "size=medium"))
    : "";
  const originalFallback = proxyMediaUrl(`/api/v1/media/${encodeURIComponent(row.id)}/content`);
  const detailFallback = row.detail_url ? proxyMediaUrl(row.detail_url) : "";
  return {
    id: row.id,
    caption: "",
    category: row.media_kind,
    media_kind: row.media_kind,
    mimeType: row.mime_type,
    taken_at: row.captured_at ?? row.imported_at,
    added_at: row.imported_at,
    thumbnail: row.direct_thumbnail_url || thumbnailFallback,
    thumbnailFallback,
    preview: row.direct_preview_url || previewFallback,
    previewFallback,
    detail: row.direct_detail_url || detailFallback,
    detailFallback,
    original: row.direct_content_url || originalFallback,
    originalFallback,
    originalName: row.original_name,
    fileSize: row.file_size,
    width: row.width,
    height: row.height,
    safe_to_delete: row.safe_to_delete,
  };
}

export async function fetchLibraryStats(token: string): Promise<ServerLibraryStats | null> {
  try {
    const data = await proxyGet<ApiStats>("api/stats", token);
    return {
      photos_total: data.total ?? 0,
      photos_processed: data.processed ?? 0,
      photos_failed: data.failed ?? 0,
      thumbnails_medium: data.thumbnails_medium ?? 0,
      storage_used_bytes: data.storage_used_bytes ?? 0,
      disk_total_bytes: data.disk_total_bytes ?? 0,
      disk_free_bytes: data.disk_free_bytes ?? 0,
      media_bytes: data.media_bytes ?? data.storage_used_bytes ?? 0,
      cache_bytes: data.cache_bytes ?? 0,
      staging_bytes: data.staging_bytes ?? 0,
      devices_count: data.devices_count ?? 0,
      photos_with_faces: data.photos_with_faces ?? 0,
      queue_pending: data.queue_pending ?? 0,
      queue_failed: data.queue_failed ?? 0,
      search_vectors: data.search_vectors ?? 0,
      backup_verified: data.backup_verified ?? 0,
      backup_pending: data.backup_pending ?? 0,
      backup_available: data.backup_available ?? false,
      primary_available: data.primary_available ?? false,
      configured_model: data.configured_model ?? "Not configured",
      collected_at: data.collected_at ?? "",
      stale: data.stale ?? false,
    };
  } catch {
    return null;
  }
}

export async function fetchServerDevices(token: string): Promise<ServerDevice[]> {
  try {
    const data = await proxyGet<{ devices?: ServerDevice[] }>("devices", token);
    return Array.isArray(data.devices) ? data.devices : [];
  } catch {
    return [];
  }
}

/** Paginated gallery from the canonical media catalogue. */
export async function fetchPhotosPage(
  token: string,
  page = 1,
  limit = 100,
  knownTotal?: number
): Promise<PhotosPage> {
  void knownTotal;
  const data = await proxyGet<ApiMediaPage>(`api/v1/media?page=${page}&limit=${limit}`, token);
  const list = Array.isArray(data.media) ? data.media : [];

  return {
    photos: list.map(mapApiMedia),
    total: data.total,
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
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}

export function formatCount(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n < 0) return "—";
  return n.toLocaleString();
}

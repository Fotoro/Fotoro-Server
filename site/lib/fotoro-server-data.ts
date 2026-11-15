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

export interface BackupStatus {
  configured: boolean;
  available: boolean;
  error?: string;
  unverified_primary: number;
  missing_primary: number;
  corrupt_primary: number;
  pending: number;
  verified: number;
  failed: number;
}

export interface TierStats {
  hot_assets: number;
  hot_bytes: number;
  warm_assets: number;
  warm_bytes: number;
  cold_assets: number;
  cold_bytes: number;
  archive_bytes: number;
  saved_bytes: number;
  packs: number;
  pack_bytes: number;
  rehydrated_cache_bytes: number;
  primary_free_bytes: number;
  primary_total_bytes: number;
}

export interface TierRunResult {
  demoted: string[] | null;
  promoted: string[] | null;
  packed: string[] | null;
  errors?: string[] | null;
  cache_trimmed?: boolean;
}

export interface EmbedStatus {
  model: string;
  dim: number;
  total_images: number;
  embedded: number;
  pending: number;
  index_vectors: number;
  backend_healthy: boolean;
}

export interface EmbedBackfillResult {
  embedded: number;
  skipped: number;
  pending: number;
}

export interface CalendarYearNode {
  year: number;
  months: Record<string, number>;
  days: Record<string, number>;
  total: number;
}

export interface CalendarResponse {
  years: Record<string, CalendarYearNode>;
  missing_capture_dates: number;
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
  checksum_verified?: boolean;
  verified_storage_copies?: number;
  status?: string;
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

async function proxyGet<T>(path: string, token: string, baseUrl: string | null = null): Promise<T> {
  const cleanPath = path.replace(/^\//, "");
  const res = await fetch(baseUrl ? `${baseUrl}/${cleanPath}` : `/api/fotoro/${cleanPath}`, {
    headers: authHeaders(token),
    signal: AbortSignal.timeout(8_000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

async function proxyPost<T>(path: string, token: string, baseUrl: string | null = null): Promise<T> {
  const cleanPath = path.replace(/^\//, "");
  const res = await fetch(baseUrl ? `${baseUrl}/${cleanPath}` : `/api/fotoro/${cleanPath}`, {
    method: "POST",
    headers: authHeaders(token),
    signal: AbortSignal.timeout(120_000),
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
    checksum_verified: row.checksum_verified,
    verified_storage_copies: row.verified_storage_copies,
    status: row.status,
  };
}

export async function fetchLibraryStats(token: string, baseUrl: string | null = null): Promise<ServerLibraryStats | null> {
  try {
    const data = await proxyGet<ApiStats>("api/stats", token, baseUrl);
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

export async function fetchServerDevices(token: string, baseUrl: string | null = null): Promise<ServerDevice[]> {
  const data = await proxyGet<{ devices?: ServerDevice[] }>("devices", token, baseUrl);
  return Array.isArray(data.devices) ? data.devices : [];
}

export async function fetchBackupStatus(token: string, baseUrl: string | null = null): Promise<BackupStatus | null> {
  try {
    return await proxyGet<BackupStatus>("api/v1/storage", token, baseUrl);
  } catch {
    return null;
  }
}

export async function fetchTierStats(token: string, baseUrl: string | null = null): Promise<TierStats | null> {
  try {
    return await proxyGet<TierStats>("api/v1/storage/tiers", token, baseUrl);
  } catch {
    return null;
  }
}

export async function runTierPass(token: string, baseUrl: string | null = null): Promise<TierRunResult> {
  return proxyPost<TierRunResult>("api/v1/storage/tier/run", token, baseUrl);
}

export async function snapshotCatalogue(token: string, baseUrl: string | null = null): Promise<{ snapshot: string }> {
  return proxyPost<{ snapshot: string }>("api/v1/storage/catalogue-snapshot", token, baseUrl);
}

export async function verifyBackupCopies(token: string, baseUrl: string | null = null): Promise<{ checked: number; storage?: BackupStatus }> {
  return proxyPost<{ checked: number; storage?: BackupStatus }>("api/v1/storage/verify", token, baseUrl);
}

export async function fetchEmbedStatus(token: string, baseUrl: string | null = null): Promise<EmbedStatus | null> {
  try {
    return await proxyGet<EmbedStatus>("api/v1/embed/status", token, baseUrl);
  } catch {
    return null;
  }
}

export async function runEmbedBackfill(token: string, baseUrl: string | null = null): Promise<EmbedBackfillResult> {
  return proxyPost<EmbedBackfillResult>("api/v1/embed/backfill", token, baseUrl);
}

export async function fetchOnThisDay(token: string, baseUrl: string | null = null, perYear = 3): Promise<GalleryPhoto[]> {
  const data = await proxyGet<{ media?: ApiMediaRow[] }>(`api/v1/memories/on-this-day?per_year=${perYear}`, token, baseUrl);
  return Array.isArray(data.media) ? data.media.map(mapApiMedia) : [];
}

export async function fetchCalendar(token: string, baseUrl: string | null = null): Promise<CalendarResponse | null> {
  try {
    return await proxyGet<CalendarResponse>("api/v1/calendar", token, baseUrl);
  } catch {
    return null;
  }
}

export async function fetchCalendarDay(token: string, date: string, baseUrl: string | null = null): Promise<GalleryPhoto[]> {
  const data = await proxyGet<{ media?: ApiMediaRow[] }>(`api/v1/calendar/day?date=${encodeURIComponent(date)}&limit=200`, token, baseUrl);
  return Array.isArray(data.media) ? data.media.map(mapApiMedia) : [];
}

/** Paginated gallery from the canonical media catalogue. */
export async function fetchPhotosPage(
  token: string,
  page = 1,
  limit = 100,
  knownTotal?: number,
  baseUrl: string | null = null
): Promise<PhotosPage> {
  void knownTotal;
  const data = await proxyGet<ApiMediaPage>(`api/v1/media?page=${page}&limit=${limit}`, token, baseUrl);
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
  query: string,
  baseUrl: string | null = null
): Promise<GalleryPhoto[]> {
  const data = await proxyGet<{ results?: ApiImageRow[] }>(
    `api/search?q=${encodeURIComponent(query)}`,
    token,
    baseUrl
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

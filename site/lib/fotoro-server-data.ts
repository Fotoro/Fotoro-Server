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

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

async function proxyGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`/api/fotoro/${path}`, {
    headers: authHeaders(token),
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export async function fetchLibraryStats(token: string): Promise<ServerLibraryStats | null> {
  try {
    return await proxyGet<ServerLibraryStats>("stats", token);
  } catch {
    return null;
  }
}

export async function fetchServerDevices(token: string): Promise<ServerDevice[]> {
  try {
    const data = await proxyGet<{ devices: ServerDevice[] }>("devices", token);
    return data.devices ?? [];
  } catch {
    return [];
  }
}

export async function fetchPhotosPage(
  token: string,
  page = 1,
  limit = 60
): Promise<PhotosPage> {
  const data = await proxyGet<PhotosPage>(
    `photos?page=${page}&limit=${limit}`,
    token
  );
  return {
    photos: data.photos ?? [],
    total: data.total ?? 0,
    page: data.page ?? page,
    limit: data.limit ?? limit,
    count: data.count ?? 0,
  };
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

const CHUNK_BYTES = 16 * 1024 * 1024;
const FULL_DOWNLOAD_CHECK_BYTES = 32 * 1024 * 1024;
const RANGE_CHECK_BYTES = 64 * 1024;

type TokenProvider = () => Promise<string | null>;

type UploadSession = { id: string; received_size: number; status: string };

export type OffloadAsset = {
  id: string;
  sha256: string;
  file_size: number;
  original_name: string;
  safe_to_delete: boolean;
  verified_storage_copies: number;
  preview_status: string;
  content_url: string;
};

export type OffloadReceipt = { asset: OffloadAsset; duplicate: boolean };

async function storageKey(file: File): Promise<string> {
  // A sampled fingerprint prevents same-name, same-size files from sharing a
  // saved upload session. The server still checks the complete original hash.
  const sampleSize = Math.min(file.size, RANGE_CHECK_BYTES);
  const head = new Uint8Array(await file.slice(0, sampleSize).arrayBuffer());
  const tail = new Uint8Array(await file.slice(Math.max(0, file.size - sampleSize)).arrayBuffer());
  const sample = new Uint8Array(head.length + tail.length);
  sample.set(head);
  sample.set(tail, head.length);
  let fingerprint = "";
  if (crypto.subtle) {
    fingerprint = await digest(sample.buffer);
  } else {
    let value = 2166136261;
    for (const byte of sample) value = Math.imul(value ^ byte, 16777619);
    fingerprint = (value >>> 0).toString(16);
  }
  return `fotoro-upload:${file.name}:${file.size}:${file.lastModified}:${fingerprint}`;
}

async function digest(bytes: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function expectedHash(file: File): Promise<string | undefined> {
  // Web Crypto uses memory for the full input. The Go server hashes all sizes.
  if (file.size > FULL_DOWNLOAD_CHECK_BYTES || !crypto.subtle) return undefined;
  return digest(await file.arrayBuffer());
}

async function authenticatedFetch(path: string, getToken: TokenProvider, init: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  if (!token) throw new Error("Sign-in expired. Sign in again, then select the same file to resume.");
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(`/api/fotoro${path}`, { ...init, headers, cache: "no-store" });
}

async function responseError(response: Response, fallback: string): Promise<Error> {
  const data = await response.json().catch(() => ({}));
  const message = typeof data.error === "string" ? data.error : fallback;
  return new Error(`${message} (HTTP ${response.status})`);
}

function validAsset(asset: OffloadAsset, file: File): boolean {
  return Boolean(asset?.id && /^[a-f0-9]{64}$/i.test(asset.sha256) &&
    asset.file_size === file.size && typeof asset.content_url === "string" &&
    asset.content_url.startsWith("/api/v1/media/"));
}

export async function uploadResumable(
  file: File,
  getToken: TokenProvider,
  onProgress: (percent: number) => void
): Promise<OffloadReceipt> {
  if (file.size === 0) throw new Error("Choose a nonempty photo or video.");
  const key = await storageKey(file);
  let id = localStorage.getItem(key);
  let offset = 0;

  if (id) {
    const head = await authenticatedFetch(`/api/v1/uploads/${encodeURIComponent(id)}`, getToken, { method: "HEAD" });
    if (head.ok && Number(head.headers.get("upload-length")) === file.size) {
      offset = Number(head.headers.get("upload-offset") ?? 0);
      if (!Number.isSafeInteger(offset) || offset < 0 || offset > file.size) {
        throw new Error("Server returned an invalid upload offset");
      }
    } else if (head.status === 404 || head.status === 410 || head.status === 403) {
      localStorage.removeItem(key);
      id = null;
    } else {
      throw await responseError(head, "Cannot resume upload");
    }
  }

  if (!id) {
    const res = await authenticatedFetch("/api/v1/uploads", getToken, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        original_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size: file.size,
        sha256: await expectedHash(file),
      }),
    });
    if (!res.ok) throw await responseError(res, "Cannot start upload");
    const session = (await res.json()) as UploadSession;
    if (!session.id || !Number.isSafeInteger(session.received_size) || session.received_size < 0 || session.received_size > file.size) {
      throw new Error("Server returned an invalid upload session");
    }
    id = session.id;
    offset = session.received_size;
    localStorage.setItem(key, id);
  }

  onProgress(Math.floor((offset / file.size) * 100));
  while (offset < file.size) {
    const chunk = file.slice(offset, Math.min(offset + CHUNK_BYTES, file.size));
    const res = await authenticatedFetch(`/api/v1/uploads/${encodeURIComponent(id)}`, getToken, {
      method: "PATCH",
      headers: { "Content-Type": "application/octet-stream", "Upload-Offset": String(offset) },
      body: chunk,
    });
    if (res.status === 409) {
      const serverOffset = Number(res.headers.get("upload-offset"));
      if (!Number.isSafeInteger(serverOffset) || serverOffset < 0 || serverOffset === offset || serverOffset > file.size) {
        throw new Error("Server returned an invalid resume offset");
      }
      offset = serverOffset;
      continue;
    }
    if (!res.ok) throw await responseError(res, "Upload interrupted. Select the same file to resume");
    const nextOffset = Number(res.headers.get("upload-offset"));
    if (!Number.isSafeInteger(nextOffset) || nextOffset <= offset || nextOffset > file.size) {
      throw new Error("Server returned an invalid upload offset");
    }
    offset = nextOffset;
    onProgress(Math.floor((offset / file.size) * 100));
  }

  const done = await authenticatedFetch(`/api/v1/uploads/${encodeURIComponent(id)}/complete`, getToken, { method: "POST" });
  if (!done.ok) throw await responseError(done, "Server rejected completed upload");
  const receipt = (await done.json()) as OffloadReceipt;
  if (!validAsset(receipt.asset, file)) throw new Error("Server returned an invalid media receipt");
  localStorage.removeItem(key);
  onProgress(100);
  return receipt;
}

export async function fetchOffloadAsset(id: string, getToken: TokenProvider): Promise<OffloadAsset> {
  const res = await authenticatedFetch(`/api/v1/media/${encodeURIComponent(id)}`, getToken);
  if (!res.ok) throw await responseError(res, "Cannot check saved media");
  return (await res.json()) as OffloadAsset;
}

/** Download through the signed-in website and compare with the selected local file. */
export async function verifyDownloadedOriginal(
  file: File,
  asset: OffloadAsset,
  getToken: TokenProvider
): Promise<"full" | "ranges"> {
  if (!validAsset(asset, file)) throw new Error("Saved media details do not match the selected file.");
  const path = `/api/v1/media/${encodeURIComponent(asset.id)}/content`;
  if (file.size <= FULL_DOWNLOAD_CHECK_BYTES && crypto.subtle) {
    const res = await authenticatedFetch(path, getToken);
    if (!res.ok) throw await responseError(res, "Cannot download saved original");
    const downloaded = await res.arrayBuffer();
    if (downloaded.byteLength !== file.size || await digest(downloaded) !== asset.sha256 ||
        await digest(await file.arrayBuffer()) !== asset.sha256) {
      throw new Error("Downloaded original differs from the selected file.");
    }
    return "full";
  }

  for (const start of [0, Math.max(0, file.size - RANGE_CHECK_BYTES)]) {
    const end = Math.min(file.size - 1, start + RANGE_CHECK_BYTES - 1);
    const res = await authenticatedFetch(path, getToken, {
      headers: { Range: `bytes=${start}-${end}` },
    });
    if (res.status !== 206) {
      await res.body?.cancel();
      throw new Error(`Saved original did not return a byte range (HTTP ${res.status}).`);
    }
    const received = new Uint8Array(await res.arrayBuffer());
    const source = new Uint8Array(await file.slice(start, end + 1).arrayBuffer());
    if (received.length !== source.length || received.some((byte, index) => byte !== source[index])) {
      throw new Error("Downloaded bytes differ from the selected file.");
    }
  }
  return "ranges";
}

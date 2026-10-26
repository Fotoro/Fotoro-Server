const CHUNK_BYTES = 16 * 1024 * 1024;

type UploadSession = { id: string; received_size: number };

function storageKey(file: File): string {
  return `fotoro-upload:${file.name}:${file.size}:${file.lastModified}`;
}

async function expectedHash(file: File): Promise<string | undefined> {
  // Web Crypto hashes in memory. Large files use the server's streaming hash.
  if (file.size > 32 * 1024 * 1024) return undefined;
  const bytes = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function uploadResumable(
  file: File,
  bearer: string,
  onProgress: (percent: number) => void
): Promise<void> {
  const headers = { Authorization: `Bearer ${bearer}` };
  const key = storageKey(file);
  let id = localStorage.getItem(key);
  let offset = 0;

  if (id) {
    const head = await fetch(`/api/fotoro/api/v1/uploads/${encodeURIComponent(id)}`, {
      method: "HEAD",
      headers,
    });
    if (head.ok && Number(head.headers.get("upload-length")) === file.size) {
      offset = Number(head.headers.get("upload-offset") ?? 0);
      if (!Number.isSafeInteger(offset) || offset < 0 || offset > file.size) {
        throw new Error("Server returned an invalid upload offset");
      }
    } else {
      localStorage.removeItem(key);
      id = null;
    }
  }

  if (!id) {
    const res = await fetch("/api/fotoro/api/v1/uploads", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        original_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size: file.size,
        sha256: await expectedHash(file),
      }),
    });
    if (!res.ok) throw new Error(`Cannot start upload (${res.status})`);
    const session = (await res.json()) as UploadSession;
    id = session.id;
    offset = session.received_size;
    localStorage.setItem(key, id);
  }

  onProgress(file.size === 0 ? 100 : Math.floor((offset / file.size) * 100));
  while (offset < file.size) {
    const chunk = file.slice(offset, Math.min(offset + CHUNK_BYTES, file.size));
    const res = await fetch(`/api/fotoro/api/v1/uploads/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/octet-stream", "Upload-Offset": String(offset) },
      body: chunk,
    });
    if (res.status === 409) {
      const serverOffset = Number(res.headers.get("upload-offset"));
      if (!Number.isSafeInteger(serverOffset) || serverOffset < 0 || serverOffset > file.size) {
        throw new Error("Server returned an invalid resume offset");
      }
      offset = serverOffset;
      continue;
    }
    if (!res.ok) throw new Error(`Upload interrupted (${res.status}); select the same file to resume`);
    offset = Number(res.headers.get("upload-offset"));
    if (!Number.isSafeInteger(offset) || offset > file.size) {
      throw new Error("Server returned an invalid upload offset");
    }
    onProgress(Math.floor((offset / file.size) * 100));
  }

  const done = await fetch(`/api/fotoro/api/v1/uploads/${encodeURIComponent(id)}/complete`, {
    method: "POST",
    headers,
  });
  if (!done.ok) throw new Error(`Server rejected completed upload (${done.status})`);
  localStorage.removeItem(key);
  onProgress(100);
}

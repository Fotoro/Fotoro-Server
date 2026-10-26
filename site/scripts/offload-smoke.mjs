#!/usr/bin/env node

// Upload one disposable image through the website proxy, interrupt at a chunk
// boundary, resume, and read the committed original and thumbnail back.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";

const filename = process.argv[2];
const origin = (process.env.FOTORO_TEST_ORIGIN || "http://127.0.0.1:3000").replace(/\/$/, "");
const token = process.env.FOTORO_TEST_TOKEN;
const requireBackup = process.argv.includes("--require-backup");

if (!filename || !token) {
  console.error("Usage: FOTORO_TEST_TOKEN=<owner Supabase access token> node scripts/offload-smoke.mjs <disposable-image> [--require-backup]");
  process.exit(2);
}

const source = await readFile(filename);
if (source.length < 2 || source.length > 32 * 1024 * 1024) {
  throw new Error("Choose a disposable image between 2 bytes and 32 MiB for this smoke test.");
}
const sha256 = createHash("sha256").update(source).digest("hex");
const ext = basename(filename).toLowerCase().split(".").pop();
if (!["jpg", "jpeg", "png"].includes(ext)) {
  throw new Error("Choose a disposable JPEG or PNG for the gallery thumbnail check.");
}
const mime = ext === "png" ? "image/png" : "image/jpeg";

async function request(path, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${origin}/api/fotoro${path}`, { ...init, headers, redirect: "manual" });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${init.method || "GET"} ${path}: HTTP ${response.status}: ${body.slice(0, 240)}`);
  }
  return response;
}

const me = await (await request("/api/v1/me")).json();
assert.equal(me.api_version, "v1");
console.log("Owner authorization: passed");

const created = await request("/api/v1/uploads", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ original_name: basename(filename), mime_type: mime, size: source.length, sha256 }),
});
const session = await created.json();
assert.ok(session.id);

const first = Math.max(1, Math.floor(source.length / 2));
const firstReply = await request(`/api/v1/uploads/${encodeURIComponent(session.id)}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/octet-stream", "Upload-Offset": "0" },
  body: source.subarray(0, first),
});
assert.equal(Number(firstReply.headers.get("upload-offset")), first);

const resumed = await request(`/api/v1/uploads/${encodeURIComponent(session.id)}`, { method: "HEAD" });
assert.equal(Number(resumed.headers.get("upload-offset")), first);
assert.equal(Number(resumed.headers.get("upload-length")), source.length);
console.log(`Interrupted and resumed after ${first} bytes: passed`);

let offset = first;
while (offset < source.length) {
  const end = Math.min(offset + 16 * 1024 * 1024, source.length);
  const reply = await request(`/api/v1/uploads/${encodeURIComponent(session.id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/octet-stream", "Upload-Offset": String(offset) },
    body: source.subarray(offset, end),
  });
  offset = Number(reply.headers.get("upload-offset"));
  assert.equal(offset, end);
}

const completed = await (await request(`/api/v1/uploads/${encodeURIComponent(session.id)}/complete`, { method: "POST" })).json();
assert.equal(completed.asset.sha256, sha256);
assert.equal(completed.asset.file_size, source.length);
assert.ok(completed.asset.verified_storage_copies >= 1);
console.log(`Committed original ${completed.asset.id}: SHA-256 passed`);

const assetPath = `/api/v1/media/${encodeURIComponent(completed.asset.id)}`;
let asset = await (await request(assetPath)).json();
assert.equal(asset.sha256, sha256);
const downloaded = Buffer.from(await (await request(`${assetPath}/content`)).arrayBuffer());
assert.equal(createHash("sha256").update(downloaded).digest("hex"), sha256);
console.log("Downloaded original: SHA-256 passed");

for (let attempt = 0; attempt < 20 && asset.preview_status === "pending"; attempt++) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  asset = await (await request(assetPath)).json();
}
assert.equal(asset.preview_status, "ready", `Thumbnail job ended as ${asset.preview_status}`);
const thumbnail = await request(`${assetPath}/thumbnail?size=small`);
assert.match(thumbnail.headers.get("content-type") || "", /^image\/jpeg/);
assert.ok((await thumbnail.arrayBuffer()).byteLength > 0);
console.log("Gallery thumbnail: passed");

const storage = await (await request("/api/v1/storage")).json();
console.log(`Backup: ${storage.available ? "available" : "unavailable"}; ${storage.verified} secondary copies verified; ${storage.pending} pending`);
if (requireBackup) {
  assert.equal(storage.available, true, "A separate backup mount is required");
  for (let attempt = 0; attempt < 20 && !asset.safe_to_delete; attempt++) {
    await request("/api/v1/storage/sync", { method: "POST" });
    asset = await (await request(assetPath)).json();
  }
  assert.equal(asset.safe_to_delete, true, "Two verified copies were not reached");
  console.log("Two independently verified copies: passed");
}

console.log("Offload smoke test passed. The disposable original remains in the Fotoro library.");

"use client";

import * as React from "react";
import { Check, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { getValidAccessToken } from "@/lib/fotoro-session";
import { useServerData } from "@/components/dashboard/server-data-provider";
import {
  fetchOffloadAsset,
  uploadResumable,
  verifyDownloadedOriginal,
  type OffloadAsset,
} from "@/lib/resumable-upload";

type UploadEntry = {
  id: number;
  file: File;
  progress: number;
  asset?: OffloadAsset;
  duplicate?: boolean;
  checking?: boolean;
  verification?: "full" | "ranges";
  error?: string;
};

export function UploadZone({ onUploaded }: { onUploaded?: () => void }) {
  const { endpoint } = useServerData();
  const [entries, setEntries] = React.useState<UploadEntry[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const nextId = React.useRef(0);
  const busyRef = React.useRef(false);

  function updateEntry(id: number, changes: Partial<UploadEntry>) {
    setEntries((current) => current.map((entry) => entry.id === id ? { ...entry, ...changes } : entry));
  }

  async function uploadFiles(files: FileList) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const id = ++nextId.current;
        setEntries((current) => [{ id, file, progress: 0 }, ...current]);
        try {
          const receipt = await uploadResumable(
            file, getValidAccessToken, (progress) => updateEntry(id, { progress }), endpoint
          );
          updateEntry(id, { progress: 100, asset: receipt.asset, duplicate: receipt.duplicate });
          onUploaded?.();
          // Derivatives are generated after the original is safely committed.
          window.setTimeout(() => onUploaded?.(), 5000);
        } catch (error) {
          updateEntry(id, {
            error: error instanceof Error ? error.message : "Upload failed. Select the file again to resume.",
          });
        }
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function checkBackup(entry: UploadEntry) {
    if (!entry.asset) return;
    updateEntry(entry.id, { checking: true, error: undefined });
    try {
      const asset = await fetchOffloadAsset(entry.asset.id, getValidAccessToken, endpoint);
      updateEntry(entry.id, { asset, checking: false });
      onUploaded?.();
    } catch (error) {
      updateEntry(entry.id, { checking: false, error: error instanceof Error ? error.message : "Status check failed" });
    }
  }

  async function checkDownload(entry: UploadEntry) {
    if (!entry.asset) return;
    updateEntry(entry.id, { checking: true, error: undefined });
    try {
      const result = await verifyDownloadedOriginal(entry.file, entry.asset, getValidAccessToken, endpoint);
      updateEntry(entry.id, { checking: false, verification: result });
    } catch (error) {
      updateEntry(entry.id, { checking: false, error: error instanceof Error ? error.message : "Read-back check failed" });
    }
  }

  return (
    <section className="self-start rounded-xl border border-border bg-card ring-soft" aria-label="Offload photos and videos">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Upload className="size-4 text-foreground" />
          <h3 className="text-sm font-semibold tracking-tight">Offload photos and videos</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Originals are checked before saving. If a transfer stops, select the same file to resume.
        </p>
      </div>

      <div
        className={`m-5 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-foreground/40 bg-accent/30" : "border-border hover:border-foreground/25"
        }`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (event.dataTransfer.files.length) void uploadFiles(event.dataTransfer.files);
        }}
        onClick={() => { if (!busy) inputRef.current?.click(); }}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (!busy && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-disabled={busy}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/mp4,video/quicktime,video/webm,video/x-matroska"
          className="hidden"
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            if (event.target.files?.length) void uploadFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <ImageIcon className="mx-auto mb-3 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {busy ? "Uploading selected files…" : "Click or drag photos and videos here"}
        </p>
      </div>

      {entries.length > 0 ? (
        <div className="max-h-[30rem] overflow-y-auto border-t border-border">
          {entries.map((entry) => (
            <div key={entry.id} className="border-b border-border px-5 py-3 text-xs last:border-b-0">
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate font-medium" title={entry.file.name}>{entry.file.name}</span>
                {entry.checking ? <Loader2 className="size-4 animate-spin" /> : entry.error ?
                  <X className="size-4 text-red-400" /> : entry.asset ?
                  <Check className="size-4 text-green-400" /> :
                  <span className="tabular-nums text-muted-foreground">{entry.progress}%</span>}
              </div>
              {entry.error ? <p className="mt-1 text-red-400">{entry.error}</p> : null}
              {entry.asset ? (
                <div className="mt-2 space-y-1 text-muted-foreground">
                  <p>{entry.duplicate ? "Already saved in your library" : "Original saved and SHA-256 checked"} · {entry.asset.id.slice(0, 12)}…</p>
                  <p>{entry.asset.safe_to_delete ? "Two verified copies · safe to delete from phone" :
                    `${entry.asset.verified_storage_copies} verified copy · keep the phone copy`}</p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <a href={`/api/fotoro${entry.asset.content_url}`} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2">
                      Open original
                    </a>
                    <button type="button" onClick={() => void checkBackup(entry)} disabled={entry.checking} className="text-foreground underline underline-offset-2 disabled:opacity-50">
                      Check backup
                    </button>
                    <button type="button" onClick={() => void checkDownload(entry)} disabled={entry.checking} className="text-foreground underline underline-offset-2 disabled:opacity-50">
                      Verify download
                    </button>
                  </div>
                  {entry.verification ? (
                    <p className="text-green-400">{entry.verification === "full" ? "Full downloaded SHA-256 matches the selected file." : "First and last downloaded ranges match the selected file; the server verified the full SHA-256."}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

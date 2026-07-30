"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ImageIcon, Loader2, Play, RefreshCcw, Upload, X } from "lucide-react";
import type { NodePublic } from "@/lib/fotoro-local";
import { Button } from "@/components/ui/button";

type UploadState = Record<string, number>;

export function UploadZone({
  node: _node,
  supabaseToken,
  onUploaded,
}: {
  node: NodePublic;
  supabaseToken: string;
  onUploaded?: () => void;
}) {
  const [progress, setProgress] = React.useState<UploadState>({});
  const [dragging, setDragging] = React.useState(false);
  const [pending, setPending] = React.useState<number | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const refreshQueue = React.useCallback(async () => {
    try {
      const res = await fetch("/api/fotoro/api/scheduler/status", {
        headers: { Authorization: `Bearer ${supabaseToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPending(typeof data.pending === "number" ? data.pending : 0);
        setProcessing(Boolean(data.processing));
      }
    } catch {}
  }, [supabaseToken]);

  React.useEffect(() => {
    void refreshQueue();
    const id = window.setInterval(() => void refreshQueue(), 5000);
    return () => window.clearInterval(id);
  }, [refreshQueue]);

  async function uploadFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("image", file);
      setProgress((prev) => ({ ...prev, [file.name]: 0 }));

      try {
        const res = await fetch("/api/fotoro/api/web/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${supabaseToken}` },
          body: formData,
        });
        if (res.ok) {
          onUploaded?.();
          void refreshQueue();
        }
        setProgress((prev) => ({
          ...prev,
          [file.name]: res.ok ? 100 : -1,
        }));
      } catch {
        setProgress((prev) => ({ ...prev, [file.name]: -1 }));
      }
    }
  }

  async function processPending() {
    setProcessing(true);
    try {
      const res = await fetch("/api/fotoro/api/scheduler/run", {
        method: "POST",
        headers: { Authorization: `Bearer ${supabaseToken}` },
      });
      if (res.ok) {
        window.setTimeout(() => {
          void refreshQueue();
          onUploaded?.();
        }, 1500);
      } else {
        void refreshQueue();
      }
    } catch {
      void refreshQueue();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border border-border bg-card ring-soft"
    >
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Upload className="size-4 text-foreground" />
          <h3 className="text-sm font-semibold tracking-tight">Upload photos</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Uploads go to your server via the secure Vercel → Tailscale tunnel.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground">
            {pending == null ? "Queue: --" : `${pending} pending`}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void refreshQueue()}
          >
            <RefreshCcw className="mr-2 size-3.5" />
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void processPending()}
            disabled={processing || !pending}
          >
            {processing ? (
              <Loader2 className="mr-2 size-3.5 animate-spin" />
            ) : (
              <Play className="mr-2 size-3.5" />
            )}
            Process pending
          </Button>
        </div>
      </div>

      <div
        className={`m-5 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragging
            ? "border-foreground/40 bg-accent/30"
            : "border-border hover:border-foreground/25"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        <ImageIcon className="mx-auto mb-3 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Click or drag photos here
        </p>
      </div>

      <AnimatePresence>
        {Object.entries(progress).map(([name, value]) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 border-t border-border px-5 py-2.5 text-sm"
          >
            <span className="flex-1 truncate text-muted-foreground">{name}</span>
            {value === 100 ? (
              <Check className="size-4 text-green-400" />
            ) : value < 0 ? (
              <X className="size-4 text-red-400" />
            ) : (
              <span className="text-xs text-muted-foreground">{value}%</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

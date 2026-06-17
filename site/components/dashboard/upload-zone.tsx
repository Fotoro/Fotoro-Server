"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ImageIcon, Upload, X } from "lucide-react";
import { getNodeBaseUrl, type NodePublic } from "@/lib/fotoro-local";

type UploadState = Record<string, number>;

export function UploadZone({
  node,
  supabaseToken,
}: {
  node: NodePublic;
  supabaseToken: string;
}) {
  const [progress, setProgress] = React.useState<UploadState>({});
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const serverUrl = React.useMemo(() => getNodeBaseUrl(node), [node]);

  async function uploadFiles(files: FileList) {
    if (!serverUrl) {
      alert("No funnel URL — run ./fotoro server");
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("image", file);
      setProgress((prev) => ({ ...prev, [file.name]: 0 }));

      try {
        const res = await fetch(`${serverUrl}/api/web/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${supabaseToken}` },
          body: formData,
        });
        setProgress((prev) => ({
          ...prev,
          [file.name]: res.ok ? 100 : -1,
        }));
      } catch {
        setProgress((prev) => ({ ...prev, [file.name]: -1 }));
      }
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
          Uploads go directly to your server via your secure funnel URL.
        </p>
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

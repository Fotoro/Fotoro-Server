"use client";
/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import { ChevronLeft, ChevronRight, ExternalLink, FileText, Maximize2, Minus, Plus, X } from "lucide-react";
import { formatBytes } from "@/lib/fotoro-server-data";
import type { GalleryPhoto } from "@/lib/fotoro-local";

type ViewerProps = {
  photo: GalleryPhoto;
  previous?: GalleryPhoto;
  next?: GalleryPhoto;
  position: number;
  total: number;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const clampZoom = (value: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));

export function PhotoViewer({ photo, previous, next, position, total, hasNext, onPrevious, onNext, onClose }: ViewerProps) {
  const isVideo = photo.media_kind === "video";
  const isDocument = photo.media_kind === "document";
  const isPhoto = !isVideo && !isDocument;
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const pointers = React.useRef(new Map<number, { x: number; y: number }>());
  const drag = React.useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const pinch = React.useRef<{ distance: number; zoom: number } | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [previewSrc, setPreviewSrc] = React.useState(photo.preview || photo.thumbnail);
  const [previewReady, setPreviewReady] = React.useState(false);
  const [detailSrc, setDetailSrc] = React.useState(photo.detail || "");
  const [detailReady, setDetailReady] = React.useState(false);
  const [originalSrc, setOriginalSrc] = React.useState(photo.original || photo.originalFallback || "");
  const [requestOriginal, setRequestOriginal] = React.useState(false);
  const [originalReady, setOriginalReady] = React.useState(false);
  const previousPreview = previous?.media_kind === "document" ? undefined : previous?.preview;
  const nextPreview = next?.media_kind === "document" ? undefined : next?.preview;

  React.useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setPreviewSrc(photo.preview || photo.thumbnail);
    setPreviewReady(false);
    setDetailSrc(photo.detail || "");
    setDetailReady(false);
    setOriginalSrc(photo.original || photo.originalFallback || "");
    setRequestOriginal(false);
    setOriginalReady(false);
    pointers.current.clear();
    drag.current = null;
    pinch.current = null;
    // Older images without a 2048 px tier still load the original on pause.
    // With that tier available, the original is only needed at deep zoom.
    const timer = !isPhoto || photo.detail ? undefined : window.setTimeout(() => setRequestOriginal(true), 850);
    return () => { if (timer !== undefined) window.clearTimeout(timer); };
  }, [photo.id, photo.preview, photo.thumbnail, photo.detail, photo.original, photo.originalFallback, isPhoto]);

  React.useEffect(() => {
    if (isPhoto && zoom > 1.75) setRequestOriginal(true);
  }, [isPhoto, zoom]);

  React.useEffect(() => {
    for (const preview of [previousPreview, nextPreview]) {
      if (preview) {
        const image = new Image();
        image.src = preview;
      }
    }
  }, [previousPreview, nextPreview]);

  const changeZoom = React.useCallback((factor: number) => {
    if (!isPhoto) return;
    setZoom((current) => {
      const value = clampZoom(current * factor);
      return value;
    });
  }, [isPhoto]);

  React.useEffect(() => {
    if (zoom === 1) setOffset({ x: 0, y: 0 });
  }, [zoom]);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !isPhoto) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      changeZoom(event.deltaY < 0 ? 1.2 : 1 / 1.2);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [changeZoom, isPhoto]);

  React.useEffect(() => {
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft") { event.preventDefault(); onPrevious(); }
      else if (event.key === "ArrowRight") { event.preventDefault(); onNext(); }
      else if (isPhoto && (event.key === "+" || event.key === "=")) { event.preventDefault(); changeZoom(1.25); }
      else if (isPhoto && event.key === "-") { event.preventDefault(); changeZoom(1 / 1.25); }
      else if (isPhoto && event.key === "0") { event.preventDefault(); setZoom(1); setOffset({ x: 0, y: 0 }); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = priorOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, onPrevious, onNext, changeZoom, isPhoto]);

  function pointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!isPhoto) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom };
      drag.current = null;
    } else if (zoom > 1) {
      drag.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y };
    }
  }

  function pointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId) || !isPhoto) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const value = clampZoom(pinch.current.zoom * distance / Math.max(1, pinch.current.distance));
      setZoom(value);
      if (value > 1.75) setRequestOriginal(true);
    } else if (drag.current && zoom > 1) {
      const stage = stageRef.current;
      const maxX = (stage?.clientWidth ?? 0) * (zoom - 1) / 2;
      const maxY = (stage?.clientHeight ?? 0) * (zoom - 1) / 2;
      setOffset({
        x: Math.max(-maxX, Math.min(maxX, drag.current.offsetX + event.clientX - drag.current.x)),
        y: Math.max(-maxY, Math.min(maxY, drag.current.offsetY + event.clientY - drag.current.y)),
      });
    }
  }

  function pointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    pinch.current = null;
    drag.current = null;
    if (zoom <= 1) setOffset({ x: 0, y: 0 });
  }

  const title = photo.originalName || photo.caption?.trim() || "Media item";
  const original = photo.original || photo.originalFallback || "";

  return (
    <div role="dialog" aria-modal="true" aria-label={`${title}, item ${position} of ${total}`} className="fixed inset-0 z-[60] flex flex-col bg-[hsl(220_12%_5%)] text-white" onClick={onClose}>
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-white/15 px-3 sm:px-5" onClick={(event) => event.stopPropagation()}>
        <div className="min-w-0"><p className="truncate text-sm font-medium">{title}</p><p className="font-mono text-[11px] text-white/55">{position.toLocaleString()} / {total.toLocaleString()}</p></div>
        <div className="flex items-center gap-1">
          {isPhoto ? <>
            <button type="button" onClick={() => changeZoom(1 / 1.25)} aria-label="Zoom out" className="rounded p-2 hover:bg-white/10"><Minus className="size-5" /></button>
            <span className="w-12 text-center font-mono text-xs text-white/70">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => changeZoom(1.25)} aria-label="Zoom in" className="rounded p-2 hover:bg-white/10"><Plus className="size-5" /></button>
            <button type="button" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} aria-label="Fit image" className="rounded p-2 hover:bg-white/10"><Maximize2 className="size-5" /></button>
          </> : null}
          {original ? <a href={original} target="_blank" rel="noreferrer" referrerPolicy="no-referrer" aria-label="Open original" className="rounded p-2 hover:bg-white/10"><ExternalLink className="size-5" /></a> : null}
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close viewer" className="rounded p-2 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><X className="size-5" /></button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onPrevious} disabled={position <= 1} aria-label="Previous image" className="absolute left-2 z-20 rounded-full border border-white/20 bg-black/60 p-2.5 hover:bg-black/80 disabled:opacity-25 sm:left-5"><ChevronLeft className="size-6" /></button>
        <div ref={stageRef} className="relative size-full overflow-hidden bg-black/60" style={{ touchAction: isPhoto ? "none" : "auto" }} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onDoubleClick={() => { if (zoom > 1) { setZoom(1); setOffset({ x: 0, y: 0 }); } else changeZoom(2); }}>
          {isVideo ? (
            <video key={photo.id} src={original} controls preload="metadata" className="size-full object-contain" />
          ) : isDocument ? (
            photo.mimeType === "application/pdf" && original ? (
              <iframe key={photo.id} src={original} title={title} referrerPolicy="no-referrer" className="size-full border-0 bg-white" />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-4 text-white/70">
                <FileText className="size-16" />
                <p className="max-w-md truncate px-4 text-sm">{title}</p>
                {original ? <a href={original} target="_blank" rel="noreferrer" referrerPolicy="no-referrer" className="rounded border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10">Open document</a> : null}
              </div>
            )
          ) : (
            <div className="relative size-full" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: "center", cursor: zoom > 1 ? "grab" : "zoom-in" }}>
              {photo.thumbnail && !previewReady ? <img src={photo.thumbnail} alt="" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-contain blur-lg" /> : null}
              {previewSrc ? <img key={`${photo.id}:preview`} src={previewSrc} alt="" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-contain" onLoad={() => setPreviewReady(true)} onError={() => { if (photo.previewFallback && previewSrc !== photo.previewFallback) setPreviewSrc(photo.previewFallback); else setPreviewSrc(""); }} /> : null}
              {detailSrc ? <img key={`${photo.id}:detail`} src={detailSrc} alt="" referrerPolicy="no-referrer" className={`absolute inset-0 size-full object-contain transition-opacity duration-200 ${detailReady ? "opacity-100" : "opacity-0"}`} onLoad={() => setDetailReady(true)} onError={() => { if (photo.detailFallback && detailSrc !== photo.detailFallback) setDetailSrc(photo.detailFallback); else { setDetailSrc(""); setRequestOriginal(true); } }} /> : null}
              {requestOriginal && originalSrc ? <img key={`${photo.id}:original`} src={originalSrc} alt={title} referrerPolicy="no-referrer" className={`absolute inset-0 size-full object-contain transition-opacity duration-200 ${originalReady ? "opacity-100" : "opacity-0"}`} onLoad={() => setOriginalReady(true)} onError={() => { if (photo.originalFallback && originalSrc !== photo.originalFallback) setOriginalSrc(photo.originalFallback); else setOriginalSrc(""); }} /> : null}
              {!previewSrc && !originalReady ? <div className="absolute inset-0 flex items-center justify-center text-sm text-white/60">Preview unavailable</div> : null}
            </div>
          )}
        </div>
        <button type="button" onClick={onNext} disabled={!hasNext} aria-label="Next image" className="absolute right-2 z-20 rounded-full border border-white/20 bg-black/60 p-2.5 hover:bg-black/80 disabled:opacity-25 sm:right-5"><ChevronRight className="size-6" /></button>
      </div>

      <footer className="flex min-h-12 flex-wrap items-center gap-x-5 gap-y-1 border-t border-white/15 px-4 py-2 font-mono text-[11px] text-white/60" onClick={(event) => event.stopPropagation()}>
        <span>{isVideo ? "Video" : isDocument ? "Document" : originalReady ? "Original resolution" : detailReady ? "Display detail" : "Display preview"}</span>
        {photo.width && photo.height ? <span>{photo.width} × {photo.height}</span> : null}
        {photo.fileSize ? <span>{formatBytes(photo.fileSize)}</span> : null}
        {photo.taken_at ? <span>{new Date(photo.taken_at).toLocaleString()}</span> : null}
        {photo.safe_to_delete !== undefined ? <span>{photo.safe_to_delete ? "Two verified copies" : "Keep source copy"}</span> : null}
        <span className="ml-auto hidden sm:inline">← → browse · scroll or pinch to zoom · drag to pan</span>
      </footer>
    </div>
  );
}

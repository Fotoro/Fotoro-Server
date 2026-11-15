"use client";

import * as React from "react";
import { FileText, Film, ImageIcon } from "lucide-react";
import type { GalleryPhoto } from "@/lib/fotoro-local";

/** Square thumbnail tile with the same src→fallback behaviour as the gallery grid. */
export function MediaThumb({ photo, onOpen }: { photo: GalleryPhoto; onOpen: () => void }) {
  const [src, setSrc] = React.useState(photo.thumbnail);
  React.useEffect(() => setSrc(photo.thumbnail), [photo.thumbnail]);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${photo.originalName || photo.caption || photo.media_kind || "media"}`}
      className="group relative block aspect-square w-full overflow-hidden rounded-lg bg-muted/30"
    >
      {photo.media_kind === "document" ? (
        <span className="flex size-full items-center justify-center text-muted-foreground"><FileText className="size-6" /></span>
      ) : src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setSrc(src !== photo.thumbnailFallback ? photo.thumbnailFallback || "" : "")}
        />
      ) : (
        <span className="flex size-full items-center justify-center text-muted-foreground">
          {photo.media_kind === "video" ? <Film className="size-6" /> : <ImageIcon className="size-6" />}
        </span>
      )}
    </button>
  );
}

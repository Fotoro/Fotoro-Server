"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  fetchPhotos,
  fetchThumb,
  photoUrl,
  searchPhotos,
  type GalleryPhoto,
} from "@/lib/fotoro-local";

export function PhotoGallery({
  baseUrl,
  supabaseToken,
}: {
  baseUrl: string;
  supabaseToken: string;
}) {
  const [photos, setPhotos] = React.useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [selected, setSelected] = React.useState<GalleryPhoto | null>(null);
  const [thumbUrls, setThumbUrls] = React.useState<Record<string, string>>({});

  const loadPhotos = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchPhotos(baseUrl, supabaseToken);
      setPhotos(list);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, supabaseToken]);

  React.useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  React.useEffect(() => {
    let cancelled = false;
    async function loadThumbs() {
      for (const photo of photos) {
        if (thumbUrls[photo.id] || cancelled) continue;
        try {
          const url = await fetchThumb(baseUrl, supabaseToken, photo);
          if (!cancelled) {
            setThumbUrls((prev) => ({ ...prev, [photo.id]: url }));
          }
        } catch {
          /* skip broken thumb */
        }
      }
    }
    if (photos.length) void loadThumbs();
    return () => {
      cancelled = true;
    };
  }, [photos, baseUrl, supabaseToken]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) {
      void loadPhotos();
      return;
    }
    setSearching(true);
    try {
      const results = await searchPhotos(baseUrl, supabaseToken, query.trim());
      setPhotos(results);
    } catch {
      setPhotos([]);
    } finally {
      setSearching(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading photos from your server…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your library (dog, beach, sunset…)"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline" disabled={searching}>
          {searching ? <Loader2 className="size-4 animate-spin" /> : "Search"}
        </Button>
        {query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setQuery("");
              void loadPhotos();
            }}
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </form>

      {photos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <ImageIcon className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No photos yet. Upload from the dashboard or run the scheduler on your server.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {photos.map((photo) => (
            <motion.button
              key={photo.id}
              type="button"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/30"
              onClick={() => setSelected(photo)}
            >
              {thumbUrls[photo.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbUrls[photo.id]}
                  alt={photo.caption || photo.id}
                  className="size-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="max-h-[90vh] max-w-4xl overflow-hidden rounded-xl border border-border bg-card"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Full-res loaded with auth via fetch in production; img src won't send Bearer */}
              <AuthenticatedImage
                src={photoUrl(baseUrl, selected.id)}
                token={supabaseToken}
                alt={selected.caption}
              />
              {selected.caption ? (
                <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                  {selected.caption}
                </p>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function AuthenticatedImage({
  src,
  token,
  alt,
}: {
  src: string;
  token: string;
  alt: string;
}) {
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let revoked: string | null = null;
    fetch(src, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((b) => {
        const u = URL.createObjectURL(b);
        revoked = u;
        setBlobUrl(u);
      })
      .catch(() => setBlobUrl(null));
    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [src, token]);

  if (!blobUrl) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={blobUrl} alt={alt} className="max-h-[80vh] w-full object-contain" />
  );
}

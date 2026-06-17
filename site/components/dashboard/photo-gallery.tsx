"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchPhotosPage } from "@/lib/fotoro-server-data";
import { photoUrl, searchPhotos, type GalleryPhoto } from "@/lib/fotoro-local";
import { useServerData } from "@/components/dashboard/server-data-provider";

const PAGE_SIZE = 60;

function thumbProxyPath(photo: GalleryPhoto): string {
  const base = photo.thumbnail.startsWith("/")
    ? photo.thumbnail
    : `/thumb/${photo.id}?size=medium`;
  const path = base.replace(/^\//, "");
  return `/api/fotoro/${path}`;
}

function LazyThumb({ photo }: { photo: GalleryPhoto }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible(true);
      },
      { rootMargin: "320px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="size-full bg-muted/20">
      {visible ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbProxyPath(photo)}
          alt=""
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : null}
    </div>
  );
}

export function PhotoGallery() {
  const { token } = useServerData();
  const [photos, setPhotos] = React.useState<GalleryPhoto[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [selected, setSelected] = React.useState<GalleryPhoto | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const loadPage = React.useCallback(
    async (p: number, append: boolean) => {
      if (!token) return;
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const data = await fetchPhotosPage(token, p, PAGE_SIZE);
        setTotal(data.total);
        setPage(data.page);
        setPhotos((prev) => (append ? [...prev, ...data.photos] : data.photos));
      } catch {
        if (!append) {
          setPhotos([]);
          setTotal(0);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [token]
  );

  React.useEffect(() => {
    if (token) void loadPage(1, false);
  }, [token, loadPage]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el || loading || loadingMore) return;

    function onScroll() {
      if (!el) return;
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 400;
      if (nearBottom && photos.length < total && !loadingMore) {
        void loadPage(page + 1, true);
      }
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [photos.length, total, page, loading, loadingMore, loadPage]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!query.trim()) {
      void loadPage(1, false);
      return;
    }
    setSearching(true);
    try {
      const results = await searchPhotos(null, token, query.trim(), 120);
      setPhotos(results);
      setTotal(results.length);
      setPage(1);
    } catch {
      setPhotos([]);
      setTotal(0);
    } finally {
      setSearching(false);
    }
  }

  if (!token) return null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <form onSubmit={handleSearch} className="flex shrink-0 gap-2">
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
              void loadPage(1, false);
            }}
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </form>

      <div className="min-h-0 flex-1 rounded-xl border border-border bg-card/40 ring-soft">
        <div
          ref={scrollRef}
          className="h-[min(70vh,720px)] overflow-y-auto overscroll-contain p-3"
        >
          {loading ? (
            <div className="flex h-full min-h-[240px] items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" />
              Loading photos…
            </div>
          ) : photos.length === 0 ? (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
              <ImageIcon className="mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No photos indexed yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {photos.map((photo) => (
                  <motion.button
                    key={photo.id}
                    type="button"
                    layout
                    className="aspect-square overflow-hidden rounded-md border border-border bg-muted/30 transition hover:border-foreground/30"
                    onClick={() => setSelected(photo)}
                  >
                    <LazyThumb photo={photo} />
                  </motion.button>
                ))}
              </div>
              {loadingMore ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : null}
              <p className="py-3 text-center text-[11px] text-muted-foreground">
                {photos.length.toLocaleString()} of {total.toLocaleString()} photos
              </p>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              className="flex max-h-[92vh] max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-card"
              onClick={(e) => e.stopPropagation()}
            >
              <AuthenticatedImage src={photoUrl(null, selected.id)} alt="" />
              <div className="border-t border-border px-4 py-3 text-sm">
                <p className="font-medium text-foreground">
                  {selected.caption?.trim() || "No description"}
                </p>
                {selected.category ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selected.category}
                    {selected.taken_at
                      ? ` · ${new Date(selected.taken_at).toLocaleString()}`
                      : ""}
                  </p>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function AuthenticatedImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <div className="flex h-[min(60vh,520px)] w-full items-center justify-center bg-muted/20 text-sm text-muted-foreground">
        Failed to load image
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="max-h-[min(60vh,520px)] w-full object-contain"
      onError={() => setFailed(true)}
    />
  );
}

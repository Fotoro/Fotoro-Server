"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchPhotosPage } from "@/lib/fotoro-server-data";
import { photoUrl, searchPhotos, type GalleryPhoto } from "@/lib/fotoro-local";
import { useServerData } from "@/components/dashboard/server-data-provider";

const PAGE_SIZE = 100;
const EAGER_COUNT = 24;

function mergePhotos(prev: GalleryPhoto[], next: GalleryPhoto[]): GalleryPhoto[] {
  if (next.length === 0) return prev;
  const seen = new Set(prev.map((p) => p.id));
  const added = next.filter((p) => !seen.has(p.id));
  return added.length === 0 ? prev : [...prev, ...added];
}

function LazyThumb({ photo, index }: { photo: GalleryPhoto; index: number }) {
  const eager = index < EAGER_COUNT;

  return (
    <div className="size-full bg-muted/20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.thumbnail}
        alt=""
        className="size-full object-cover"
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={index < 8 ? "high" : "auto"}
      />
    </div>
  );
}

export function PhotoGallery() {
  const { token, connectError } = useServerData();
  const [photos, setPhotos] = React.useState<GalleryPhoto[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [selected, setSelected] = React.useState<GalleryPhoto | null>(null);

  const pageRef = React.useRef(1);
  const totalRef = React.useRef(0);
  const fetchingRef = React.useRef(false);
  const prefetchRef = React.useRef<Map<number, GalleryPhoto[]>>(new Map());
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  const prefetchPage = React.useCallback(
    (p: number) => {
      if (!token || prefetchRef.current.has(p)) return;
      void fetchPhotosPage(token, p, PAGE_SIZE, totalRef.current)
        .then((data) => {
          if (data.photos.length > 0) prefetchRef.current.set(p, data.photos);
        })
        .catch(() => {});
    },
    [token]
  );

  const loadPage = React.useCallback(
    async (p: number, append: boolean) => {
      if (!token || fetchingRef.current) return;
      fetchingRef.current = true;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const cached = append ? prefetchRef.current.get(p) : undefined;
        if (cached) prefetchRef.current.delete(p);

        const data = cached
          ? {
              photos: cached,
              total: totalRef.current,
              page: p,
              limit: PAGE_SIZE,
              count: cached.length,
            }
          : await fetchPhotosPage(
              token,
              p,
              PAGE_SIZE,
              append ? totalRef.current : undefined
            );

        totalRef.current = data.total;
        pageRef.current = p;
        setTotal(data.total);
        setPhotos((prev) => {
          const merged = append ? mergePhotos(prev, data.photos) : data.photos;
          if (merged.length < data.total && data.photos.length === PAGE_SIZE) {
            prefetchPage(p + 1);
          }
          return merged;
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load photos";
        setError(msg);
        if (!append) {
          setPhotos([]);
          setTotal(0);
          totalRef.current = 0;
          pageRef.current = 1;
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        fetchingRef.current = false;
      }
    },
    [token, prefetchPage]
  );

  const loadMore = React.useCallback(() => {
    if (fetchingRef.current) return;
    if (photos.length >= totalRef.current) return;
    void loadPage(pageRef.current + 1, true);
  }, [photos.length, loadPage]);

  React.useEffect(() => {
    if (!token) return;
    pageRef.current = 1;
    totalRef.current = 0;
    prefetchRef.current.clear();
    void loadPage(1, false);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (query || loading) return;
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "800px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [query, loading, photos.length, loadMore]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    prefetchRef.current.clear();
    if (!query.trim()) {
      pageRef.current = 1;
      void loadPage(1, false);
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const results = await searchPhotos(null, token, query.trim());
      setPhotos(results);
      setTotal(results.length);
      totalRef.current = results.length;
      pageRef.current = 1;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setPhotos([]);
      setTotal(0);
      totalRef.current = 0;
    } finally {
      setSearching(false);
    }
  }

  if (!token) return null;

  const displayError = error ?? connectError;
  const hasMore = !query && photos.length < total;

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
              pageRef.current = 1;
              prefetchRef.current.clear();
              void loadPage(1, false);
            }}
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </form>

      {displayError ? (
        <p className="shrink-0 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
          {displayError}
        </p>
      ) : null}

      <div className="min-h-0 flex-1 rounded-xl border border-border bg-card/40 ring-soft">
        <div className="h-[min(70vh,720px)] overflow-y-auto overscroll-contain p-3">
          {loading ? (
            <div className="flex h-full min-h-[240px] items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" />
              Loading photos…
            </div>
          ) : photos.length === 0 ? (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
              <ImageIcon className="mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {displayError ? "Could not load library." : "No photos indexed yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    className="aspect-square overflow-hidden rounded-md border border-border bg-muted/30 transition hover:border-foreground/30"
                    onClick={() => setSelected(photo)}
                  >
                    <LazyThumb photo={photo} index={index} />
                  </button>
                ))}
              </div>

              <div ref={sentinelRef} className="h-2 w-full" aria-hidden />

              {loadingMore ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : hasMore ? (
                <p className="py-2 text-center text-[10px] text-muted-foreground">
                  Scroll for more…
                </p>
              ) : null}

              <p className="py-3 text-center text-[11px] text-muted-foreground">
                {photos.length.toLocaleString()} of {total.toLocaleString()} photos · secure relay
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
                  <p className="mt-1 text-xs text-muted-foreground">{selected.category}</p>
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
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

"use client";

import * as React from "react";
import { useServerData } from "@/components/dashboard/server-data-provider";
import { MediaThumb } from "@/components/dashboard/media-thumb";
import { PhotoViewer } from "@/components/dashboard/photo-viewer";
import { fetchOnThisDay } from "@/lib/fotoro-server-data";
import type { GalleryPhoto } from "@/lib/fotoro-local";

export function OnThisDayCard() {
  const { token, endpoint, online } = useServerData();
  const [photos, setPhotos] = React.useState<GalleryPhoto[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  React.useEffect(() => {
    if (!token || online !== "online") return;
    let cancelled = false;
    fetchOnThisDay(token, endpoint)
      .then((items) => {
        if (!cancelled) {
          setPhotos(items);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [token, endpoint, online]);

  const groups = React.useMemo(() => {
    const map = new Map<string, number[]>();
    photos.forEach((photo, index) => {
      const stamp = photo.taken_at ?? photo.added_at ?? "";
      const year = /^\d{4}/.test(stamp) ? stamp.slice(0, 4) : "Earlier";
      const list = map.get(year) ?? [];
      list.push(index);
      map.set(year, list);
    });
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [photos]);

  if (!loaded || photos.length === 0) return null;

  const selected = selectedIndex >= 0 ? photos[selectedIndex] : null;

  return (
    <section className="matrix-panel p-5" aria-labelledby="on-this-day-title">
      <h2 id="on-this-day-title" className="text-lg font-medium">
        On this day
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Moments captured on this date in earlier years.
      </p>
      <div className="mt-4 space-y-4">
        {groups.map(([year, indexes]) => (
          <div key={year}>
            <p className="matrix-label">{year}</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {indexes.map((index) => (
                <MediaThumb key={photos[index].id} photo={photos[index]} onOpen={() => setSelectedIndex(index)} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {selected ? (
        <PhotoViewer
          key={selected.id}
          photo={selected}
          previous={selectedIndex > 0 ? photos[selectedIndex - 1] : undefined}
          next={selectedIndex + 1 < photos.length ? photos[selectedIndex + 1] : undefined}
          position={selectedIndex + 1}
          total={photos.length}
          hasNext={selectedIndex + 1 < photos.length}
          onPrevious={() => setSelectedIndex((current) => Math.max(0, current - 1))}
          onNext={() => setSelectedIndex((current) => Math.min(photos.length - 1, current + 1))}
          onClose={() => setSelectedIndex(-1)}
        />
      ) : null}
    </section>
  );
}

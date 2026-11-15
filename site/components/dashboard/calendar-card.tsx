"use client";

import * as React from "react";
import { useServerData } from "@/components/dashboard/server-data-provider";
import { MediaThumb } from "@/components/dashboard/media-thumb";
import { PhotoViewer } from "@/components/dashboard/photo-viewer";
import {
  fetchCalendar,
  fetchCalendarDay,
  formatCount,
  type CalendarYearNode,
} from "@/lib/fotoro-server-data";
import type { GalleryPhoto } from "@/lib/fotoro-local";
import { cn } from "@/lib/utils";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function CalendarCard() {
  const { token, endpoint, online } = useServerData();
  const [years, setYears] = React.useState<CalendarYearNode[]>([]);
  const [missingDates, setMissingDates] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);
  const [openYear, setOpenYear] = React.useState<number | null>(null);
  const [openMonth, setOpenMonth] = React.useState<string | null>(null);
  const [dayDate, setDayDate] = React.useState<string | null>(null);
  const [dayPhotos, setDayPhotos] = React.useState<GalleryPhoto[]>([]);
  const [dayLoading, setDayLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  React.useEffect(() => {
    if (!token || online !== "online") return;
    let cancelled = false;
    fetchCalendar(token, endpoint)
      .then((data) => {
        if (cancelled) return;
        const list = Object.values(data?.years ?? {}).sort((a, b) => b.year - a.year);
        setYears(list);
        setMissingDates(data?.missing_capture_dates ?? 0);
        setOpenYear((current) => current ?? list[0]?.year ?? null);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [token, endpoint, online]);

  async function openDay(date: string) {
    if (!token || dayLoading) return;
    if (dayDate === date) {
      setDayDate(null);
      setDayPhotos([]);
      return;
    }
    setDayLoading(true);
    setDayDate(date);
    setSelectedIndex(-1);
    try {
      setDayPhotos(await fetchCalendarDay(token, date, endpoint));
    } catch {
      setDayPhotos([]);
    } finally {
      setDayLoading(false);
    }
  }

  if (!loaded || years.length === 0) return null;

  const selected = selectedIndex >= 0 ? dayPhotos[selectedIndex] : null;

  return (
    <section className="matrix-panel p-5" aria-labelledby="calendar-card-title">
      <h2 id="calendar-card-title" className="text-lg font-medium">
        Calendar
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Days with captured media
        {missingDates > 0 ? ` · ${formatCount(missingDates)} items have no capture date` : ""}.
      </p>
      <div className="mt-4 space-y-2">
        {years.map((node) => {
          const expanded = openYear === node.year;
          return (
            <div key={node.year} className="rounded-lg border border-border">
              <button
                type="button"
                onClick={() => {
                  setOpenYear(expanded ? null : node.year);
                  setOpenMonth(null);
                  setDayDate(null);
                  setDayPhotos([]);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-sm"
              >
                <span className="font-medium">{node.year}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {formatCount(node.total)} items
                </span>
              </button>
              {expanded ? (
                <div className="border-t border-border px-3 py-3">
                  <div className="grid grid-cols-4 gap-1.5">
                    {MONTH_NAMES.map((name, index) => {
                      const month = index + 1;
                      const monthKey = `${node.year}-${String(month).padStart(2, "0")}`;
                      const count = node.months?.[String(month)] ?? 0;
                      const active = openMonth === monthKey;
                      return (
                        <button
                          key={name}
                          type="button"
                          disabled={count === 0}
                          onClick={() => {
                            setOpenMonth(active ? null : monthKey);
                            setDayDate(null);
                            setDayPhotos([]);
                          }}
                          className={cn(
                            "rounded-md border px-1.5 py-1.5 text-center text-[10px] transition-colors",
                            active ? "border-[hsl(var(--brand))] text-foreground" : "border-border text-muted-foreground",
                            count === 0 && "opacity-40"
                          )}
                        >
                          <span className="block">{name}</span>
                          <span className="block font-mono">{count > 0 ? formatCount(count) : "—"}</span>
                        </button>
                      );
                    })}
                  </div>
                  {openMonth && openMonth.startsWith(`${node.year}-`) ? (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.keys(node.days ?? {})
                          .filter((date) => date.startsWith(openMonth))
                          .sort()
                          .map((date) => (
                            <button
                              key={date}
                              type="button"
                              onClick={() => void openDay(date)}
                              title={`${date} · ${formatCount(node.days[date])} items`}
                              className={cn(
                                "rounded border px-1.5 py-1 font-mono text-[10px]",
                                dayDate === date
                                  ? "border-[hsl(var(--brand))] text-foreground"
                                  : "border-border text-muted-foreground"
                              )}
                            >
                              {Number(date.slice(8))}
                            </button>
                          ))}
                      </div>
                      {dayDate && dayDate.startsWith(openMonth) ? (
                        <div className="mt-3">
                          <p className="matrix-label">
                            {dayDate}
                            {dayLoading ? " · loading…" : ` · ${formatCount(dayPhotos.length)} items`}
                          </p>
                          <div className="mt-2 grid grid-cols-4 gap-1.5">
                            {dayPhotos.slice(0, 12).map((photo, index) => (
                              <MediaThumb key={photo.id} photo={photo} onOpen={() => setSelectedIndex(index)} />
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {selected ? (
        <PhotoViewer
          key={selected.id}
          photo={selected}
          previous={selectedIndex > 0 ? dayPhotos[selectedIndex - 1] : undefined}
          next={selectedIndex + 1 < dayPhotos.length ? dayPhotos[selectedIndex + 1] : undefined}
          position={selectedIndex + 1}
          total={dayPhotos.length}
          hasNext={selectedIndex + 1 < dayPhotos.length}
          onPrevious={() => setSelectedIndex((current) => Math.max(0, current - 1))}
          onNext={() => setSelectedIndex((current) => Math.min(dayPhotos.length - 1, current + 1))}
          onClose={() => setSelectedIndex(-1)}
        />
      ) : null}
    </section>
  );
}

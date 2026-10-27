"use client";

import { Activity, Database, ImageIcon, ShieldCheck } from "lucide-react";
import { useServerData } from "@/components/dashboard/server-data-provider";
import { formatBytes, formatCount } from "@/lib/fotoro-server-data";

export function DashboardStats() {
  const { stats, online } = useServerData();
  const live = online === "online" && stats;
  const unavailable = online === "online" ? "Metrics unavailable" : "Server offline";

  const items = [
    {
      icon: ImageIcon,
      label: "Media items",
      value: live ? formatCount(stats.photos_total) : "—",
      delta: live ? `${formatCount(stats.thumbnails_medium)} medium previews` : unavailable,
    },
    {
      icon: Database,
      label: "Media used",
      value: live ? formatBytes(stats.media_bytes) : "—",
      delta: live && stats.disk_total_bytes
        ? `${formatBytes(stats.disk_free_bytes)} free`
        : unavailable,
    },
    {
      icon: ShieldCheck,
      label: "Recorded backup copies",
      value: live ? formatCount(stats.backup_verified) : "—",
      delta: live ? stats.backup_available ? `${formatCount(stats.backup_pending)} awaiting backup` : "Backup target unavailable" : unavailable,
    },
    {
      icon: Activity,
      label: "Processing queue",
      value: live ? formatCount(stats.queue_pending) : "—",
      delta: live ? `${formatCount(stats.queue_failed)} failed · ${formatCount(stats.search_vectors)} search vectors` : unavailable,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <div
          key={s.label}
          className="matrix-panel p-5"
        >
          <div className="relative flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <s.icon className="size-3.5 text-[hsl(var(--brand))]" />
            {s.label}
          </div>
          <p className="relative mt-5 font-mono text-3xl tracking-tight text-foreground">
            {s.value}
          </p>
          <p className="relative mt-2 text-xs text-muted-foreground">{s.delta}</p>
        </div>
      ))}
    </div>
  );
}

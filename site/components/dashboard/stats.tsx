"use client";

import { Activity, Database, ImageIcon, Users } from "lucide-react";
import { useServerData } from "@/components/dashboard/server-data-provider";
import { formatBytes, formatCount, TBE } from "@/lib/fotoro-server-data";

export function DashboardStats() {
  const { stats, online } = useServerData();
  const live = online === "online" && stats;

  const items = [
    {
      icon: ImageIcon,
      label: "Media items",
      value: live ? formatCount(stats.photos_total) : TBE,
      delta: live ? `${formatCount(stats.thumbnails_medium)} thumbnails` : TBE,
    },
    {
      icon: Database,
      label: "On disk",
      value: live ? formatBytes(stats.storage_used_bytes) : TBE,
      delta: live && stats.disk_total_bytes
        ? `${formatBytes(stats.disk_free_bytes)} free`
        : TBE,
    },
    {
      icon: Users,
      label: "People",
      value: live && stats.people_count != null ? formatCount(stats.people_count) : TBE,
      delta: TBE,
    },
    {
      icon: Activity,
      label: "AI queue",
      value:
        live && stats.ai_queue_pct != null ? `${stats.ai_queue_pct}%` : TBE,
      delta: TBE,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-border bg-card p-4 ring-soft"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <s.icon className="size-3.5 text-foreground" />
            {s.label}
          </div>
          <p className="mt-3 font-mono text-2xl tracking-tight text-foreground">
            {s.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{s.delta}</p>
        </div>
      ))}
    </div>
  );
}

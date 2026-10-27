"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HardDrive,
  Home,
  Images,
  Settings,
  Smartphone,
  Wand2,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Badge } from "@/components/ui/badge";
import { useServerData } from "@/components/dashboard/server-data-provider";
import {
  formatBytes,
  formatCount,
} from "@/lib/fotoro-server-data";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/devices", label: "Devices", icon: Smartphone, badge: true },
  { href: "/dashboard/library", label: "Media library", icon: Images },
  { href: "/dashboard/storage", label: "Storage", icon: HardDrive },
  { href: "/dashboard/ai", label: "AI models", icon: Wand2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { stats, devices, online } = useServerData();
  const live = online === "online" && stats;

  const usedLabel = live ? formatBytes(stats.storage_used_bytes) : "—";
  const totalLabel =
    live && stats.disk_total_bytes ? formatBytes(stats.disk_total_bytes) : "—";
  const pct =
    live && stats.disk_total_bytes
      ? Math.min(100, Math.round((stats.storage_used_bytes / stats.disk_total_bytes) * 100))
      : 0;

  const deviceBadge =
    devices.length > 0 ? String(devices.length) : live ? String(stats.devices_count) : undefined;

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-card px-4 py-5 md:flex md:flex-col">
      <div className="flex h-8 items-center justify-between">
        <Logo />
        <Badge variant="outline" className="text-[10px]">
          LOCAL
        </Badge>
      </div>

      <nav className="mt-8 flex-1 space-y-0.5" aria-label="Dashboard">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const badge = item.badge ? deviceBadge : undefined;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "border-l-2 border-[hsl(var(--brand))] bg-accent text-foreground"
                  : "border-l-2 border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2.5">
                <item.icon
                  className={cn(
                    "size-4",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                />
                {item.label}
              </span>
              {badge ? (
                <span className="rounded-full border border-border bg-background/60 px-1.5 text-[10px] font-medium text-muted-foreground">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border border-border bg-background/40 bg-dot-grid p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-foreground">Storage</p>
          <p className="text-[10px] text-muted-foreground">
            {usedLabel} / {totalLabel}
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-[hsl(var(--brand))]"
            style={{ width: live ? `${pct}%` : "0%" }}
          />
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          {live
            ? `${formatCount(stats.photos_total)} items · ${formatCount(stats.backup_verified)} backed up`
            : online === "online" ? "Metrics unavailable" : "Connect your server for live figures"}
        </p>
      </div>
    </aside>
  );
}

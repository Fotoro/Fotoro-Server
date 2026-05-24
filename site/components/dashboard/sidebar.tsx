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
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/devices", label: "Devices", icon: Smartphone, badge: "3" },
  { href: "/dashboard/library", label: "Media library", icon: Images },
  { href: "/dashboard/storage", label: "Storage", icon: HardDrive },
  { href: "/dashboard/ai", label: "AI models", icon: Wand2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-card/30 px-4 py-5 md:flex md:flex-col">
      <div className="flex h-8 items-center justify-between">
        <Logo />
        <Badge variant="outline" className="text-[10px]">
          local
        </Badge>
      </div>

      <nav className="mt-8 flex-1 space-y-0.5" aria-label="Dashboard">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
              {item.badge ? (
                <span className="rounded-full border border-border bg-background/60 px-1.5 text-[10px] font-medium text-muted-foreground">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-lg border border-border bg-background/40 p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-foreground">Storage</p>
          <p className="text-[10px] text-muted-foreground">412 GB / 1 TB</p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-gradient-to-r from-white to-zinc-500"
            style={{ width: "41%" }}
          />
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          24,381 items · 38 people · 61 places
        </p>
      </div>
    </aside>
  );
}

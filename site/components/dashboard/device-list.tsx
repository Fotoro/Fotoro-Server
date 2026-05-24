"use client";

import * as React from "react";
import {
  Cpu,
  Laptop,
  MoreHorizontal,
  Server,
  Smartphone,
  Tablet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status = "active" | "indexing" | "idle";

type Device = {
  id: string;
  name: string;
  kind: "phone" | "tablet" | "laptop" | "server";
  status: Status;
  detail: string;
  last: string;
  items: string;
};

const KIND_ICONS = {
  phone: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  server: Server,
} as const;

const STATUS_TONE: Record<Status, { dot: string; label: string; tone: "success" | "warning" | "outline" }> = {
  active: { dot: "bg-white", label: "Active", tone: "success" },
  indexing: { dot: "bg-zinc-400", label: "Indexing", tone: "warning" },
  idle: { dot: "bg-zinc-600", label: "Idle", tone: "outline" },
};

const INITIAL: Device[] = [
  {
    id: "d1",
    name: "Pixel 8 Pro",
    kind: "phone",
    status: "active",
    detail: "Anya · auto-backup on Wi-Fi",
    last: "synced 2m ago",
    items: "14,206 items",
  },
  {
    id: "d2",
    name: "MacBook Pro",
    kind: "laptop",
    status: "active",
    detail: "Hosting · Apple M3 Pro",
    last: "uptime 12d 4h",
    items: "—",
  },
  {
    id: "d3",
    name: "Mini-PC NAS",
    kind: "server",
    status: "indexing",
    detail: "Background AI batch · 73%",
    last: "ETA 18m",
    items: "+2,109 new",
  },
  {
    id: "d4",
    name: "iPad Air",
    kind: "tablet",
    status: "idle",
    detail: "Wi-Fi only",
    last: "synced 4h ago",
    items: "1,884 items",
  },
];

export function DeviceList() {
  const [devices, setDevices] = React.useState(INITIAL);

  function cycle(id: string) {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status:
                d.status === "active"
                  ? "indexing"
                  : d.status === "indexing"
                    ? "idle"
                    : "active",
            }
          : d
      )
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card ring-soft">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-foreground" />
          <h3 className="text-sm font-semibold tracking-tight">Connected devices</h3>
          <Badge variant="outline">{devices.length}</Badge>
        </div>
        <Button size="sm" variant="ghost">
          Pair new device
        </Button>
      </div>
      <ul className="divide-y divide-border">
        {devices.map((d) => {
          const Icon = KIND_ICONS[d.kind];
          const tone = STATUS_TONE[d.status];
          return (
            <li
              key={d.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="flex items-center gap-4">
                <span className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-background/60 text-foreground">
                  <Icon className="size-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{d.name}</p>
                    <Badge variant={tone.tone}>
                      <span
                        className={cn(
                          "mr-1 inline-block size-1.5 rounded-full",
                          tone.dot,
                          d.status === "active" && "animate-pulse-soft"
                        )}
                      />
                      {tone.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{d.detail}</p>
                </div>
              </div>
              <div className="hidden text-right text-xs text-muted-foreground sm:block">
                <p>{d.items}</p>
                <p>{d.last}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Toggle status for ${d.name}`}
                onClick={() => cycle(d.id)}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

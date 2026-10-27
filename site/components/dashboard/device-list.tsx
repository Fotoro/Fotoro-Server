"use client";

import { Cpu, Laptop, Server, Smartphone, Tablet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useServerData } from "@/components/dashboard/server-data-provider";
import { cn } from "@/lib/utils";

const KIND_ICONS: Record<string, typeof Server> = {
  server: Server,
  phone: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  android: Smartphone,
  ios: Smartphone,
};

function tone(status: string) {
  if (status === "active") return { dot: "bg-white", label: "Active", variant: "success" as const };
  if (status === "indexing") return { dot: "bg-zinc-400", label: "Indexing", variant: "warning" as const };
  return { dot: "bg-zinc-600", label: "Idle", variant: "outline" as const };
}

export function DeviceList() {
  const { devices, online } = useServerData();

  return (
    <div className="matrix-panel">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-foreground" />
          <h3 className="text-sm font-semibold tracking-tight">Linked devices</h3>
          <Badge variant="outline">{online === "online" ? devices.length : "—"}</Badge>
        </div>
      </div>
      {online !== "online" ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">Connect your server to see paired devices.</p>
      ) : devices.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          Device list unavailable. Refresh the connection to try again.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {devices.map((d) => {
            const Icon = KIND_ICONS[d.platform?.toLowerCase()] ?? Server;
            const t = tone(d.status);
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
                      <Badge variant={t.variant}>
                        <span
                          className={cn(
                            "mr-1 inline-block size-1.5 rounded-full",
                            t.dot,
                            d.status === "active" && "animate-pulse-soft"
                          )}
                        />
                        {t.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{d.platform}</p>
                  </div>
                </div>
                <div className="hidden text-right text-xs text-muted-foreground sm:block">
                  <p>{d.items}</p>
                  <p>
                    {d.last_seen
                      ? new Date(d.last_seen).toLocaleString()
                      : "This machine"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

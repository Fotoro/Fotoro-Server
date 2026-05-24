"use client";

import * as React from "react";
import Link from "next/link";
import { Apple, Download, MonitorDown, Smartphone, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { detectPlatform } from "@/lib/detect-os";
import { DOWNLOADS, type Platform } from "@/lib/constants";
import { SectionHeading } from "./section-heading";

const OS_ICONS: Record<Exclude<Platform, "unknown" | "android" | "ios">, React.ElementType> = {
  macos: Apple,
  windows: MonitorDown,
  linux: TerminalSquare,
};

export function DownloadSection() {
  const [active, setActive] = React.useState<Exclude<Platform, "unknown" | "ios">>("macos");
  const [detected, setDetected] = React.useState<Platform>("unknown");

  React.useEffect(() => {
    const d = detectPlatform();
    setDetected(d);
    if (d === "macos" || d === "windows" || d === "linux" || d === "android") {
      setActive(d);
    }
  }, []);

  const desktopTabs: Array<Exclude<Platform, "unknown" | "android" | "ios">> = [
    "macos",
    "windows",
    "linux",
  ];

  return (
    <section id="download" className="container-tight scroll-mt-24 py-24">
      <SectionHeading
        eyebrow="Download"
        title="Get Fotoro on every device you own."
        subtitle="The desktop app hosts your library and runs the AI. The mobile app keeps everything in sync, automatically."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6 ring-soft">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Download className="size-4 text-foreground" />
              <h3 className="text-base font-semibold tracking-tight">Desktop apps</h3>
            </div>
            {detected !== "unknown" && detected !== "ios" ? (
              <Badge variant="brand">
                Detected: {detected === "android" ? "Android" : DOWNLOADS[detected].label}
              </Badge>
            ) : null}
          </div>

          <Tabs
            value={active}
            onValueChange={(v) => setActive(v as Exclude<Platform, "unknown" | "ios">)}
            className="mt-5"
          >
            <TabsList>
              {desktopTabs.map((p) => {
                const Icon = OS_ICONS[p];
                return (
                  <TabsTrigger key={p} value={p}>
                    <Icon className="size-3.5" />
                    {DOWNLOADS[p].label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {desktopTabs.map((p) => {
              const d = DOWNLOADS[p];
              return (
                <TabsContent key={p} value={p}>
                  <div className="rounded-lg border border-border bg-background/40 p-5">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Recommended</p>
                        <p className="mt-1 text-base font-medium text-foreground">
                          {d.primary.name}
                          {d.primary.arch ? (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              · {d.primary.arch}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <Button asChild size="lg">
                        <Link href={d.primary.href}>
                          <Download className="size-4" />
                          Download .{d.primary.ext}
                        </Link>
                      </Button>
                    </div>

                    {d.install ? (
                      <div className="mt-4 rounded-md border border-border bg-background/60 px-3 py-2 font-mono text-xs text-foreground/80">
                        {d.install}
                      </div>
                    ) : null}

                    {d.secondary ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {d.secondary.map((s) => (
                          <Link
                            key={s.href}
                            href={s.href}
                            className="inline-flex items-center gap-2 rounded-md border border-border bg-background/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          >
                            <Download className="size-3" />
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 ring-soft">
          <div className="flex items-center gap-2">
            <Smartphone className="size-4 text-foreground" />
            <h3 className="text-base font-semibold tracking-tight">Mobile apps</h3>
          </div>

          <div className="mt-5 space-y-3">
            <Link
              href={DOWNLOADS.android.primary.href}
              className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-4 transition-colors hover:border-white/20"
            >
              <div>
                <p className="text-sm font-medium text-foreground">Fotoro for Android</p>
                <p className="text-xs text-muted-foreground">APK · universal build · v0.4.0</p>
              </div>
              <Badge variant="success">Available now</Badge>
            </Link>

            <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-4 opacity-80">
              <div>
                <p className="text-sm font-medium text-foreground">Fotoro for iOS</p>
                <p className="text-xs text-muted-foreground">TestFlight waitlist opening soon</p>
              </div>
              <Badge variant="warning">Coming soon</Badge>
            </div>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Mobile apps connect to your self-hosted server via a QR scan from the
            dashboard. No accounts, no cloud middleman.
          </p>
        </div>
      </div>
    </section>
  );
}

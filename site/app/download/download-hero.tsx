"use client";

import * as React from "react";
import Link from "next/link";
import {
  Apple,
  Check,
  Copy,
  Download,
  HardDrive,
  MonitorDown,
  Smartphone,
  TerminalSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DOWNLOADS, type Platform, SITE } from "@/lib/constants";
import { detectPlatform } from "@/lib/detect-os";

type DesktopOS = "macos" | "windows" | "linux";
const DESKTOP_OS: DesktopOS[] = ["macos", "windows", "linux"];
const OS_ICONS: Record<DesktopOS, React.ElementType> = {
  macos: Apple,
  windows: MonitorDown,
  linux: TerminalSquare,
};

export function DownloadHero() {
  const [detected, setDetected] = React.useState<Platform>("unknown");
  const [active, setActive] = React.useState<DesktopOS>("macos");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const p = detectPlatform();
    setDetected(p);
    if (DESKTOP_OS.includes(p as DesktopOS)) {
      setActive(p as DesktopOS);
    }
  }, []);

  const currentInstall = DOWNLOADS[active].install ?? "";

  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(currentInstall);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  return (
    <section className="relative isolate overflow-hidden pb-24 pt-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-brand-glow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-line-grid opacity-25 mask-fade-radial"
      />

      <div className="container-tight">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="brand">
            <HardDrive className="size-3" /> v{SITE.version} · {new Date().getFullYear()}
          </Badge>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Download <span className="gradient-text">Fotoro</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            One binary, every platform. Pair your phone with a QR code in under
            two minutes. Your library never leaves your hardware.
          </p>

          {detected !== "unknown" ? (
            <p className="mt-5 text-sm text-muted-foreground">
              We detected{" "}
              <span className="font-medium text-foreground">
                {detected === "android"
                  ? "Android"
                  : detected === "ios"
                    ? "iOS"
                    : DOWNLOADS[detected as DesktopOS].label}
              </span>{" "}
              — recommended build is highlighted below.
            </p>
          ) : null}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6 ring-soft">
            <Tabs
              value={active}
              onValueChange={(v) => setActive(v as DesktopOS)}
            >
              <TabsList>
                {DESKTOP_OS.map((p) => {
                  const Icon = OS_ICONS[p];
                  return (
                    <TabsTrigger key={p} value={p}>
                      <Icon className="size-3.5" />
                      {DOWNLOADS[p].label}
                      {detected === p ? (
                        <span className="ml-1 inline-block size-1.5 rounded-full bg-white" />
                      ) : null}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {DESKTOP_OS.map((p) => {
                const d = DOWNLOADS[p];
                return (
                  <TabsContent key={p} value={p}>
                    <div className="space-y-5">
                      <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-white/25 bg-white/[0.04] p-5 sm:flex-row sm:items-center">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-foreground">
                            Recommended
                          </p>
                          <p className="mt-1 text-lg font-semibold text-foreground">
                            {d.primary.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            .{d.primary.ext}
                            {d.primary.arch ? ` · ${d.primary.arch}` : ""} · ~58 MB
                          </p>
                        </div>
                        <Button asChild size="lg">
                          <Link href={d.primary.href}>
                            <Download className="size-4" />
                            Download
                          </Link>
                        </Button>
                      </div>

                      {currentInstall ? (
                        <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/60 px-3 py-2.5 font-mono text-xs text-foreground/80">
                          <code className="truncate">{currentInstall}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={copyInstall}
                            aria-label="Copy install command"
                          >
                            {copied ? (
                              <>
                                <Check className="size-3.5" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="size-3.5" /> Copy
                              </>
                            )}
                          </Button>
                        </div>
                      ) : null}

                      {d.secondary ? (
                        <div>
                          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                            Other builds
                          </p>
                          <div className="flex flex-wrap gap-2">
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
                        </div>
                      ) : null}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 ring-soft">
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-foreground" />
                <h3 className="text-base font-semibold tracking-tight">
                  Mobile
                </h3>
              </div>
              <div className="mt-4 space-y-3">
                <Link
                  href={DOWNLOADS.android.primary.href}
                  className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-4 transition-colors hover:border-white/20"
                >
                  <div>
                    <p className="text-sm font-medium">Android APK</p>
                    <p className="text-xs text-muted-foreground">
                      Universal · v{SITE.version}
                    </p>
                  </div>
                  <Badge variant="success">Available</Badge>
                </Link>
                <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-4 opacity-80">
                  <div>
                    <p className="text-sm font-medium">iOS</p>
                    <p className="text-xs text-muted-foreground">
                      TestFlight waitlist opens soon
                    </p>
                  </div>
                  <Badge variant="warning">Soon</Badge>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 ring-soft">
              <h3 className="text-base font-semibold tracking-tight">
                Prefer source?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Build from <code className="rounded bg-muted/40 px-1 py-0.5 font-mono text-xs">main</code> for cutting-edge features.
              </p>
              <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-background/60 p-3 font-mono text-xs text-foreground/80">
                <code>{`git clone ${SITE.github}
cd Fotoro-Server
go build ./...`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

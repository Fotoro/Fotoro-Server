"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const KEY = "fotoro:privacy-notice-dismissed";

export function CookieBanner() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      // ignore (SSR / Storage disabled)
    }
  }, []);

  if (!open) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Privacy notice"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-xl border border-border glass p-4 shadow-2xl sm:bottom-5 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="hidden size-9 shrink-0 items-center justify-center rounded-md border border-border bg-card sm:flex">
          <Lock className="size-4 text-foreground" />
        </div>
        <div className="flex-1 text-sm leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">No cookies. No trackers. Promise.</p>
          <p className="mt-1">
            Fotoro doesn&apos;t use analytics or third-party cookies on this site. The only
            data we ever store stays on the server <em>you</em> control. Read the{" "}
            <Link href="/docs#privacy" className="text-foreground underline-offset-4 hover:underline">
              privacy notice
            </Link>{" "}
            for the full story.
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-start">
          <Button size="sm" onClick={dismiss}>
            Got it
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={dismiss}
            aria-label="Dismiss notice"
            className="size-9"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TBE } from "@/lib/fotoro-server-data";

export function QrPair() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 ring-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="size-4 text-foreground" />
            <h3 className="text-sm font-semibold tracking-tight">Pair a new device</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Mobile pairing flow — {TBE}
          </p>
        </div>
        <Badge variant="outline">{TBE}</Badge>
      </div>
      <div className="mt-5 flex min-h-[148px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        {TBE}
      </div>
    </div>
  );
}

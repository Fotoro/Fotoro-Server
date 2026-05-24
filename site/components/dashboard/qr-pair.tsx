"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, QrCode, RefreshCw, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function makeToken() {
  return Array.from({ length: 4 })
    .map(() => Math.random().toString(36).slice(2, 6).toUpperCase())
    .join("-");
}

export function QrPair() {
  const [token, setToken] = React.useState(() => makeToken());
  const [copied, setCopied] = React.useState(false);
  const payload = React.useMemo(
    () =>
      JSON.stringify({
        v: 1,
        host: "fotoro.local",
        port: 8080,
        token,
        scheme: "fotoro+pair",
      }),
    [token]
  );

  async function copyToken() {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 ring-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="size-4 text-foreground" />
            <h3 className="text-sm font-semibold tracking-tight">Pair a new device</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Scan with the Fotoro mobile app on your local network. Token rotates every 5 minutes.
          </p>
        </div>
        <Badge variant="success">
          <span className="mr-1 inline-block size-1.5 animate-pulse-soft rounded-full bg-white" />
          Listening on :8080
        </Badge>
      </div>

      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">
        <div className="rounded-xl border border-border bg-white p-3">
          <QRCodeSVG
            value={payload}
            size={148}
            level="M"
            bgColor="#ffffff"
            fgColor="#06060a"
          />
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Pairing token
            </p>
            <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-2 font-mono text-sm">
              <span className="truncate">{token}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={copyToken}
                aria-label="Copy token"
                className="ml-auto size-7"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                  <Smartphone className="size-3.5" />
                  Show instructions
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pair your phone in 4 steps</DialogTitle>
                  <DialogDescription>
                    Both devices must be on the same Wi-Fi network. Fotoro never sends
                    your pairing token over the public internet.
                  </DialogDescription>
                </DialogHeader>
                <ol className="space-y-3 text-sm">
                  {[
                    "Open the Fotoro app on your phone.",
                    "Tap the + button → ‘Pair a server’.",
                    "Scan the QR code, or paste the token shown.",
                    "Choose which albums you want to back up. Done.",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-background/60 text-xs font-medium">
                        {i + 1}
                      </span>
                      <span className="text-foreground/90">{step}</span>
                    </li>
                  ))}
                </ol>
              </DialogContent>
            </Dialog>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setToken(makeToken())}
            >
              <RefreshCw className="size-3.5" />
              Regenerate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

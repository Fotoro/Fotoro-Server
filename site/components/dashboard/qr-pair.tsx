"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";
import { useServerData } from "@/components/dashboard/server-data-provider";

type PairingSession = { qr_payload: string; expires_at: string };

export function QrPair() {
  const { token, online } = useServerData();
  const [session, setSession] = React.useState<PairingSession | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const active = session && new Date(session.expires_at).getTime() > now;
  async function createPairing() {
    if (!token) return;
    setLoading(true);
    setError(null);
    setSession(null);
    try {
      const res = await fetch("/api/pairing", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Pairing unavailable");
      setSession(body as PairingSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pairing unavailable");
    } finally {
      setLoading(false);
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
            Create a one-time key for a device on your private tailnet.
          </p>
        </div>
      </div>
      <div className="mt-5 flex min-h-[148px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        {active ? (
          <>
            <QRCodeSVG value={session.qr_payload} size={160} bgColor="#ffffff" fgColor="#111111" marginSize={2} />
            <p>Expires in {Math.max(0, Math.ceil((new Date(session.expires_at).getTime() - now) / 1000))} seconds</p>
          </>
        ) : <p>{session ? "Pairing key expired." : "No active pairing key."}</p>}
        {error ? <p className="text-destructive-foreground">{error}</p> : null}
        <button type="button" onClick={() => void createPairing()} disabled={loading || online !== "online"}
          className="rounded-md border border-border px-3 py-1.5 text-xs disabled:opacity-50">
          {loading ? "Creating…" : active ? "Create another key" : "Create pairing key"}
        </button>
      </div>
    </div>
  );
}

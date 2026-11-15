"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { clearAuth, clearProxyCookie, getStoredUser, type FotoroUser } from "@/lib/fotoro-session";
import { useServerData } from "@/components/dashboard/server-data-provider";
import { fetchEmbedStatus, formatCount, runEmbedBackfill, type EmbedStatus } from "@/lib/fotoro-server-data";

export default function AiModelsPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<FotoroUser | null>(null);
  const { stats, online, token, endpoint } = useServerData();
  const [embed, setEmbed] = React.useState<EmbedStatus | null>(null);
  const [embedBusy, setEmbedBusy] = React.useState(false);
  const [embedNote, setEmbedNote] = React.useState<string | null>(null);

  const refreshEmbed = React.useCallback(async () => {
    if (!token || online !== "online") return;
    const status = await fetchEmbedStatus(token, endpoint);
    if (status) setEmbed(status);
  }, [token, endpoint, online]);

  React.useEffect(() => {
    void refreshEmbed();
  }, [refreshEmbed]);

  async function backfill() {
    if (!token) return;
    setEmbedBusy(true);
    setEmbedNote(null);
    try {
      const res = await runEmbedBackfill(token, endpoint);
      setEmbedNote(`Backfill pass finished: ${res.embedded} embedded, ${res.skipped} skipped, ${res.pending} still pending.`);
      await refreshEmbed();
    } catch (error) {
      setEmbedNote(error instanceof Error ? error.message : "Backfill failed");
    } finally {
      setEmbedBusy(false);
    }
  }

  React.useEffect(() => {
    if (!getStoredUser()) router.replace("/login?callbackUrl=/dashboard/ai");
    else setUser(getStoredUser());
  }, [router]);

  if (!user) return null;

  const live = online === "online" || online === "reconnecting" ? stats : null;

  return (
    <>
      <DashboardTopbar
        user={user}
        onLogout={() => {
          clearAuth();
          void clearProxyCookie();
          router.push("/login");
        }}
      />
      <main className="container-tight w-full px-5 py-8">
        <p className="matrix-label">Processing / local index</p>
        <h1 className="mt-1 text-2xl font-semibold">Processing & search</h1>
        {live?.collected_at ? <p className="mt-2 font-mono text-xs text-muted-foreground">Measured {new Date(live.collected_at).toLocaleString()}{live.stale ? " · last available reading" : ""}</p> : null}
        <dl className="matrix-panel mt-8 divide-y divide-border">
          <div className="flex justify-between px-5 py-4 text-sm">
            <dt className="text-muted-foreground">Pending jobs</dt>
            <dd className="font-mono text-xs">{live ? formatCount(live.queue_pending) : "—"}</dd>
          </div>
          <div className="flex justify-between px-5 py-4 text-sm">
            <dt className="text-muted-foreground">Failed jobs</dt>
            <dd className="font-mono text-xs">{live ? formatCount(live.queue_failed) : "—"}</dd>
          </div>
          <div className="flex justify-between px-5 py-4 text-sm">
            <dt className="text-muted-foreground">Loaded search vectors</dt>
            <dd className="font-mono text-xs">{live ? formatCount(live.search_vectors) : "—"}</dd>
          </div>
          <div className="flex justify-between px-5 py-4 text-sm">
            <dt className="text-muted-foreground">Photos tagged with faces</dt>
            <dd className="font-mono text-xs">{live ? formatCount(live.photos_with_faces) : "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 px-5 py-4 text-sm">
            <dt className="text-muted-foreground">Configured vision model</dt>
            <dd className="break-all text-right font-mono text-xs">{live ? live.configured_model : "—"}</dd>
          </div>
        </dl>
        <div className="matrix-panel mt-8 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium">Embeddings</h2>
            <button type="button" onClick={() => void backfill()}
              disabled={embedBusy || online !== "online" || embed?.backend_healthy === false || !(embed?.pending ?? 0)}
              className="rounded-md border border-border px-3 py-1.5 text-xs disabled:opacity-50">
              {embedBusy ? "Embedding…" : "Embed pending now"}
            </button>
          </div>
          {!embed ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {online === "online" ? "Reading embed status…" : "Connect your server for embed status."}
            </p>
          ) : (
            <>
              <div className="mt-4">
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span className="break-all">{embed.model || "No model configured"}</span>
                  <span>{formatCount(embed.embedded)} / {formatCount(embed.total_images)} · {embed.dim}d</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full bg-[hsl(var(--brand))]"
                    style={{ width: `${embed.total_images > 0 ? Math.min(100, Math.round((embed.embedded / embed.total_images) * 100)) : 0}%` }}
                  />
                </div>
              </div>
              <dl className="mt-4 divide-y divide-border">
                <div className="flex justify-between py-3 text-sm">
                  <dt className="text-muted-foreground">Pending embeddings</dt>
                  <dd className="font-mono text-xs">{formatCount(embed.pending)}</dd>
                </div>
                <div className="flex justify-between py-3 text-sm">
                  <dt className="text-muted-foreground">Vectors in search index</dt>
                  <dd className="font-mono text-xs">{formatCount(embed.index_vectors)}</dd>
                </div>
                <div className="flex justify-between py-3 text-sm">
                  <dt className="text-muted-foreground">Embedding backend</dt>
                  <dd className="font-mono text-xs">{embed.backend_healthy ? "Reachable" : "Unreachable"}</dd>
                </div>
              </dl>
            </>
          )}
          {embedNote ? <p className="mt-3 font-mono text-xs text-muted-foreground">{embedNote}</p> : null}
        </div>
      </main>
    </>
  );
}

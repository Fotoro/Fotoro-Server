"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { clearAuth, clearProxyCookie, getStoredUser, type FotoroUser } from "@/lib/fotoro-session";
import { useServerData } from "@/components/dashboard/server-data-provider";
import {
  fetchBackupStatus,
  fetchTierStats,
  formatBytes,
  formatCount,
  runTierPass,
  snapshotCatalogue,
  verifyBackupCopies,
  type BackupStatus,
  type TierStats,
} from "@/lib/fotoro-server-data";

export default function StoragePage() {
  const router = useRouter();
  const [user, setUser] = React.useState<FotoroUser | null>(null);
  const { stats, online, token, endpoint } = useServerData();
  const [backup, setBackup] = React.useState<BackupStatus | null>(null);
  const [syncing, setSyncing] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [tiers, setTiers] = React.useState<TierStats | null>(null);
  const [tierAction, setTierAction] = React.useState<"run" | "snapshot" | null>(null);
  const [tierNote, setTierNote] = React.useState<string | null>(null);
  const live = online === "online" || online === "reconnecting" ? stats : null;

  const refreshBackup = React.useCallback(async () => {
    if (!token || online !== "online") return;
    const status = await fetchBackupStatus(token, endpoint);
    if (status) setBackup(status);
  }, [token, endpoint, online]);

  const refreshTiers = React.useCallback(async () => {
    if (!token || online !== "online") return;
    const status = await fetchTierStats(token, endpoint);
    if (status) setTiers(status);
  }, [token, endpoint, online]);

  React.useEffect(() => {
    void refreshBackup();
    void refreshTiers();
  }, [refreshBackup, refreshTiers]);

  async function syncBackup() {
    if (!token) return;
    setSyncing(true);
    try {
      await fetch(endpoint ? `${endpoint}/api/v1/storage/sync` : "/api/fotoro/api/v1/storage/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshBackup();
    } finally {
      setSyncing(false);
    }
  }

  async function verifyCopies() {
    if (!token) return;
    setVerifying(true);
    try {
      const res = await verifyBackupCopies(token, endpoint);
      if (res.storage) setBackup(res.storage);
      else await refreshBackup();
    } finally {
      setVerifying(false);
    }
  }

  async function runTierMaintenance() {
    if (!token) return;
    setTierAction("run");
    setTierNote(null);
    try {
      const res = await runTierPass(token, endpoint);
      const errors = res.errors?.length ?? 0;
      setTierNote(
        `Tier pass finished: ${res.demoted?.length ?? 0} demoted, ${res.promoted?.length ?? 0} promoted, ${res.packed?.length ?? 0} packed${errors ? `, ${errors} errors` : ""}.`
      );
      await Promise.all([refreshTiers(), refreshBackup()]);
    } catch (error) {
      setTierNote(error instanceof Error ? error.message : "Tier pass failed");
    } finally {
      setTierAction(null);
    }
  }

  async function snapshotNow() {
    if (!token) return;
    setTierAction("snapshot");
    setTierNote(null);
    try {
      const res = await snapshotCatalogue(token, endpoint);
      setTierNote(res.snapshot ? `Catalogue snapshot saved to ${res.snapshot}.` : "Catalogue snapshot saved.");
    } catch (error) {
      setTierNote(error instanceof Error ? error.message : "Snapshot failed");
    } finally {
      setTierAction(null);
    }
  }

  React.useEffect(() => {
    if (!getStoredUser()) router.replace("/login?callbackUrl=/dashboard/storage");
    else setUser(getStoredUser());
  }, [router]);

  if (!user) return null;

  const rows = [
    { label: "Media items", value: live ? formatCount(live.photos_total) : "—" },
    { label: "Medium thumbnails", value: live ? formatCount(live.thumbnails_medium) : "—" },
    { label: "Preview cache", value: live ? formatBytes(live.cache_bytes) : "—" },
    { label: "Upload staging", value: live ? formatBytes(live.staging_bytes) : "—" },
    { label: "Fotoro media, previews and staging", value: live ? formatBytes(live.storage_used_bytes) : "—" },
    { label: "Primary disk capacity", value: live && live.disk_total_bytes ? formatBytes(live.disk_total_bytes) : "—" },
    { label: "Items needing attention", value: live ? formatCount(live.photos_failed) : "—" },
  ];

  const tierStoredBytes = tiers ? tiers.hot_bytes + tiers.archive_bytes + tiers.pack_bytes : 0;
  const tierSegments = [
    { label: "Hot", bytes: tiers?.hot_bytes ?? 0, cls: "bg-[hsl(var(--brand))]" },
    { label: "Warm", bytes: tiers?.archive_bytes ?? 0, cls: "bg-foreground/50" },
    { label: "Cold", bytes: tiers?.pack_bytes ?? 0, cls: "bg-muted-foreground/40" },
  ];
  const tierRows = tiers ? [
    { label: "Hot / originals on primary", value: `${formatCount(tiers.hot_assets)} items · ${formatBytes(tiers.hot_bytes)}` },
    { label: "Warm / compressed archives", value: `${formatCount(tiers.warm_assets)} items · ${formatBytes(tiers.archive_bytes)} stored` },
    { label: "Cold / sealed packs", value: `${formatCount(tiers.cold_assets)} items in ${formatCount(tiers.packs)} packs · ${formatBytes(tiers.pack_bytes)}` },
    { label: "Space saved by tiering", value: formatBytes(tiers.saved_bytes) },
    { label: "Decode cache (rehydrated)", value: formatBytes(tiers.rehydrated_cache_bytes) },
    { label: "Primary disk free", value: `${formatBytes(tiers.primary_free_bytes)} of ${formatBytes(tiers.primary_total_bytes)}` },
  ] : [];

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
        <p className="matrix-label">Storage / local disks</p>
        <h1 className="mt-1 text-2xl font-semibold">Disk usage</h1>
        {live?.collected_at ? <p className="mt-2 font-mono text-xs text-muted-foreground">Measured on your server {new Date(live.collected_at).toLocaleString()}{live.stale ? " · last available reading" : ""}</p> : null}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="matrix-panel p-6"><p className="matrix-label">Fotoro originals / used</p><p className="mt-5 font-mono text-4xl text-foreground">{live ? formatBytes(live.media_bytes) : "—"}</p><p className="mt-3 text-xs text-muted-foreground">Size of media files stored in your library</p></div>
          <div className="matrix-panel p-6"><p className="matrix-label">Primary disk / available</p><p className="mt-5 font-mono text-4xl text-foreground">{live && live.disk_total_bytes ? formatBytes(live.disk_free_bytes) : "—"}</p><p className="mt-3 text-xs text-muted-foreground">Space available for new media on the primary disk</p></div>
        </div>
        <dl className="matrix-panel mt-8 divide-y divide-border">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between px-5 py-4 text-sm">
              <dt className="text-muted-foreground">{r.label}</dt>
              <dd className="font-mono text-xs">{r.value}</dd>
            </div>
          ))}
        </dl>
        <div className="matrix-panel mt-8 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium">Automatic backup</h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => void verifyCopies()} disabled={!backup?.available || verifying || online !== "online"}
                className="rounded-md border border-border px-3 py-1.5 text-xs disabled:opacity-50">
                {verifying ? "Verifying…" : "Verify copies"}
              </button>
              <button type="button" onClick={() => void syncBackup()} disabled={!backup?.available || syncing || online !== "online"}
                className="rounded-md border border-border px-3 py-1.5 text-xs disabled:opacity-50">
                {syncing ? "Checking…" : "Back up pending now"}
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {!backup ? "Checking storage…" : backup.available
              ? `${backup.verified.toLocaleString()} items verified on a second storage target; ${backup.pending.toLocaleString()} awaiting copy; ${backup.unverified_primary.toLocaleString()} originals awaiting verification.`
              : backup.configured ? backup.error : "No independent backup target configured. Keep phone originals."}
          </p>
          {backup?.failed ? <p className="mt-2 text-xs text-destructive-foreground">{backup.failed} backup items need repair.</p> : null}
          {backup && (backup.missing_primary || backup.corrupt_primary) ? (
            <p className="mt-2 text-xs text-destructive-foreground">
              {backup.missing_primary} originals unavailable; {backup.corrupt_primary} failed checksum verification.
            </p>
          ) : null}
        </div>
        <div className="matrix-panel mt-8 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium">Storage tiers</h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => void runTierMaintenance()} disabled={!tiers || tierAction !== null || online !== "online"}
                className="rounded-md border border-border px-3 py-1.5 text-xs disabled:opacity-50">
                {tierAction === "run" ? "Running…" : "Run tier pass"}
              </button>
              <button type="button" onClick={() => void snapshotNow()} disabled={tierAction !== null || online !== "online"}
                className="rounded-md border border-border px-3 py-1.5 text-xs disabled:opacity-50">
                {tierAction === "snapshot" ? "Saving…" : "Snapshot catalogue"}
              </button>
            </div>
          </div>
          {!tiers ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {online === "online" ? "Reading tier stats…" : "Connect your server for tier stats."}
            </p>
          ) : (
            <>
              {tierStoredBytes > 0 ? (
                <>
                  <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-border">
                    {tierSegments.filter((seg) => seg.bytes > 0).map((seg) => (
                      <div key={seg.label} className={seg.cls} style={{ width: `${(seg.bytes / tierStoredBytes) * 100}%` }} />
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-muted-foreground">
                    {tierSegments.map((seg) => (
                      <span key={seg.label}>{seg.label} {formatBytes(seg.bytes)}</span>
                    ))}
                  </div>
                </>
              ) : null}
              <dl className="mt-4 divide-y divide-border">
                {tierRows.map((r) => (
                  <div key={r.label} className="flex justify-between gap-4 py-3 text-sm">
                    <dt className="text-muted-foreground">{r.label}</dt>
                    <dd className="text-right font-mono text-xs">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
          {tierNote ? <p className="mt-3 break-all font-mono text-xs text-muted-foreground">{tierNote}</p> : null}
        </div>
      </main>
    </>
  );
}

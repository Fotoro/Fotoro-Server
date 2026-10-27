"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { clearAuth, clearProxyCookie, getStoredUser, type FotoroUser } from "@/lib/fotoro-session";
import { useServerData } from "@/components/dashboard/server-data-provider";
import { formatBytes, formatCount } from "@/lib/fotoro-server-data";

type BackupStatus = {
  configured: boolean;
  available: boolean;
  error?: string;
  unverified_primary: number;
  missing_primary: number;
  corrupt_primary: number;
  pending: number;
  verified: number;
  failed: number;
};

export default function StoragePage() {
  const router = useRouter();
  const [user, setUser] = React.useState<FotoroUser | null>(null);
  const { stats, online, token } = useServerData();
  const [backup, setBackup] = React.useState<BackupStatus | null>(null);
  const [syncing, setSyncing] = React.useState(false);
  const live = online === "online" ? stats : null;

  const refreshBackup = React.useCallback(async () => {
    if (!token || online !== "online") return;
    const res = await fetch("/api/fotoro/api/v1/storage", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setBackup((await res.json()) as BackupStatus);
  }, [token, online]);

  React.useEffect(() => {
    void refreshBackup();
  }, [refreshBackup]);

  async function syncBackup() {
    if (!token) return;
    setSyncing(true);
    try {
      await fetch("/api/fotoro/api/v1/storage/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshBackup();
    } finally {
      setSyncing(false);
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
    { label: "Indexed originals, cache and staging", value: live ? formatBytes(live.storage_used_bytes) : "—" },
    { label: "Primary disk capacity", value: live && live.disk_total_bytes ? formatBytes(live.disk_total_bytes) : "—" },
    { label: "Primary disk free", value: live && live.disk_total_bytes ? formatBytes(live.disk_free_bytes) : "—" },
    { label: "Items needing attention", value: live ? formatCount(live.photos_failed) : "—" },
  ];

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
            <button type="button" onClick={() => void syncBackup()} disabled={!backup?.available || syncing}
              className="rounded-md border border-border px-3 py-1.5 text-xs disabled:opacity-50">
              {syncing ? "Checking…" : "Back up pending now"}
            </button>
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
      </main>
    </>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { clearAuth, clearProxyCookie, getStoredUser, type FotoroUser } from "@/lib/fotoro-session";
import { useServerData } from "@/components/dashboard/server-data-provider";
import { formatBytes, formatCount, TBE } from "@/lib/fotoro-server-data";

export default function StoragePage() {
  const router = useRouter();
  const [user, setUser] = React.useState<FotoroUser | null>(null);
  const { stats, online } = useServerData();
  const live = online === "online" && stats;

  React.useEffect(() => {
    if (!getStoredUser()) router.replace("/login?callbackUrl=/dashboard/storage");
    else setUser(getStoredUser());
  }, [router]);

  if (!user) return null;

  const rows = [
    { label: "Photos indexed", value: live ? formatCount(stats.photos_total) : TBE },
    { label: "Medium thumbnails", value: live ? formatCount(stats.thumbnails_medium) : TBE },
    { label: "Library storage", value: live ? formatBytes(stats.storage_used_bytes) : TBE },
    { label: "Disk total", value: live && stats.disk_total_bytes ? formatBytes(stats.disk_total_bytes) : TBE },
    { label: "Disk free", value: live && stats.disk_free_bytes ? formatBytes(stats.disk_free_bytes) : TBE },
    { label: "Failed imports", value: live ? formatCount(stats.photos_failed) : TBE },
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
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Storage</p>
        <h1 className="mt-1 text-2xl font-semibold">Disk usage</h1>
        <dl className="mt-8 divide-y divide-border rounded-xl border border-border bg-card ring-soft">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between px-5 py-4 text-sm">
              <dt className="text-muted-foreground">{r.label}</dt>
              <dd className="font-mono text-xs">{r.value}</dd>
            </div>
          ))}
        </dl>
      </main>
    </>
  );
}

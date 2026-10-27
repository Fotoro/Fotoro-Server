"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { clearAuth, clearProxyCookie, getStoredUser, type FotoroUser } from "@/lib/fotoro-session";
import { useServerData } from "@/components/dashboard/server-data-provider";
import { formatCount } from "@/lib/fotoro-server-data";

export default function AiModelsPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<FotoroUser | null>(null);
  const { stats, online } = useServerData();

  React.useEffect(() => {
    if (!getStoredUser()) router.replace("/login?callbackUrl=/dashboard/ai");
    else setUser(getStoredUser());
  }, [router]);

  if (!user) return null;

  const live = online === "online" ? stats : null;

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
      </main>
    </>
  );
}

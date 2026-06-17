"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { clearAuth, clearProxyCookie, getStoredUser, type FotoroUser } from "@/lib/fotoro-session";
import { useServerData } from "@/components/dashboard/server-data-provider";
import { TBE } from "@/lib/fotoro-server-data";

export default function AiModelsPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<FotoroUser | null>(null);
  const { stats, online } = useServerData();

  React.useEffect(() => {
    if (!getStoredUser()) router.replace("/login?callbackUrl=/dashboard/ai");
    else setUser(getStoredUser());
  }, [router]);

  if (!user) return null;

  const queue =
    online === "online" && stats?.ai_queue_pct != null
      ? `${stats.ai_queue_pct}%`
      : TBE;

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
        <p className="text-xs uppercase tracking-wider text-muted-foreground">AI models</p>
        <h1 className="mt-1 text-2xl font-semibold">Vision & embeddings</h1>
        <dl className="mt-8 divide-y divide-border rounded-xl border border-border bg-card ring-soft">
          <div className="flex justify-between px-5 py-4 text-sm">
            <dt className="text-muted-foreground">Processing queue</dt>
            <dd className="font-mono text-xs">{queue}</dd>
          </div>
          <div className="flex justify-between px-5 py-4 text-sm">
            <dt className="text-muted-foreground">Caption model</dt>
            <dd className="font-mono text-xs">{TBE}</dd>
          </div>
          <div className="flex justify-between px-5 py-4 text-sm">
            <dt className="text-muted-foreground">Embedding model</dt>
            <dd className="font-mono text-xs">{TBE}</dd>
          </div>
        </dl>
      </main>
    </>
  );
}

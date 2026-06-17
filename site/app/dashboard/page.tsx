"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import Link from "next/link";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { DashboardStats } from "@/components/dashboard/stats";
import { DeviceList } from "@/components/dashboard/device-list";
import { ServerNodeCard } from "@/components/dashboard/server-node";
import { UploadZone } from "@/components/dashboard/upload-zone";
import { QrPair } from "@/components/dashboard/qr-pair";
import {
  ConnectivityBadge,
  useNodeConnectivity,
} from "@/components/dashboard/connectivity-badge";
import { Button } from "@/components/ui/button";
import {
  clearAuth,
  getStoredToken,
  getStoredUser,
  type FotoroUser,
} from "@/lib/fotoro-session";
import { handoffExistingSessionForCli } from "@/lib/cli-handoff-session";
import type { NodePublic } from "@/lib/fotoro-local";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<FotoroUser | null>(null);
  const [node, setNode] = React.useState<NodePublic | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [cliComplete, setCliComplete] = React.useState(false);

  React.useEffect(() => {
    async function init() {
      const handoff = await handoffExistingSessionForCli();
      if (handoff === "redirect") return;
      if (handoff === "poll") {
        setCliComplete(true);
        setLoading(false);
        return;
      }

      const supabaseToken = getStoredToken();
      const stored = getStoredUser();
      if (!supabaseToken || !stored) {
        router.replace("/login?callbackUrl=/dashboard");
        return;
      }
      setUser(stored);
      setToken(supabaseToken);
      fetchNode(supabaseToken);
    }

    void init();
  }, [router]);

  async function fetchNode(supabaseToken: string) {
    try {
      const res = await fetch("/api/nodes", {
        headers: { Authorization: `Bearer ${supabaseToken}` },
      });
      const data = await res.json();
      setNode(data.node ?? null);
    } catch {
      setNode(null);
    } finally {
      setLoading(false);
    }
  }

  const { state, refresh } = useNodeConnectivity(node, token);

  function handleLogout() {
    clearAuth();
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm"
        >
          <span className="inline-block size-2 animate-pulse-soft rounded-full bg-foreground" />
          Loading dashboard…
        </motion.div>
      </div>
    );
  }

  if (cliComplete) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-5 text-center">
        <p className="text-lg font-semibold text-foreground">
          Signed in — return to the Fotoro app
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          You can close this tab. The CLI should continue automatically.
        </p>
      </div>
    );
  }

  if (!user || !token) return null;

  const serverOnline = state === "online";

  return (
    <>
      <DashboardTopbar user={user} onLogout={handleLogout} />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="container-tight w-full px-5 py-8"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Overview
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your photos live on your hardware — this dashboard is just the remote control.
            </p>
          </div>
          <ConnectivityBadge state={state} onRefresh={refresh} />
        </div>

        <DashboardStats />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <ServerNodeCard node={node} liveState={state} />
            {serverOnline && node ? (
              <UploadZone node={node} supabaseToken={token} />
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center ring-soft">
                <Upload className="mx-auto mb-3 size-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  Connect your server to upload
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Run <code className="rounded bg-muted px-1">./fotoro server</code> on your
                  machine after setup.
                </p>
              </div>
            )}
            {serverOnline ? (
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/library">Open media library →</Link>
              </Button>
            ) : null}
            <DeviceList />
          </div>
          <QrPair />
        </div>
      </motion.main>
    </>
  );
}

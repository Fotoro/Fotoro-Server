"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { DashboardStats } from "@/components/dashboard/stats";
import { DeviceList } from "@/components/dashboard/device-list";
import { ServerNodeCard } from "@/components/dashboard/server-node";
import { UploadZone } from "@/components/dashboard/upload-zone";
import { QrPair } from "@/components/dashboard/qr-pair";
import { Badge } from "@/components/ui/badge";
import {
  clearAuth,
  getStoredToken,
  getStoredUser,
  type FotoroUser,
} from "@/lib/fotoro-session";
import { finishAuthForCli } from "@/lib/cli-handoff-session";

export interface NodeInfo {
  tailscale_ip: string;
  magic_dns: string | null;
  tailnet_name: string | null;
  node_name: string;
  status: "online" | "offline" | "error";
  last_seen: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<FotoroUser | null>(null);
  const [node, setNode] = React.useState<NodeInfo | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [cliComplete, setCliComplete] = React.useState(false);

  React.useEffect(() => {
    async function init() {
      const handoff = await finishAuthForCli();
      if (handoff === "redirect") return;
      if (handoff === "poll") {
        setCliComplete(true);
        setLoading(false);
        return;
      }

      const token = getStoredToken();
      const stored = getStoredUser();
      if (!token || !stored) {
        router.replace("/login?callbackUrl=/dashboard");
        return;
      }
      setUser(stored);
      fetchNode(token);
    }

    void init();
  }, [router]);

  async function fetchNode(token: string) {
    try {
      const res = await fetch("/api/nodes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNode(data.node ?? null);
    } catch {
      setNode(null);
    } finally {
      setLoading(false);
    }
  }

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

  if (!user) return null;

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
              Manage your self-hosted Fotoro server and connected devices.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={node?.status === "online" ? "success" : "outline"}>
              <span
                className={`mr-1 inline-block size-1.5 rounded-full ${
                  node?.status === "online"
                    ? "animate-pulse-soft bg-white"
                    : "bg-zinc-500"
                }`}
              />
              {node?.status === "online" ? "Server online" : "No server"}
            </Badge>
            {node?.magic_dns ? (
              <Badge variant="outline" className="font-mono text-[11px]">
                {node.magic_dns}
              </Badge>
            ) : null}
          </div>
        </div>

        <DashboardStats />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <ServerNodeCard node={node} />
            {node?.status === "online" ? (
              <UploadZone node={node} token={getStoredToken() ?? ""} />
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center ring-soft">
                <Upload className="mx-auto mb-3 size-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  Connect your server to upload
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Install Fotoro on your laptop, run setup, and sign in with the same Google account.
                </p>
              </div>
            )}
            <DeviceList />
          </div>
          <QrPair />
        </div>
      </motion.main>
    </>
  );
}

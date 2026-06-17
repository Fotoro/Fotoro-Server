"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import {
  ConnectivityBadge,
  useNodeConnectivity,
} from "@/components/dashboard/connectivity-badge";
import { PhotoGallery } from "@/components/dashboard/photo-gallery";
import {
  clearAuth,
  getStoredToken,
  getStoredUser,
  type FotoroUser,
} from "@/lib/fotoro-session";
import type { NodePublic } from "@/lib/fotoro-local";

export default function LibraryPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<FotoroUser | null>(null);
  const [node, setNode] = React.useState<NodePublic | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function init() {
      const supabaseToken = getStoredToken();
      const stored = getStoredUser();
      if (!supabaseToken || !stored) {
        router.replace("/login?callbackUrl=/dashboard/library");
        return;
      }
      setUser(stored);
      setToken(supabaseToken);

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
    void init();
  }, [router]);

  const { state, baseUrl, error, refresh } = useNodeConnectivity(
    node,
    token
  );

  function handleLogout() {
    clearAuth();
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading library…
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
        className="container-tight w-full px-5 py-8"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Media library
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Your photos
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Loaded directly from your machine — metadata never stored on Vercel.
            </p>
          </div>
          <ConnectivityBadge state={state} onRefresh={refresh} />
        </div>

        {error || node?.connect_error ? (
          <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
            {error || node?.connect_error}
          </p>
        ) : null}

        {state === "online" && baseUrl && token ? (
          <PhotoGallery baseUrl={baseUrl} supabaseToken={token} />
        ) : state === "checking" ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Checking connection to your server…
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-sm font-medium text-foreground">Server unreachable</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Run <code className="rounded bg-muted px-1">./fotoro server</code> on your
              machine and ensure Tailscale Funnel is active.
            </p>
          </div>
        )}
      </motion.main>
    </>
  );
}

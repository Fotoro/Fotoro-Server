"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { ConnectivityBadge } from "@/components/dashboard/connectivity-badge";
import { PhotoGallery } from "@/components/dashboard/photo-gallery";
import {
  clearAuth,
  clearProxyCookie,
  getStoredToken,
  getStoredUser,
  type FotoroUser,
} from "@/lib/fotoro-session";
import { useServerData } from "@/components/dashboard/server-data-provider";

export default function LibraryPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<FotoroUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { online, refresh } = useServerData();

  React.useEffect(() => {
    const t = getStoredToken();
    const stored = getStoredUser();
    if (!t || !stored) {
      router.replace("/login?callbackUrl=/dashboard/library");
      return;
    }
    setUser(stored);
    setToken(t);
    setLoading(false);
  }, [router]);

  function handleLogout() {
    clearAuth();
    void clearProxyCookie();
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

  if (!user || !token) return null;

  const connState = online;

  return (
    <>
      <DashboardTopbar user={user} onLogout={handleLogout} />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="container-tight flex min-h-0 w-full flex-1 flex-col px-5 py-8"
      >
        <div className="mb-4 flex shrink-0 flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Media library
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Your photos</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Medium thumbnails first — full image loads on click.
            </p>
          </div>
          <ConnectivityBadge state={connState} onRefresh={refresh} />
        </div>

        {connState === "online" ? (
          <PhotoGallery />
        ) : connState === "checking" ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Checking connection…
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Server unreachable — run <code className="rounded bg-muted px-1">./fotoro server</code>
            </p>
          </div>
        )}
      </motion.main>
    </>
  );
}

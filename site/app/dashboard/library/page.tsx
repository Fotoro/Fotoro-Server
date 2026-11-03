"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { ConnectivityBadge } from "@/components/dashboard/connectivity-badge";
import { PhotoGallery, type PhotoGalleryHandle } from "@/components/dashboard/photo-gallery";
import { UploadZone } from "@/components/dashboard/upload-zone";
import {
  clearAuth,
  clearProxyCookie,
  getValidAccessToken,
  getStoredUser,
  type FotoroUser,
} from "@/lib/fotoro-session";
import { useServerData } from "@/components/dashboard/server-data-provider";

export default function LibraryPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<FotoroUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { node, online, refresh } = useServerData();
  const galleryRef = React.useRef<PhotoGalleryHandle>(null);

  React.useEffect(() => {
    async function init() {
      const t = await getValidAccessToken();
      const stored = getStoredUser();
      if (!t || !stored) {
        router.replace("/login?callbackUrl=/dashboard/library");
        return;
      }
      setUser(stored);
      setToken(t);
      setLoading(false);
    }
    void init();
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
        className="archive-page container-tight flex min-h-0 w-full flex-1 flex-col px-5 py-8"
      >
        <div className="archive-heading-row mb-4 flex shrink-0 flex-wrap items-end justify-between gap-3">
          <div>
            <p className="matrix-label">MY ARCHIVE</p>
            <h1 className="font-display">The days we keep.</h1>
            <p className="archive-subtitle">Original media, arranged by the time it was captured.</p>
          </div>
          <div className="flex flex-col items-end gap-3"><div className="archive-current"><strong>{node?.node_name ?? "Your server"}</strong>PRIVATE ARCHIVE · {online === "online" ? "CONNECTED" : online.toUpperCase()}</div><ConnectivityBadge state={connState} onRefresh={refresh} /></div>
        </div>

        <div className="grid min-h-0 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <PhotoGallery ref={galleryRef} />
          {(online === "online" || online === "reconnecting") && node ? (
            <UploadZone
              onUploaded={() => {
                void refresh();
                galleryRef.current?.refresh();
              }}
            />
          ) : null}
        </div>
      </motion.main>
    </>
  );
}

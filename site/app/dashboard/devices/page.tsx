"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { DeviceList } from "@/components/dashboard/device-list";
import { QrPair } from "@/components/dashboard/qr-pair";
import { ConnectivityBadge } from "@/components/dashboard/connectivity-badge";
import { clearAuth, clearProxyCookie, getStoredUser, type FotoroUser } from "@/lib/fotoro-session";
import { useServerData } from "@/components/dashboard/server-data-provider";

export default function DevicesPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<FotoroUser | null>(null);
  const { online, refresh } = useServerData();

  React.useEffect(() => {
    if (!getStoredUser()) {
      router.replace("/login?callbackUrl=/dashboard/devices");
      return;
    }
    setUser(getStoredUser());
  }, [router]);

  if (!user) return null;

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
      <motion.main className="container-tight w-full px-5 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Devices</p>
            <h1 className="mt-1 text-2xl font-semibold">Connected devices</h1>
          </div>
          <ConnectivityBadge state={online} onRefresh={refresh} />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <DeviceList />
          <QrPair />
        </div>
      </motion.main>
    </>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { clearAuth, clearProxyCookie, getStoredUser, type FotoroUser } from "@/lib/fotoro-session";
import { TBE } from "@/lib/fotoro-server-data";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<FotoroUser | null>(null);

  React.useEffect(() => {
    if (!getStoredUser()) router.replace("/login?callbackUrl=/dashboard/settings");
    else setUser(getStoredUser());
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
      <main className="container-tight w-full px-5 py-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold">Server settings</h1>
        <p className="mt-8 rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          {TBE}
        </p>
      </main>
    </>
  );
}

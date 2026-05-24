import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { DashboardStats } from "@/components/dashboard/stats";
import { DeviceList } from "@/components/dashboard/device-list";
import { QrPair } from "@/components/dashboard/qr-pair";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your self-hosted Fotoro server.",
};

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user ?? undefined;

  return (
    <>
      <DashboardTopbar user={user} />
      <main className="container-tight w-full px-5 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Overview
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your local Fotoro server is up, indexing in the background. Nothing leaves your network.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">
              <span className="mr-1 inline-block size-1.5 animate-pulse-soft rounded-full bg-white" />
              All systems healthy
            </Badge>
            <Badge variant="outline" className="font-mono text-[11px]">
              fotoro.local:8080
            </Badge>
          </div>
        </div>

        <DashboardStats />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <DeviceList />
          <QrPair />
        </div>
      </main>
    </>
  );
}

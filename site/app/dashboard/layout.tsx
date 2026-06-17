import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { ServerDataProvider } from "@/components/dashboard/server-data-provider";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your self-hosted Fotoro server.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ServerDataProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </ServerDataProvider>
  );
}

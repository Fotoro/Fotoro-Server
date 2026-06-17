import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your self-hosted Fotoro server.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

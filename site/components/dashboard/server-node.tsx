"use client";

import { motion } from "framer-motion";
import { Server, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NodeInfo } from "@/app/dashboard/page";

export function ServerNodeCard({ node }: { node: NodeInfo | null }) {
  if (!node) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6 ring-soft"
      >
        <div className="flex items-center gap-2">
          <Server className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold tracking-tight">Your Fotoro server</h3>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          No server connected yet. Install Fotoro on your laptop and run the setup wizard.
        </p>
      </motion.div>
    );
  }

  const online = node.status === "online";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-border bg-card ring-soft"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Server className="size-4 text-foreground" />
          <h3 className="text-sm font-semibold tracking-tight">
            {node.node_name || "Fotoro server"}
          </h3>
        </div>
        <Badge variant={online ? "success" : "outline"}>
          {online ? (
            <Wifi className="mr-1 size-3" />
          ) : (
            <WifiOff className="mr-1 size-3" />
          )}
          {online ? "Online" : "Offline"}
        </Badge>
      </div>
      <dl className="divide-y divide-border">
        {[
          { label: "Tailscale IP", value: node.tailscale_ip },
          { label: "Magic DNS", value: node.magic_dns ?? "—" },
          { label: "Tailnet", value: node.tailnet_name ?? "—" },
          {
            label: "Last seen",
            value: new Date(node.last_seen).toLocaleString(),
          },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between px-5 py-3 text-sm"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="font-mono text-xs text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}

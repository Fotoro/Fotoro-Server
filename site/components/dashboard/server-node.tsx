"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Server, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NodePublic } from "@/lib/fotoro-local";

export function ServerNodeCard({
  node,
  liveState,
  connectError,
}: {
  node: NodePublic | null;
  liveState?: "online" | "offline" | "checking" | "syncing";
  connectError?: string | null;
}) {
  if (!node) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="matrix-panel p-6"
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

  const online = liveState === "online" || (liveState === undefined && node.live);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="matrix-panel"
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
        <div className="flex items-center justify-between px-5 py-3 text-sm">
          <dt className="text-muted-foreground">Connection</dt>
          <dd className="font-mono text-xs text-foreground">Private server route</dd>
        </div>
        {connectError || node.connect_error ? (
          <div className="px-5 py-3 text-xs text-muted-foreground">
            {connectError || node.connect_error}
          </div>
        ) : null}
      </dl>
    </motion.div>
  );
}

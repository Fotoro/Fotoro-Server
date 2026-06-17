"use client";

import * as React from "react";
import { Loader2, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  checkServerStatus,
  getNodeBaseUrl,
  type ConnectivityState,
  type NodePublic,
} from "@/lib/fotoro-local";

export function useNodeConnectivity(
  node: NodePublic | null,
  supabaseToken: string | null
) {
  const [state, setState] = React.useState<ConnectivityState>("checking");
  const [baseUrl, setBaseUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const probe = React.useCallback(async () => {
    if (!supabaseToken) {
      setState("offline");
      return;
    }
    if (!node) {
      setState("offline");
      setError("No server registered — run ./fotoro setup");
      return;
    }

    setBaseUrl(getNodeBaseUrl(node));
    setState("checking");

    const result = await checkServerStatus(null, supabaseToken);
    setState(result.state);
    setError(result.error ?? null);
  }, [node, supabaseToken]);

  React.useEffect(() => {
    void probe();
    const id = setInterval(() => void probe(), 60_000);
    return () => clearInterval(id);
  }, [probe]);

  return { state, baseUrl, error, refresh: probe };
}

export function ConnectivityBadge({
  state,
  onRefresh,
}: {
  state: ConnectivityState;
  onRefresh?: () => void;
}) {
  const variant =
    state === "online"
      ? "success"
      : state === "syncing"
        ? "outline"
        : "outline";

  const label =
    state === "checking"
      ? "Checking…"
      : state === "online"
        ? "Online"
        : state === "syncing"
          ? "Syncing"
          : "Offline";

  const Icon =
    state === "online" ? Wifi : state === "checking" ? Loader2 : WifiOff;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant}>
        <Icon
          className={`mr-1 size-3 ${state === "checking" ? "animate-spin" : ""}`}
        />
        {label}
      </Badge>
      {onRefresh ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onRefresh}
          aria-label="Refresh connection"
        >
          <RefreshCw className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}

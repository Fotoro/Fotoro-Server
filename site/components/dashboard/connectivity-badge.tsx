"use client";

import * as React from "react";
import { Loader2, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  checkServerStatus,
  fetchLocalCredentials,
  type ConnectivityState,
  getNodeBaseUrl,
  type NodePublic,
} from "@/lib/fotoro-local";

export function useNodeConnectivity(
  node: NodePublic | null,
  supabaseToken: string | null
) {
  const [state, setState] = React.useState<ConnectivityState>("checking");
  const [baseUrl, setBaseUrl] = React.useState<string | null>(null);
  const [localToken, setLocalToken] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const probe = React.useCallback(async () => {
    if (!node || !supabaseToken) {
      setState("offline");
      return;
    }
    const url = getNodeBaseUrl(node);
    if (!url) {
      setState("offline");
      setError("No funnel URL — run ./fotoro server on your machine");
      return;
    }

    setState("checking");
    setError(null);
    try {
      const creds = await fetchLocalCredentials(supabaseToken);
      setBaseUrl(creds.base_url);
      setLocalToken(creds.local_token);
      const live = await checkServerStatus(creds.base_url, creds.local_token);
      setState(live);
    } catch (err) {
      setState("offline");
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  }, [node, supabaseToken]);

  React.useEffect(() => {
    void probe();
    const id = setInterval(() => void probe(), 60_000);
    return () => clearInterval(id);
  }, [probe]);

  return { state, baseUrl, localToken, error, refresh: probe };
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

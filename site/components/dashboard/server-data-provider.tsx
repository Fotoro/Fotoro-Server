"use client";

import * as React from "react";
import { getStoredRefreshToken, getValidAccessToken, syncProxyCookie } from "@/lib/fotoro-session";
import {
  fetchLibraryStats,
  fetchServerDevices,
  type ServerDevice,
  type ServerLibraryStats,
} from "@/lib/fotoro-server-data";
import { checkServerStatus, type ConnectivityState } from "@/lib/fotoro-local";
import type { NodePublic } from "@/lib/fotoro-local";

interface ServerDataContextValue {
  token: string | null;
  node: NodePublic | null;
  endpoint: string | null;
  online: ConnectivityState;
  connectError: string | null;
  stats: ServerLibraryStats | null;
  devices: ServerDevice[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const ServerDataContext = React.createContext<ServerDataContextValue>({
  token: null,
  node: null,
  endpoint: null,
  online: "offline",
  connectError: null,
  stats: null,
  devices: [],
  loading: true,
  refresh: async () => {},
});

export function ServerDataProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(null);
  const [node, setNode] = React.useState<NodePublic | null>(null);
  const [endpoint, setEndpoint] = React.useState<string | null>(null);
  const [online, setOnline] = React.useState<ConnectivityState>("checking");
  const [connectError, setConnectError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<ServerLibraryStats | null>(null);
  const [devices, setDevices] = React.useState<ServerDevice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const nodeRef = React.useRef<NodePublic | null>(null);
  const lastNodeLookup = React.useRef(0);
  const refreshInFlight = React.useRef<Promise<void> | null>(null);

  const refresh = React.useCallback((): Promise<void> => {
    if (refreshInFlight.current) return refreshInFlight.current;
    const run = async () => {
      const t = await getValidAccessToken();
      setToken(t);
      setLoading(false);
      if (!t) {
        if (getStoredRefreshToken()) {
          setOnline("reconnecting");
          setConnectError("Sign-in refresh is temporarily unavailable. Retrying.");
        } else {
          setOnline("offline");
          setConnectError("Session expired — sign in again.");
        }
        return;
      }

      void syncProxyCookie(t).catch(() => {});
      let nextNode = nodeRef.current;
      if (!nextNode || Date.now() - lastNodeLookup.current > 10 * 60_000) {
        try {
          const response = await fetch("/api/nodes", {
            headers: { Authorization: `Bearer ${t}` },
            signal: AbortSignal.timeout(6_000),
          });
          if (!response.ok) throw new Error(`Device lookup failed (${response.status})`);
          const body = await response.json();
          nextNode = body.node ?? null;
          nodeRef.current = nextNode;
          lastNodeLookup.current = Date.now();
          setNode(nextNode);
          setEndpoint(nextNode?.direct_url ?? null);
        } catch (error) {
          if (!nextNode) {
            setConnectError(error instanceof Error ? error.message : "Device lookup failed");
            setOnline("reconnecting");
            return;
          }
          // Keep the registered URL already in use when cloud lookup blips.
        }
      }
      const baseUrl = nextNode?.direct_url ?? null;
      if (!nextNode) {
        setOnline("offline");
        setConnectError("No server linked to this account.");
        return;
      }
      if (!baseUrl) {
        setOnline("reconnecting");
        setConnectError("No public Tailscale Funnel URL is registered. Run ./fotoro nodesync.");
        return;
      }
      const conn = await checkServerStatus(baseUrl, t);
      if (conn.state !== "online") {
        setOnline("reconnecting");
        setConnectError(conn.error ?? null);
        return;
      }

      setOnline("online");
      setConnectError(null);
      const [nextStats, nextDevices] = await Promise.allSettled([
        fetchLibraryStats(t, baseUrl),
        fetchServerDevices(t, baseUrl),
      ]);
      if (nextStats.status === "fulfilled" && nextStats.value) setStats(nextStats.value);
      if (nextDevices.status === "fulfilled") setDevices(nextDevices.value);
      setLoading(false);
    };
    refreshInFlight.current = run().catch((error) => {
      setOnline("reconnecting");
      setConnectError(error instanceof Error ? error.message : "Connection check failed. Retrying.");
    }).finally(() => {
      refreshInFlight.current = null;
    });
    return refreshInFlight.current;
  }, []);

  React.useEffect(() => {
    void refresh();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 90_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("online", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      window.removeEventListener("online", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  React.useEffect(() => {
    if (online !== "reconnecting") return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 10_000);
    return () => clearInterval(id);
  }, [online, refresh]);

  return (
    <ServerDataContext.Provider
      value={{ token, node, endpoint, online, connectError, stats, devices, loading, refresh }}
    >
      {children}
    </ServerDataContext.Provider>
  );
}

export function useServerData() {
  return React.useContext(ServerDataContext);
}

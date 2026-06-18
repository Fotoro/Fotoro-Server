"use client";

import * as React from "react";
import { getStoredToken, syncProxyCookie } from "@/lib/fotoro-session";
import {
  fetchLibraryStats,
  fetchServerDevices,
  type ServerDevice,
  type ServerLibraryStats,
} from "@/lib/fotoro-server-data";
import { checkServerStatus, type ConnectivityState } from "@/lib/fotoro-local";
import { getNodeBaseUrl } from "@/lib/fotoro-url";

interface ServerDataContextValue {
  token: string | null;
  funnelBase: string | null;
  online: ConnectivityState;
  stats: ServerLibraryStats | null;
  devices: ServerDevice[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const ServerDataContext = React.createContext<ServerDataContextValue>({
  token: null,
  funnelBase: null,
  online: "offline",
  stats: null,
  devices: [],
  loading: true,
  refresh: async () => {},
});

export function ServerDataProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(null);
  const [funnelBase, setFunnelBase] = React.useState<string | null>(null);
  const [online, setOnline] = React.useState<ConnectivityState>("checking");
  const [stats, setStats] = React.useState<ServerLibraryStats | null>(null);
  const [devices, setDevices] = React.useState<ServerDevice[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    const t = getStoredToken();
    setToken(t);
    if (!t) {
      setFunnelBase(null);
      setOnline("offline");
      setStats(null);
      setDevices([]);
      setLoading(false);
      return;
    }

    await syncProxyCookie(t);

    const conn = await checkServerStatus(null, t);
    setOnline(conn.state);

    if (conn.state !== "online") {
      setFunnelBase(null);
      setStats(null);
      setDevices([]);
      setLoading(false);
      return;
    }

    const [s, d, nodeRes] = await Promise.all([
      fetchLibraryStats(t),
      fetchServerDevices(t),
      fetch("/api/nodes", { headers: { Authorization: `Bearer ${t}` } }).catch(
        () => null
      ),
    ]);
    setStats(s);
    setDevices(d);

    if (nodeRes?.ok) {
      const nodeData = (await nodeRes.json().catch(() => ({}))) as {
        node?: { public_url?: string; tailnet_url?: string; magic_dns?: string };
      };
      setFunnelBase(nodeData.node ? getNodeBaseUrl(nodeData.node) : null);
    } else {
      setFunnelBase(null);
    }

    setLoading(false);
  }, []);

  React.useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 90_000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <ServerDataContext.Provider
      value={{ token, funnelBase, online, stats, devices, loading, refresh }}
    >
      {children}
    </ServerDataContext.Provider>
  );
}

export function useServerData() {
  return React.useContext(ServerDataContext);
}

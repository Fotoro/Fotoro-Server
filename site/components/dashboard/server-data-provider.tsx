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

interface ServerDataContextValue {
  token: string | null;
  online: ConnectivityState;
  stats: ServerLibraryStats | null;
  devices: ServerDevice[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const ServerDataContext = React.createContext<ServerDataContextValue>({
  token: null,
  online: "offline",
  stats: null,
  devices: [],
  loading: true,
  refresh: async () => {},
});

export function ServerDataProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(null);
  const [online, setOnline] = React.useState<ConnectivityState>("checking");
  const [stats, setStats] = React.useState<ServerLibraryStats | null>(null);
  const [devices, setDevices] = React.useState<ServerDevice[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    const t = getStoredToken();
    setToken(t);
    if (!t) {
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
      setStats(null);
      setDevices([]);
      setLoading(false);
      return;
    }

    const [s, d] = await Promise.all([
      fetchLibraryStats(t),
      fetchServerDevices(t),
    ]);
    setStats(s);
    setDevices(d);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 90_000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <ServerDataContext.Provider
      value={{ token, online, stats, devices, loading, refresh }}
    >
      {children}
    </ServerDataContext.Provider>
  );
}

export function useServerData() {
  return React.useContext(ServerDataContext);
}

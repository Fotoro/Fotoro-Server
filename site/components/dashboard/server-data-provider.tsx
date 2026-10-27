"use client";

import * as React from "react";
import { getValidAccessToken, syncProxyCookie } from "@/lib/fotoro-session";
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
  connectError: string | null;
  stats: ServerLibraryStats | null;
  devices: ServerDevice[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const ServerDataContext = React.createContext<ServerDataContextValue>({
  token: null,
  online: "offline",
  connectError: null,
  stats: null,
  devices: [],
  loading: true,
  refresh: async () => {},
});

export function ServerDataProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(null);
  const [online, setOnline] = React.useState<ConnectivityState>("checking");
  const [connectError, setConnectError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<ServerLibraryStats | null>(null);
  const [devices, setDevices] = React.useState<ServerDevice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const stateRef = React.useRef<ConnectivityState>("checking");
  const failedProbes = React.useRef(0);
  const refreshInFlight = React.useRef<Promise<void> | null>(null);

  const refresh = React.useCallback((): Promise<void> => {
    if (refreshInFlight.current) return refreshInFlight.current;
    const run = async () => {
      const t = await getValidAccessToken();
      setToken(t);
      if (!t) {
        stateRef.current = "offline";
        setOnline("offline");
        setConnectError("Session expired — sign in again.");
        setStats(null);
        setDevices([]);
        setLoading(false);
        return;
      }

      await syncProxyCookie(t);

      const conn = await checkServerStatus(null, t);
      if (conn.state !== "online") {
        failedProbes.current++;
        // A wake-up or one lost relay response should not make an open library
        // flash offline and discard its measured data.
        if (stateRef.current === "online" && failedProbes.current < 2) {
          setLoading(false);
          return;
        }
        stateRef.current = "offline";
        setOnline("offline");
        setConnectError(conn.error ?? null);
        setStats(null);
        setDevices([]);
        setLoading(false);
        return;
      }

      failedProbes.current = 0;
      stateRef.current = "online";
      setOnline("online");
      setConnectError(null);
      const [nextStats, nextDevices] = await Promise.allSettled([
        fetchLibraryStats(t),
        fetchServerDevices(t),
      ]);
      if (nextStats.status === "fulfilled") setStats(nextStats.value);
      if (nextDevices.status === "fulfilled") setDevices(nextDevices.value);
      setLoading(false);
    };
    refreshInFlight.current = run().finally(() => {
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

  return (
    <ServerDataContext.Provider
      value={{ token, online, connectError, stats, devices, loading, refresh }}
    >
      {children}
    </ServerDataContext.Provider>
  );
}

export function useServerData() {
  return React.useContext(ServerDataContext);
}

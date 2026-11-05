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
import { decryptNodeEndpoint, unlockNodeVault, type EndpointEnvelope } from "@/lib/node-vault";

interface ServerDataContextValue {
  token: string | null;
  node: NodePublic | null;
  endpoint: string | null;
  online: ConnectivityState;
  connectError: string | null;
  stats: ServerLibraryStats | null;
  devices: ServerDevice[];
  loading: boolean;
  vaultConfigured: boolean;
  vaultLocked: boolean;
  unlockVault: (recoveryKey: string) => Promise<void>;
  refresh: (force?: boolean) => Promise<void>;
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
  vaultConfigured: false,
  vaultLocked: false,
  unlockVault: async () => {},
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
  const [vaultConfigured, setVaultConfigured] = React.useState(false);
  const [vaultLocked, setVaultLocked] = React.useState(false);
  const endpointKeyRef = React.useRef<CryptoKey | null>(null);
  const nodeRef = React.useRef<NodePublic | null>(null);
  const lastNodeLookup = React.useRef(0);
  const refreshInFlight = React.useRef<Promise<void> | null>(null);

  const refresh = React.useCallback((force = false): Promise<void> => {
    if (force) lastNodeLookup.current = 0;
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

      let nextNode = nodeRef.current;
      if (!nextNode || Date.now() - lastNodeLookup.current > 10 * 60_000) {
        try {
          const response = await fetch("/api/nodes", {
            headers: { Authorization: `Bearer ${t}` },
            signal: AbortSignal.timeout(6_000),
          });
          if (!response.ok) throw new Error(`Device lookup failed (${response.status})`);
          const body = await response.json();
          const encryptedNode = body.node as (NodePublic & { endpoint_envelope?: EndpointEnvelope | null }) | null;
          const envelope = encryptedNode?.endpoint_envelope ?? null;
          setVaultConfigured(Boolean(envelope));
          nextNode = encryptedNode;
          if (encryptedNode && !envelope) {
            setVaultLocked(false);
            const lockedNode = { ...encryptedNode, direct_url: null, private_url: null };
            nodeRef.current = lockedNode;
            lastNodeLookup.current = Date.now();
            setNode(lockedNode);
            setEndpoint(null);
            setOnline("reconnecting");
            setConnectError("Run ./fotoro nodesync on your Linux host to publish its encrypted route.");
            setLoading(false);
            return;
          }
          if (encryptedNode && envelope) {
            if (!endpointKeyRef.current) {
              setVaultLocked(true);
              const lockedNode = { ...encryptedNode, direct_url: null, private_url: null };
              nodeRef.current = lockedNode;
              lastNodeLookup.current = Date.now();
              setNode(lockedNode);
              setEndpoint(null);
              setOnline("reconnecting");
              setConnectError("Enter this host's recovery key in Account settings to unlock its Tailscale route.");
              setLoading(false);
              return;
            }
            let details: Awaited<ReturnType<typeof decryptNodeEndpoint>>;
            try {
              details = await decryptNodeEndpoint(endpointKeyRef.current, envelope);
            } catch (error) {
              endpointKeyRef.current = null;
              setVaultLocked(true);
              const lockedNode = { ...encryptedNode, direct_url: null, private_url: null };
              nodeRef.current = lockedNode;
              lastNodeLookup.current = Date.now();
              setNode(lockedNode);
              setEndpoint(null);
              setOnline("reconnecting");
              setConnectError(error instanceof Error ? error.message : "The saved route could not be unlocked.");
              setLoading(false);
              return;
            }
            nextNode = {
              ...encryptedNode,
              direct_url: details.public_url ?? details.tailnet_url,
              private_url: details.tailnet_url,
            };
            setVaultLocked(false);
          }
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
      void syncProxyCookie(t, baseUrl).catch(() => {});
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

  const unlockVault = React.useCallback(async (recoveryKey: string) => {
    const encryptedNode = nodeRef.current as (NodePublic & { endpoint_envelope?: EndpointEnvelope | null }) | null;
    const envelope = encryptedNode?.endpoint_envelope;
    if (!envelope) throw new Error("No encrypted server route is registered yet. Run ./fotoro nodesync on the Linux host.");
    const key = await unlockNodeVault(recoveryKey);
    await decryptNodeEndpoint(key, envelope);
    endpointKeyRef.current = key;
    nodeRef.current = null;
    lastNodeLookup.current = 0;
    setVaultLocked(false);
    await refresh(true);
  }, [refresh]);

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
      value={{ token, node, endpoint, online, connectError, stats, devices, loading,
        vaultConfigured, vaultLocked, unlockVault, refresh }}
    >
      {children}
    </ServerDataContext.Provider>
  );
}

export function useServerData() {
  return React.useContext(ServerDataContext);
}

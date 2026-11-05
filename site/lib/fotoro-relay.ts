import { normalizeFotoroServerUrl, tailscaleFunnelOrigin } from "@/lib/fotoro-url";

/** A socket-activated home server may need one short wake retry. Only retry reads. */
export async function fetchRelayWithWakeRetry(target: string, init: RequestInit): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return fetch(target, init);
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(target, init);
      if (attempt === 0 && [502, 503, 504].includes(response.status)) {
        await response.body?.cancel();
        await new Promise((resolve) => setTimeout(resolve, 700));
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 700));
    }
  }
  throw lastError ?? new Error("Home server unavailable");
}

export type RelayDiagnosticCode =
  | "ONLINE"
  | "NO_NODE"
  | "NO_RELAY_URL"
  | "RELAY_UNREACHABLE"
  | "FUNNEL_BAD_GATEWAY"
  | "AUTH_FAILED"
  | "SERVER_ERROR";

export type RelayDiagnostic = {
  online: boolean;
  code: RelayDiagnosticCode;
  stage: "node_lookup" | "relay_url" | "health_probe" | "auth_probe";
  message: string;
  status?: number;
  lastSeen?: string | null;
  hasPublicUrl?: boolean;
  hasTailnetUrl?: boolean;
};

/** Resolve a short-lived owner-supplied endpoint; never read route data from Supabase. */
export async function getRelayBaseUrlForUser(userId: string, endpoint?: string | null): Promise<string> {
  if (!userId) throw new Error("No signed-in owner");
  // A same-host deployment reaches the loopback Go API while the browser uses
  // the single private Tailscale Serve origin. The bearer is still checked by Go.
  const localServer = process.env.FOTORO_LOCAL_SERVER_URL?.trim();
  if (localServer) {
    const parsed = new URL(localServer);
    if (parsed.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname)) {
      throw new Error("FOTORO_LOCAL_SERVER_URL must use a loopback HTTP address");
    }
    return parsed.origin;
  }

  const base = tailscaleFunnelOrigin(endpoint);
  if (!base) {
    throw new Error("Unlock the endpoint vault and reconnect to your Tailscale route");
  }
  return normalizeFotoroServerUrl(base);
}

export async function relayFetch(
  userId: string,
  bearer: string,
  path: string,
  search = "",
  init?: RequestInit,
  endpoint?: string | null
): Promise<Response> {
  const base = await getRelayBaseUrlForUser(userId, endpoint);
  const target = new URL(path.replace(/^\//, ""), base.endsWith("/") ? base : `${base}/`);
  if (search) target.search = search;

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${bearer}`);

  return fetchRelayWithWakeRetry(target.toString(), {
    ...init,
    headers,
    signal: init?.signal ?? AbortSignal.timeout(30_000),
  });
}

export async function diagnoseRelayConnectivity(
  userId: string,
  bearer: string,
  endpoint?: string | null
): Promise<RelayDiagnostic & { photos?: number }> {
  let base: string | null = null;
  try {
    base = await getRelayBaseUrlForUser(userId, endpoint);
  } catch {
    base = null;
  }

  if (!base) {
    return {
      online: false,
      code: "NO_RELAY_URL",
      stage: "relay_url",
      message: "Unlock the endpoint vault and reconnect to your Tailscale route.",
    };
  }

  const target = (path: string) =>
    new URL(path.replace(/^\//, ""), base.endsWith("/") ? base : `${base}/`).toString();

  try {
    const probe = await fetchRelayWithWakeRetry(target("api/v1/me"), {
      headers: { Authorization: `Bearer ${bearer}` },
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });
    const data = await probe.json().catch(() => ({}));
    if (!probe.ok) {
      const raw = (data as { error?: string }).error ?? `Authenticated probe returned HTTP ${probe.status}`;
      return {
        online: false,
        code: probe.status === 401 || probe.status === 403 ? "AUTH_FAILED" : probe.status === 502 ? "FUNNEL_BAD_GATEWAY" : "SERVER_ERROR",
        stage: "auth_probe",
        status: probe.status,
        message:
          probe.status === 401 || probe.status === 403
            ? "Relay is reachable, but the local server rejected the website session. Sign in with the same account on the website and CLI, then run ./fotoro nodesync."
            : sanitizeRelayError(raw),
      };
    }

    return {
      online: true,
      code: "ONLINE",
      stage: "auth_probe",
      message: "Server is online through the private route.",
    };
  } catch (err) {
    return {
      online: false,
      code: "SERVER_ERROR",
      stage: "auth_probe",
      message:
        sanitizeRelayError(err instanceof Error ? err.message : "Authenticated probe failed") ||
        "Relay is reachable, but the authenticated server probe failed.",
    };
  }
}

/** Strip funnel hosts and IPs from errors shown in the browser. */
export function sanitizeRelayError(message: string): string {
  return message
    .replace(/https?:\/\/[^\s)]+/gi, "[relay]")
    .replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, "[hidden]")
    .replace(/funnel at \[relay\]/gi, "home server via relay")
    .trim();
}

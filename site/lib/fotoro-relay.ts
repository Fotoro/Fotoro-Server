import { createAdminClient } from "@/lib/supabase/admin";
import { getNodeBaseUrl } from "@/lib/fotoro-url";

type RelayNodeRow = {
  public_url?: string | null;
  tailnet_url?: string | null;
  magic_dns?: string | null;
  last_seen?: string | null;
};

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

/** Server-side only — funnel URL never sent to the browser. */
export async function getRelayBaseUrlForUser(userId: string): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("nodes")
    .select("public_url, tailnet_url, magic_dns")
    .eq("user_id", userId)
    .order("last_seen", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("No server registered — run ./fotoro setup");

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

  const base = getNodeBaseUrl(data);
  if (!base) {
    throw new Error(
      process.env.NODE_ENV === "production"
        ? "No private server route configured — run the website beside Fotoro or set FOTORO_ALLOW_TAILNET_RELAY=1 on a tailnet host"
        : "No server route configured — run ./fotoro server"
    );
  }
  return base;
}

async function getRelayNodeForUser(userId: string): Promise<RelayNodeRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("nodes")
    .select("public_url, tailnet_url, magic_dns, last_seen")
    .eq("user_id", userId)
    .order("last_seen", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function relayFetch(
  userId: string,
  bearer: string,
  path: string,
  search = "",
  init?: RequestInit
): Promise<Response> {
  const base = await getRelayBaseUrlForUser(userId);
  const target = new URL(path.replace(/^\//, ""), base.endsWith("/") ? base : `${base}/`);
  if (search) target.search = search;

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${bearer}`);

  return fetch(target.toString(), {
    ...init,
    headers,
    signal: init?.signal ?? AbortSignal.timeout(30_000),
  });
}

export async function diagnoseRelayConnectivity(
  userId: string,
  bearer: string
): Promise<RelayDiagnostic & { photos?: number }> {
  let node: RelayNodeRow | null = null;
  try {
    node = await getRelayNodeForUser(userId);
  } catch (err) {
    return {
      online: false,
      code: "SERVER_ERROR",
      stage: "node_lookup",
      message: sanitizeRelayError(err instanceof Error ? err.message : "Node lookup failed"),
    };
  }

  if (!node) {
    return {
      online: false,
      code: "NO_NODE",
      stage: "node_lookup",
      message: "No server linked to this account. Run ./fotoro setup, then ./fotoro nodesync.",
    };
  }

  let base: string | null = null;
  try {
    base = await getRelayBaseUrlForUser(userId);
  } catch {
    base = null;
  }
  const baseInfo = {
    lastSeen: node.last_seen ?? null,
    hasPublicUrl: Boolean(node.public_url),
    hasTailnetUrl: Boolean(node.tailnet_url || node.magic_dns),
  };

  if (!base) {
    return {
      online: false,
      code: "NO_RELAY_URL",
      stage: "relay_url",
      message:
        "Server is registered, but this website cannot reach its private endpoint. Run the website on the Fotoro host or another tailnet host.",
      ...baseInfo,
    };
  }

  const target = (path: string) =>
    new URL(path.replace(/^\//, ""), base.endsWith("/") ? base : `${base}/`).toString();

  try {
    const health = await fetch(target("api/health"), {
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!health.ok) {
      return {
        online: false,
        code: health.status === 502 ? "FUNNEL_BAD_GATEWAY" : "RELAY_UNREACHABLE",
        stage: "health_probe",
        status: health.status,
        message:
          health.status === 502
            ? "The private route is reachable, but it cannot reach ./fotoro server on port 8765."
            : `Relay health check returned HTTP ${health.status}.`,
        ...baseInfo,
      };
    }
  } catch (err) {
    return {
      online: false,
      code: "RELAY_UNREACHABLE",
      stage: "health_probe",
      message:
        sanitizeRelayError(err instanceof Error ? err.message : "Relay health check failed") ||
        "Cannot reach the public relay URL.",
      ...baseInfo,
    };
  }

  try {
    const stats = await fetch(target("api/stats"), {
      headers: { Authorization: `Bearer ${bearer}` },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    const data = await stats.json().catch(() => ({}));
    if (!stats.ok) {
      const raw = (data as { error?: string }).error ?? `Authenticated probe returned HTTP ${stats.status}`;
      return {
        online: false,
        code: stats.status === 401 || stats.status === 403 ? "AUTH_FAILED" : "SERVER_ERROR",
        stage: "auth_probe",
        status: stats.status,
        message:
          stats.status === 401 || stats.status === 403
            ? "Relay is reachable, but the local server rejected the website session. Sign in with the same account on the website and CLI, then run ./fotoro nodesync."
            : sanitizeRelayError(raw),
        ...baseInfo,
      };
    }

    return {
      online: true,
      code: "ONLINE",
      stage: "auth_probe",
      message: "Server is online through the private route.",
      photos: (data as { total?: number }).total ?? 0,
      ...baseInfo,
    };
  } catch (err) {
    return {
      online: false,
      code: "SERVER_ERROR",
      stage: "auth_probe",
      message:
        sanitizeRelayError(err instanceof Error ? err.message : "Authenticated probe failed") ||
        "Relay is reachable, but the authenticated server probe failed.",
      ...baseInfo,
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

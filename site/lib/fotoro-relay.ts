import { createAdminClient } from "@/lib/supabase/admin";
import { getNodeBaseUrl } from "@/lib/fotoro-url";

/** Server-side only — funnel URL never sent to the browser. */
export async function getRelayBaseUrlForUser(userId: string): Promise<string> {
  const localServer = process.env.FOTORO_LOCAL_SERVER_URL?.trim();
  if (localServer && process.env.NODE_ENV !== "production") {
    return localServer;
  }

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

  const base = getNodeBaseUrl(data);
  if (!base) {
    throw new Error(
      process.env.NODE_ENV === "production"
        ? "No public Funnel URL configured — run sudo tailscale funnel --bg 8765, set FOTORO_WEB_URL to this Vercel site, then run ./fotoro nodesync"
        : "No relay configured — run ./fotoro server"
    );
  }
  return base;
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

/** Strip funnel hosts and IPs from errors shown in the browser. */
export function sanitizeRelayError(message: string): string {
  return message
    .replace(/https?:\/\/[^\s)]+/gi, "[relay]")
    .replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, "[hidden]")
    .replace(/funnel at \[relay\]/gi, "home server via relay")
    .trim();
}

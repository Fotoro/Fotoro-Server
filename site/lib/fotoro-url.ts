/**
 * Tailscale MagicDNS hostnames can include "@" (email tailnets).
 * URL parsers treat "@" as user:pass — must encode as %40 before fetch.
 */
export function normalizeFotoroServerUrl(raw: string): string {
  let s = raw.trim().replace(/\/$/, "");
  if (!s) return s;
  if (!/^https?:\/\//i.test(s)) {
    s = `https://${s}`;
  }

  const match = s.match(/^(https?:\/\/)([^/?#]+)(.*)$/i);
  if (!match) return s;

  const [, proto, host, rest] = match;
  const encodedHost = host.replace(/@/g, "%40");
  return `${proto}${encodedHost}${rest}`;
}

/** Only a Tailscale Funnel HTTPS origin is eligible for a hosted website relay. */
export function tailscaleFunnelOrigin(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    if (
      url.protocol !== "https:" ||
      !url.hostname.toLowerCase().endsWith(".ts.net") ||
      url.username || url.password || url.port ||
      url.pathname !== "/" || url.search || url.hash
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export function getNodeBaseUrl(node: {
  public_url?: string | null;
  tailnet_url?: string | null;
  magic_dns?: string | null;
}): string | null {
  const allowTailnet =
    process.env.NODE_ENV !== "production" ||
    process.env.FOTORO_ALLOW_TAILNET_RELAY === "1";

  let raw = "";
  if (allowTailnet) {
    raw =
      node.tailnet_url ||
      (node.magic_dns ? `https://${node.magic_dns}` : "");
  }

  // Recording a Funnel URL on the linked node is the owner's opt-in. A hosted
  // website cannot reach a private tailnet address, so use that verified URL.
  if (!raw && process.env.FOTORO_DISABLE_PUBLIC_RELAY !== "1") {
    return tailscaleFunnelOrigin(node.public_url);
  }

  if (!raw) return null;
  return normalizeFotoroServerUrl(raw);
}

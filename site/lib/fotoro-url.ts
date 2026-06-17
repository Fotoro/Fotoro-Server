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

export function getNodeBaseUrl(node: {
  public_url?: string | null;
  tailnet_url?: string | null;
  magic_dns?: string | null;
}): string | null {
  const raw =
    node.public_url ||
    node.tailnet_url ||
    (node.magic_dns ? `https://${node.magic_dns}` : "");
  if (!raw) return null;
  return normalizeFotoroServerUrl(raw);
}

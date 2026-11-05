import { tailscaleFunnelOrigin } from "@/lib/fotoro-url";

export type EndpointEnvelope = {
  version: 1;
  algorithm: "A256GCM";
  nonce: string;
  ciphertext: string;
};

export type NodeEndpointDetails = {
  tailscale_ip: string;
  tailnet_name: string | null;
  magic_dns: string | null;
  public_url: string | null;
  tailnet_url: string | null;
};

const AAD = new TextEncoder().encode("fotoro-node-endpoint-v1");

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function decodeBase64Url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("Recovery key or endpoint data is malformed.");
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export async function unlockNodeVault(recoveryKey: string): Promise<CryptoKey> {
  const rawKey = decodeBase64Url(recoveryKey.trim());
  if (rawKey.length !== 32) throw new Error("Enter the 43-character recovery key shown by ./fotoro endpoint-key.");
  return crypto.subtle.importKey("raw", asArrayBuffer(rawKey), { name: "AES-GCM" }, false, ["decrypt"]);
}

export async function decryptNodeEndpoint(
  key: CryptoKey,
  envelope: EndpointEnvelope
): Promise<NodeEndpointDetails> {
  if (envelope.version !== 1 || envelope.algorithm !== "A256GCM") {
    throw new Error("This server endpoint envelope version is not supported.");
  }
  const nonce = decodeBase64Url(envelope.nonce);
  const ciphertext = decodeBase64Url(envelope.ciphertext);
  if (nonce.length !== 12 || ciphertext.length < 16 || ciphertext.length > 4096) {
    throw new Error("The encrypted server endpoint is malformed.");
  }
  let clear: ArrayBuffer;
  try {
    clear = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: asArrayBuffer(nonce), additionalData: asArrayBuffer(AAD), tagLength: 128 },
      key,
      asArrayBuffer(ciphertext)
    );
  } catch {
    throw new Error("That recovery key could not unlock this server endpoint.");
  }

  const value = JSON.parse(new TextDecoder().decode(clear)) as Partial<NodeEndpointDetails>;
  if (typeof value.tailscale_ip !== "string" || !value.tailscale_ip.trim()) {
    throw new Error("The decrypted server endpoint is incomplete.");
  }
  const route = (raw: unknown) => {
    if (raw == null || raw === "") return null;
    if (typeof raw !== "string") throw new Error("The decrypted server route is malformed.");
    const valid = tailscaleFunnelOrigin(raw);
    if (!valid) throw new Error("The saved route is not a valid Tailscale HTTPS endpoint.");
    return valid;
  };

  return {
    tailscale_ip: value.tailscale_ip,
    tailnet_name: typeof value.tailnet_name === "string" ? value.tailnet_name : null,
    magic_dns: typeof value.magic_dns === "string" ? value.magic_dns : null,
    public_url: route(value.public_url),
    tailnet_url: route(value.tailnet_url),
  };
}

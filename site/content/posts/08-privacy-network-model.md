---
slug: privacy-and-the-network-model
title: "Privacy and the network model"
summary: "Encrypted endpoints, Tailscale, and why the hosted site sees nothing."
publishedAt: 2026-11-11
updatedAt: 2026-11-11
category: building
order: 8
---

# Part 8: Privacy and the network model

Fotoro's threat model inverts the usual one. The hosted service knows
your name - but is designed to be incapable of knowing your address. No
photo bytes, no route material, and not even the *location* of the server
it authenticates for, in cleartext.

## What the cloud actually stores

Supabase holds two things: your account (`users`: id, email, name) and
one `nodes` row: `node_name`, `status`, `last_seen`, and
`endpoint_ciphertext`. The Tailscale IP, the magic-DNS name, the public
URL - everything needed to reach the host - arrives already encrypted.
The migration that shipped this *dropped* the cleartext columns and the
client write policies; inserts and updates now flow only through the
website's service-role API, which **rejects any body containing plaintext
route fields** and shape-validates the envelope before storing it. RLS
lets you read your own row; nobody reads anybody else's.

## The envelope

The host generates a 32-byte AES key once, stores it in `local_secrets`
as `node_endpoint_aes256_v1`, and never sends it anywhere. Every 60
seconds, a heartbeat encrypts `{tailscale_ip, tailnet_name, magic_dns,
public_url, tailnet_url}` with AES-256-GCM - fresh nonce every beat, so
the ciphertext churns constantly - under AAD `fotoro-node-endpoint-v1`,
and POSTs the envelope to `/api/nodes`.

```json
{"version":1,"algorithm":"A256GCM","nonce":"…","ciphertext":"…"}
```

`fotoro endpoint-key` prints the key as a 43-char base64url string. The
owner types it into the browser dashboard and the Android app once.

## Unlocking, without persisting

The browser derives nothing server-side: `crypto.subtle.importKey` makes
a **non-extractable** CryptoKey held in a React ref - the recovery-key
string is never stored by the site (the settings page says exactly that).
Decrypted routes are not trusted either: `tailscaleFunnelOrigin`
re-validates `https:` + `*.ts.net` + no port/userinfo before a URL is
allowed out. Only the *decrypted origin* gets persisted - as an httpOnly
cookie `fotoro_proxy_endpoint` scoped to `/api` - so `<img>` tags can
route through the relay without exposing the value to JS. Android does
the same dance with the key under Keystore wrap.

And the cleanest tell that this design is real: the connectivity probe
deliberately does *not* read the `nodes` row server-side. The route must
come from the owner's unlocked cookie - a server operator with database
access learns a ciphertext and a timestamp.

## Three credentials, one owner

`verifyBearerToken` tries, in order:

1. **`fdev_` device tokens** - 32 random bytes, stored only as a SHA-256
   hex in `device_credentials`. Scoped to `media:read,media:write`,
   route-allowlisted to `/api/v1/media|uploads|device-assets|me`,
   revocable per device, `last_used_at` bumped per call. The token is
   shown exactly once at pairing.
2. **Local tokens** - 5-minute HS256 JWTs minted by the website's
   `/api/local-token` route; the secret is `FOTORO_LOCAL_TOKEN_SECRET`,
   falling back to the first 32 bytes of the Supabase service key - a
   shared-secret derivation that lets the site mint what the host
   verifies without a key exchange.
3. **Supabase JWTs** - RS256/ES256 verified against the project JWKS,
   issuer pinned, 120 s leeway.

Then `authorizeUser` collapses all of it to one question: are you the
owner? The first signed-in account is written to
`server_config.auth_user_id` and every other human gets 403. Device
identities resolve through their credential's `owner_id`. One owner, many
scopes.

**Pairing** is a 10-minute `pairing_sessions` window (secret stored
SHA-256'd, QR payload is `<id>.<secret>`); redeem runs in one transaction
with a `RowsAffected==1` check that makes double-redeem a 409. CLI login
rides the browser through a loopback `/auth/callback` - the site only
redirects to `127.0.0.1|localhost` callback paths - with a service-role
handoff table as fallback when the browser can't reach the CLI's port.

## The network boundary is a feature, not a wall

Tailscale Serve exposes the host to the tailnet by default; Funnel
(public ingress) is opt-in via `FOTORO_FUNNEL=1` and warned-against for
private deployments. The subtlety is *why* the signed media URLs only
exist under Funnel: an HMAC-signed link (`fotoro-media-v1\n<id>\n<variant>
\n<expires>`, ~1-2 h life, minted only when `funnel_enabled` and a
`*.ts.net` public URL check both pass) is **unauthenticated by design** -
the signature *is* the credential. That is correct for CDN-style image
delivery, but it means those links are only minted when a public route
exists to serve them on. In a private Serve deployment the fields simply
aren't attached and every byte flows the authenticated relay instead.

Meanwhile `localOnly()` endpoints (auth, setup) refuse any request that
smells of a proxy - `X-Forwarded-*` headers, a non-loopback host - so the
pairing and session machinery can't be reached through Tailscale at all.
And the escape hatch, `FOTORO_ALLOW_UNAUTHENTICATED_LOCAL`, binds to
loopback RemoteAddr only.

## Design lesson

Defense in depth here isn't "encrypt everything"; it's *minimize what
any layer can leak*. Supabase can't leak the route (it stores ciphertext).
The website can't leak the key (it never has it). The relay can't leak
upstream internals (`sanitizeRelayError` strips URLs, IPs, ports from
errors). Device tokens can't leak into account scope (hash-stored,
route-allowlisted). Signed URLs can't leak access beyond their media id
(HMAC binds id + variant + expiry). The system keeps working because each
layer holds exactly what it needs and nothing it doesn't.

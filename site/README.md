# Website application architecture

`site/` is a Next.js App Router application with two clear surfaces: public, server-rendered product content and an authenticated owner dashboard. The host's Go API and SQLite catalogue remain the authority for media and measurements.

## Identity and routes

Google sign-in establishes a Supabase session. The Linux host creates a random 256-bit AES-GCM key and encrypts its Tailscale route locally before syncing. The key is stored in the host's local SQLite database, whose database and WAL files are restricted to mode `0600`; `./fotoro endpoint-key` prints the same recovery key for the owner to enter on each signed-in browser. Supabase receives only the encrypted envelope and never receives that key. The browser decrypts the route in memory. The authenticated `/api/fotoro/...` fallback relay receives the unlocked route in an HTTP-only cookie so it can reach the host; this protects against Supabase database-only access, not a compromised website deployment, browser session or owner-controlled host. The host still checks owner identity on protected requests. The pairing route creates a short-lived invitation on the linked host, and the phone redeems it for its own restricted token.

The site can run beside the Go API on a private tailnet host, or as a hosted public frontend with a deliberately configured Tailscale Funnel to the host. A hosted server process cannot reach a private tailnet address merely because the browser can. Only the `https://*.ts.net` endpoint registered for the owner is accepted for the hosted relay. The API remains authenticated in both deployments.

## Media path

| Step | Behavior |
| --- | --- |
| List | `/api/v1/media` returns 100 records at a time with capture date, type, copy status and display links. |
| Grid | Virtualized rows use small thumbnails, native lazy loading and asynchronous decode. |
| Viewer | A medium preview appears first, then an available detail copy; deep zoom requests the original. Adjacent previews are prefetched. |
| Direct delivery | Signed media links are scoped to ID, variant and expiry, with private browser caching. The website relay is the fallback. |
| Upload | Browser uploads use resumable chunks and verify the server's receipt; they do not rewrite original bytes. |

The gallery retains loaded photos during a transient refresh failure. In-flight prefetches are deduplicated, and stale page results are ignored when the server endpoint or search changes. These choices keep scrolling work bounded without claiming a measured frame rate on every device.

## SEO and editorial content

The public base URL is `https://fotoro.vercel.app` unless `NEXT_PUBLIC_SITE_URL` names a verified replacement. Public pages set their own canonical and social URL. `sitemap.ts` lists the public pages and source-controlled journal entries; `robots.ts` blocks private dashboard and API paths. Article pages render question-led headings and `BlogPosting` structured data from `content/blog.ts`.

Only source changes can publish a journal post. There is no editor form, upload route or CMS. `/.github/CODEOWNERS` in the repository assigns journal review to `@chknaren6`; branch protection must require that review for repository-level enforcement. Article copy should answer a concrete product question and be checked against the current host and Android behavior before publication.

## Boundaries and verification

The website does not store originals, decide whether a phone file may be deleted, or manufacture dashboard figures. Supabase holds account data and encrypted node-routing material; the host holds media, upload state, device-token hashes and measured storage state. A second-copy indicator depends on a separately mounted and verified backup target. The recovery key is not stored in the account database; the owner can display it again with `./fotoro endpoint-key` while the host database is available. Database-only access cannot decrypt the endpoint, but old plaintext may remain in Supabase backups or point-in-time history until their retention expires.

Before deploying host-side endpoint encryption, apply `supabase/node_endpoint_encryption.sql` in the Supabase SQL editor. This drops the live table's legacy plaintext route columns. Then update each Linux host, run `./fotoro nodesync`, and run `./fotoro endpoint-key`; enter the displayed key in Account settings or the Android app on each device that needs to connect. The website refuses node sync requests containing cleartext endpoint fields. The key is generated automatically on first sync and remains only in the local host database; mobile/browser clients store their entered copy only in device-protected storage or session memory.

`npm run typecheck` and `npm run build` check the public routes and client code. The `smoke:offload` script exercises resumable upload against a disposable image and leaves that image in the target library. Private dashboard behavior still needs an authenticated host and Tailscale route for end-to-end checks.

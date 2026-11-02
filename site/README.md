# Website application architecture

`site/` is a Next.js App Router application with two clear surfaces: public, server-rendered product content and an authenticated owner dashboard. The host's Go API and SQLite catalogue remain the authority for media and measurements.

## Identity and routes

Google sign-in establishes a Supabase session. The site resolves the signed-in user's `nodes` record, which identifies the host endpoint. The host checks the owner identity again on protected requests. The `/api/fotoro/...` route is an authenticated fallback proxy for the browser; `/api/v1/...` exposes compatible device routes. The pairing route creates a short-lived invitation on the linked host, and the phone redeems it for its own restricted token.

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

The website does not store originals, decide whether a phone file may be deleted, or manufacture dashboard figures. Supabase holds account and node data; the host holds media, upload state, device-token hashes and measured storage state. A second-copy indicator depends on a separately mounted and verified backup target.

`npm run typecheck` and `npm run build` check the public routes and client code. The `smoke:offload` script exercises resumable upload against a disposable image and leaves that image in the target library. Private dashboard behavior still needs an authenticated host and Tailscale route for end-to-end checks.

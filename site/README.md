# Fotoro website and dashboard

This Next.js app provides the Fotoro website, owner dashboard, canonical photo timeline, device pairing, and resumable browser uploads. The Go API and SQLite library live in the sibling `FotoroModel` repository.

## Local development

```bash
cp .env.example .env.local
# Configure Supabase and set FOTORO_LOCAL_SERVER_URL=http://127.0.0.1:8765
npm install
npm run dev
```

Build with `go build -o fotoro .` in `FotoroModel`, then run `./fotoro setup` and `./fotoroctl start` before opening the dashboard. Use `./fotoroctl stop` to turn off the user socket and API; boot startup is not enabled. The browser signs in with Supabase. The website looks up the signed-in owner's `nodes` row, then sends the bearer token to Go. Go independently checks that the user matches its locally bound owner. `/api/fotoro/...` is the authenticated website proxy; `/api/v1/...` is the same-origin device API and requires a valid owner or paired-device bearer token for protected routes.

## Private host deployment

Run `npm run build` and `npm start -- -H 127.0.0.1` on the same Linux host as Go, with `FOTORO_LOCAL_SERVER_URL=http://127.0.0.1:8765`. Set `FOTORO_PRIVATE_SITE=1` for the Go process so Tailscale Serve points to the Next.js port (3000 by default). The phone and browser must be on the tailnet. Configure `FOTORO_BACKUP_DIR` and `FOTORO_BACKUP_MOUNT_DIR` on an independent mounted filesystem for two-copy verification. See the [server runbook](../../FotoroModel/SERVER_V1_RUNBOOK.md) for the full setup and checks.

A cloud-hosted website cannot reach a private Tailscale endpoint unless its server runtime also joins the tailnet. `FOTORO_ALLOW_TAILNET_RELAY=1` only enables this lookup on a tailnet-capable host. For a hosted dashboard, enabling Tailscale Funnel on the home host registers its `https://*.ts.net` URL as the relay route; the website accepts only that HTTPS origin and still requires owner or paired-device authentication. Set `FOTORO_DISABLE_PUBLIC_RELAY=1` on a private deployment that must never use Funnel.

## Library delivery and storage figures

The dashboard gets paginated timeline metadata through its authenticated `/api/fotoro/media` relay. Go returns short-lived, signed `direct_thumbnail_url`, `direct_preview_url`, and `direct_content_url` fields when its configured Tailscale Funnel URL is available. The browser fetches those image bytes directly from the home server, so a Vercel function does not sit in the hot path for every tile. The signatures cover the media ID, size variant, and expiry; the old authenticated proxy URLs remain as fallbacks. The grid renders only visible rows, fetches 100 metadata records at a time, and prefetches the next page. The viewer starts with a display-sized preview, then requests the original when the user pauses or zooms. Adjacent previews are prefetched for left and right navigation. PDF files open in the document viewer; other uploaded documents get an open-original action.

The dashboard connectivity check uses `/api/v1/me`. Idempotent relay reads retry once when a sleeping socket wakes, and foreground checks refresh the state when the tab becomes visible. Session refresh is shared across concurrent requests and tabs. The storage card reads server-measured `media_bytes` for originals and `disk_free_bytes` for remaining space; preview cache and staging usage are shown separately. On an existing Go database, run `./fotoro reconcile-sizes` once if imported media has zero recorded file sizes.

## Check an end-to-end offload

1. Run `./fotoroctl start`, start this website, sign in with the same owner account, and open `/dashboard/library`.
2. Select a **disposable** image in the Offload panel. The receipt shows its media ID and whether one or two copies are verified. The original is accepted before the background thumbnail appears in the timeline.
3. Select **Verify download** to compare the saved file with the selected file. Files up to 32 MiB receive a full downloaded SHA-256 comparison; larger files receive first and last range comparisons. Select **Check backup** after the secondary disk has copied the original. Keep the phone copy until the receipt says two verified copies.
4. To check interruption and resume without browser timing, use a disposable JPEG or PNG and run `npm run smoke:offload -- /path/to/disposable.png` with `FOTORO_TEST_TOKEN` set to the signed-in owner's short-lived Supabase access token. The script uploads half, checks the server offset, resumes, compares the downloaded SHA-256, and waits for a thumbnail. Add `--require-backup` when testing on an independent mounted backup disk. `FOTORO_TEST_ORIGIN` defaults to `http://127.0.0.1:3000`.

The smoke test leaves the disposable media in the library. Keep the token out of terminal history and logs. It has not been run against the real owner account or storage in this repository.

For an isolated local proxy check without a Supabase account, start `./start-fotoro` with a fresh temporary `FOTORO_DB` path and `FOTORO_ALLOW_UNAUTHENTICATED_LOCAL=1`, then run `npm run smoke:offload -- /path/to/disposable.png --direct`. This mode calls the same-origin `/api/v1` route and deliberately does **not** test signed-in owner authorization. Never enable the local bypass against the real library or a network listener.

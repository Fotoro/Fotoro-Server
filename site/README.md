# Fotoro website and dashboard

This Next.js app provides the Fotoro website, owner dashboard, canonical photo timeline, device pairing, and resumable browser uploads. The Go API and SQLite library live in the sibling `FotoroModel` repository.

## Local development

```bash
cp .env.example .env.local
# Configure Supabase and set FOTORO_LOCAL_SERVER_URL=http://127.0.0.1:8765
npm install
npm run dev
```

Start `./fotoro server` in `FotoroModel` before opening the dashboard. The browser signs in with Supabase. The website looks up the signed-in owner's `nodes` row, then sends the bearer token to Go. Go independently checks that the user matches its locally bound owner. `/api/fotoro/...` is the authenticated website proxy; `/api/v1/...` is the same-origin device API and requires a valid owner or paired-device bearer token for protected routes.

## Private host deployment

Run `npm run build && npm start` on the same Linux host as Go, with `FOTORO_LOCAL_SERVER_URL=http://127.0.0.1:8765`. Set `FOTORO_PRIVATE_SITE=1` for the Go process so Tailscale Serve points to the Next.js port (3000 by default). The phone and browser must be on the tailnet. Configure `FOTORO_BACKUP_DIR` and `FOTORO_BACKUP_MOUNT_DIR` on an independent mounted filesystem for two-copy verification. See the [server runbook](../../FotoroModel/SERVER_V1_RUNBOOK.md) for the full setup and checks.

A cloud-hosted website cannot reach a private Tailscale endpoint unless its server runtime also joins the tailnet. `FOTORO_ALLOW_TAILNET_RELAY=1` only enables this lookup on a tailnet-capable host. Public Funnel relay is opt-in with `FOTORO_ALLOW_PUBLIC_RELAY=1` and does not meet the private v1 deployment scope.

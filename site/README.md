# Fotoro — Marketing site & web dashboard

This is the Next.js 15 (App Router) frontend for [Fotoro](../), a private,
self-hosted photo & video archive with local multimodal AI search.

It lives next to the Go backend (`../main.go`) and is intentionally decoupled so
you can deploy it on Vercel / Cloudflare Pages while the backend runs on your
own hardware.

## Stack

- **Framework:** Next.js 15 (App Router, React 19, TypeScript strict)
- **UI:** Tailwind CSS 3 + shadcn-style components on top of Radix Primitives
- **Animations:** Framer Motion
- **Auth:** Auth.js v5 (NextAuth) with GitHub / Google / credentials providers
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **QR:** `qrcode.react`

## Pages

| Route        | What it is                                                             |
| ------------ | ---------------------------------------------------------------------- |
| `/`          | Landing page (hero, features, semantic search demo, pricing, download) |
| `/download`  | Desktop + mobile downloads with OS auto-detect                         |
| `/login`     | OAuth (GitHub / Google) + email/password sign in                       |
| `/dashboard` | Protected dashboard with devices, QR pairing, library stats            |
| `/docs`      | Self-host guide, API reference, troubleshooting accordions             |

## Quick start

```bash
cd site
cp .env.example .env.local
# fill in AUTH_SECRET and (optionally) OAuth IDs
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm start
```

Deploys cleanly to Vercel out of the box. For self-hosting, the standard
`next start` works behind any reverse proxy.

## Notes on dummy data

The dashboard and semantic search demo on the landing page use mocked,
in-memory state on purpose — the marketing site can be deployed independently
of a running Go backend. Point `NEXT_PUBLIC_FOTORO_API` at your server when
you're ready to wire real data.

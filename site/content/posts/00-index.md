---
slug: building-fotoro-a-self-hosted-google-photos-replacement
title: "Building Fotoro: a self-hosted Google Photos replacement"
summary: "A layer-by-layer engineering series: file layouts, failure modes, measured numbers, and the mistakes that had to be found and fixed."
publishedAt: 2026-11-02
updatedAt: 2026-11-02
category: building
order: 0
---

# Building Fotoro: a self-hosted Google Photos replacement

Fotoro is a private media archive that runs on the owner's own Linux box. The
goal is to beat the cloud photo services on the things that matter to a
self-hoster: byte-exact originals, storage you can actually afford at 100k+
photos, search that works offline, and recovery you can rehearse.

This series documents the architecture layer by layer - not the marketing
version, but the engineering version: file layouts, failure modes, measured
numbers, and the mistakes that had to be found and fixed.

## The shape of the system

```
Android app / browser / folder watch
              |
              v
   Go API on the owner's Linux machine
   (systemd socket, idles out after 10 min)
              |
   +----------+----------+-----------+
   |                     |           |
   v                     v           v
SQLite (WAL)      tiered library   Ollama
catalogue         originals ->     embeddinggemma
                  archives ->      (local semantic search)
                  monthly packs
              |
              v
     second disk (verified copies
     + catalogue snapshots)
              |
   Tailscale (WireGuard mesh) - no public ingress required;
   the hosted site only stores an AES-GCM-encrypted route
```

## Reading order

1. [Content-addressed originals](01-content-addressed-library.md) - why every
   file lives under its own SHA-256, and what that buys everywhere else.
2. [Hot / warm / cold tiered storage](02-tiered-storage.md) - compressing the
   98% nobody looks at while keeping every byte provably exact.
3. [Lossless JPEG recompression with JPEG XL](03-lossless-jpegxl.md) - binding
   to libjxl from Go, and the decoder bug that cost a day.
4. [SQLite as the catalogue](04-sqlite-catalogue.md) - schema evolution,
   WAL pragmatics, and cursor pagination that actually stays stable.
5. [Backup, verification, and the recovery story](05-backup-verification-recovery.md) -
   why "a second copy" is not a backup.
6. [Capture-date-first organization](06-capture-dates-calendar.md) - EXIF,
   filename archaeology, and making the calendar the source of truth.
7. [Local semantic search](07-local-semantic-search.md) - EmbeddingGemma on a
   CPU, Matryoshka truncation, and an in-process vector index.
8. [Privacy and the network model](08-privacy-network-model.md) - encrypted
   endpoints, Tailscale, and why the hosted site sees nothing.
9. [The operator surface](09-operator-surface.md) - socket activation,
   bounded background work, and health endpoints that mean something.

Each post stands alone, but they build on the same vocabulary: assets,
tiers, storage copies, and the catalogue.

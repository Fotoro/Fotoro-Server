---
slug: sqlite-as-the-catalogue
title: "SQLite as the catalogue"
summary: "Schema evolution, WAL pragmatics, and cursor pagination that actually stays stable."
publishedAt: 2026-11-03
updatedAt: 2026-11-03
category: building
order: 4
---

# Part 4: SQLite as the catalogue

Every architectural claim in this series bottoms out in one file:
`fotoro.db`. Media files are the bytes; the catalogue is everything the
system *knows* about them - capture dates, tiers, upload sessions, paired
devices, backup state, the signing keys, even the auth session. SQLite is
not a compromise here. It is the design.

## The connection contract

Pure-Go `modernc.org/sqlite` - no cgo - opened with everything the DSN
can express:

```
?_pragma=journal_mode(WAL)
  &_pragma=busy_timeout(10000)
  &_pragma=synchronous(NORMAL)
  &_pragma=foreign_keys(1)
```

WAL lets readers proceed while a writer commits; `busy_timeout` absorbs
the single-writer stalls instead of surfacing them; `synchronous=NORMAL`
in WAL trades a tiny crash-loss window for not fsyncing per transaction.
The pool is 4 connections, not 1 - an earlier one-connection build could
deadlock when a handler held the connection inside a transaction and then
needed the database again (pairing hit this). Two stale comments still
describe the old single-conn discipline; the code itself got the fix.

## Schema evolution, with a seatbelt

`PRAGMA user_version` is the truth: current is 6. The migration ladder is
a step table (`{since version, step}`) - a step runs when the DB is older
than its `since`, every step is idempotent, and idempotency is tolerated
by matching the error strings SQLite already gives you (`duplicate column
name`, `already exists`, `no such table`). Ugly, but it makes every step
safe to re-run, which is the property that matters.

The seatbelt is the version-0 path: when an existing, populated,
pre-versioning database is first opened, the migrator writes a
consistent snapshot via `VACUUM INTO` to `fotoro.db.pre-v1.snapshot`,
opens *the snapshot* read-only and runs `PRAGMA integrity_check` on it -
refusing to touch the schema until the safety copy is proven. An
interrupted first migration keeps its first snapshot. After migration, a
reconcile gate requires every legacy `images` row to be backed by a
`media_assets` row, then a full `integrity_check`, then the version
stamp. Migrations that verify before they mutate, and verify again after.

## The timeline index and the cursor

The catalogue's hot path is one expression index:

```sql
CREATE INDEX idx_media_assets_timeline
ON media_assets(COALESCE(captured_at, imported_at) DESC, id DESC)
```

`COALESCE` because capture date is the user's truth and import date is the
system's fallback (Part 6); `id` as the tiebreaker because asset ids are
SHA-256s - effectively random - and therefore a stable secondary order.
Every timeline query, the calendar rollups, and the pack-month keying use
that same `COALESCE`, so the index serves all of them verbatim.

Pagination has two eras. `LIMIT ? OFFSET ?` still serves the simple page
API - fine at thousands of rows, quietly wasteful at hundreds of
thousands, since OFFSET scans every skipped index entry. The cursor API
is keyset pagination on `(capture_time, id)`: the cursor is literally
`"<unixnano>|<id>"` of the page's last row, the next page asks for
`COALESCE < ? OR (COALESCE = ? AND id < ?)` - O(limit) at any depth, and
stable under concurrent inserts because it addresses positions by value,
not by ordinal. One honest quirk: the cursor is emitted whenever a page
is full, so a full final page reports a `next_cursor` that yields an
empty page. Clients treat empty as done.

## The tables that are the whole server

`media_assets` is the center (`id` = the SHA-256, `status`, `tier`,
`captured_at`/`imported_at`, archive fields). Around it:

- `upload_sessions` - resumable uploads as state machines: expected
  size + expected SHA-256 declared at create, `received_size` advanced by
  each offset-checked chunk, `expires_at` 48h, statuses
  `uploading/completed/failed/expired/cancelled`. (Known gap: expiry is
  lazy - marked on next touch; no reaper sweeps orphaned `.part` files.)
- `storage_copies` - one row per (asset, storage_name) - the backup
  ledger from Part 5.
- `device_credentials` / `pairing_sessions` / `mobile_devices` - hashed
  tokens and the 10-minute pairing window (Part 8).
- `local_secrets` - the AES-256 endpoint key that never leaves the host.
- `server_config` - a singleton row that holds, among everything else,
  *the auth session itself*. The catalogue is literally the whole server
  state.
- `cold_packs` / `cold_members` - pack index mirrored into SQL so member
  lookup never touches disk.
- `fts_captions` - FTS5 external-content table over `images` with insert
  and delete triggers... and no update trigger. Caption edits drift out
  of the search index until a rebuild - a real wart, noted for honesty.

Two generations coexist deliberately: the legacy `images` table (captions,
embeddings, FTS) and `media_assets` (v1 media model), dual-written. The
migration gate keeps them provably in sync rather than forcing a flag day.

## Design lesson

A personal archive doesn't need a database server; it needs a durable
state machine. SQLite gives you transactions across every state
transition this series describes - import, demote, pack, back up, pair -
plus the query planner to make one well-chosen index serve the timeline,
the calendar and the packer. The discipline is in treating the file as
sacred: chmod 0600, snapshot before schema changes, integrity-check your
way out. When the catalogue and the bytes disagree, the bytes win - but
only because the catalogue was built to admit it.

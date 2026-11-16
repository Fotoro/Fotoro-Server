---
slug: backup-verification-and-the-recovery-story
title: "Backup, verification, and the recovery story"
summary: "Why a second copy is not a backup."
publishedAt: 2026-11-05
updatedAt: 2026-11-05
category: building
order: 5
---

# Part 5: Backup, verification, and the recovery story

The hardest sentence in this codebase is the one the runbook opens with:
**a second copy of the media files is not a backup.** Without the
catalogue there are no capture dates, no tier records, no device
pairings, no knowledge of which pack holds which asset. Fotoro's backup
model is built around that fact: *two things* get backed up, on different
schedules, by different mechanisms.

## The ledger

`storage_copies` is one row per (asset, storage_name) - `primary` or
`backup` - with a status and a `checksum_verified` flag. Crucially,
"pending" is never stored: the backup backlog is a derived set,
recomputed by a LEFT JOIN of verified-primary assets that lack a
verified-backup row. There is no queue table to lose, no counter to
drift. Restart the server mid-anything and the work is reconstructed
from durable state.

The copy state machine is explicit in both directions:

- `VerifyPrimaryPending` re-hashes *primary* files. A file that reads
  wrong is `corrupt`; a file that isn't there is `missing`; a file that
  matches refreshes `checksum_verified=1`. An old `verified` flag alone
  is never accepted as proof - legacy catalogue rows get re-proven
  against the disk.
- `BackupPending` copies verified primaries to the second disk. The
  source depends on tier: hot assets copy the raw file, warm assets copy
  the `.farc` archive (verified against `archive_sha256`, not the asset
  id), cold members ride pack-level copies (verified against
  `pack_sha256`). Backup mirrors artifacts, not abstractions.
- `VerifyBackupCopies` re-reads *secondary* copies oldest-first. A
  failure flips the row to `failed` - which automatically re-pends it
  through the derived join, so the next pass repairs it from the primary.
  Verification failures heal themselves.

Each copy is the usual liturgy: temp file → copy → fsync → re-hash the
*destination* → rename → fsync the directory. A `.part` file that never
made it is invisible to the ledger.

## Refusing bad configurations at startup

The system validates mounts before trusting them, then re-validates per
operation:

- `FOTORO_BACKUP_DIR` must be absolute, exist, and live on a *different
  device* (`st_dev`) than the primary - a second folder on the same disk
  is not a backup disk.
- `FOTORO_BACKUP_MOUNT_DIR` is required alongside it, and must be
  *actually mounted* - proven by `dev(mountDir) != dev(parent(mountDir))`.
  A directory that would silently fill the root filesystem when the USB
  disk is unplugged gets rejected, not filled.
- Neither path may contain the other; `/` is not a mount.
- Device drift at runtime produces `secondary storage mount changed` /
  `secondary storage is on the primary filesystem` and stops the pass.

## The honest rough edge

`BackupPending` runs a deterministic order (`imported_at, id`) and aborts
the whole bounded batch on the first hard failure - so one persistently
unreadable source file can head-of-line-block the queue until someone
notices the `failed` count climb. Bounded batches make it visible;
deterministic order makes it sticky. Worth knowing, worth fixing.

## The catalogue's own copy

Media copies happen in batches all day. The catalogue snapshots less
often because it must snapshot *consistently*: `VACUUM INTO` writes a
self-contained `fotoro-<timestamp>.db` onto the backup disk (WAL changes
included), plus a `sha256sum`-compatible sidecar, keeping the last 7.
Restoring is: drop the newest snapshot in as `fotoro.db`, restore the
three media trees preserving layout, run `fotoro storage` to check tier
counts, then `POST /api/v1/storage/verify` to hash-check the restored
artifacts - failures are reported, not skipped.

## safe_to_delete is a verdict, not a flag

The phone offload promise reduces to one computed bit: `safe_to_delete`
is true only when *exactly two* copies - primary and backup - both read
`verified` with `checksum_verified=1`, the backup mount passes validation
*right now*, and both paths stat as real files. It is advisory - Fotoro
never deletes from the device - but it is honest. A single laptop copy
is an offload. Two verified copies on two filesystems is a backup.

The recovery runbook rehearses the partial losses too: catalogue lost →
`fotoro ingest` re-imports the tree and hashes deduplicate against
themselves (but dates, tiers and pairings are gone - hence snapshots);
media lost → restore artifacts, the ledger shows missing/corrupt; one
corrupt archive → restore its backup copy, `fotoro cold restore <hash>`.

## Design lesson

Backups fail in two ways: silently not existing, and silently being
wrong. Fotoro addresses the first by derivation (pending work is computed
from durable rows, so it can't be lost), and the second by re-reading
(dedup, demotion, backup and verify all end in "hash the bytes you
actually wrote"). The remaining piece is the human one - the runbook
exists because recovery you haven't rehearsed is a hope, not a feature.

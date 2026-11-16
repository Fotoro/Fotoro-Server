---
slug: hot-warm-cold-tiered-storage
title: "Hot / warm / cold tiered storage"
summary: "Compressing the 98% nobody looks at while keeping every byte provably exact."
publishedAt: 2026-11-03
updatedAt: 2026-11-03
category: building
order: 2
---

# Part 2: Hot / warm / cold tiered storage

Most of a photo library is never looked at again. In the measured Fotoro
library, 3,073 JPEGs occupy 16.36 GiB - and that is a young library. At
100k+ photos the question is not whether to tier, it is how to tier without
ever lying about what you still have.

## The three states

| Tier | On disk | Restore cost |
| --- | --- | --- |
| hot | `library/originals/<hh>/<sha><ext>` raw bytes | none - direct range serve |
| warm | `library/cold/files/<hh>/<sha>.farc` one archive per asset | one file decode |
| cold | member of `library/cold/batches/<YYYY-MM>-<NN>.fpack` | index lookup + member decode |

An asset moves down when it goes quiet and back up when it is asked for
repeatedly. Every transition reuses the identity check from Part 1: the
decoded bytes must hash to the asset id, or the transition did not happen.

## The demotion spine

`DemoteAsset` runs one strict sequence, serialized by a single mutex:

1. If a backup disk is configured and this asset has no *verified* backup
   copy - refuse. The raw original is never the only copy at the moment it
   is dropped.
2. Encode the original (codec per Part 3).
3. **Decode it back in memory and hash the result.** If it does not equal
   the asset id, nothing has been written and nothing is lost.
4. Write the `.farc` archive: 17-byte header (`FTRCOLD1` magic, codec,
   raw size) + payload, via temp file + fsync + rename.
5. One SQLite transaction flips `tier='warm'`, records the archive path
   and its own SHA-256, and repoints the `storage_copies` 'primary' row.
6. Only then delete the raw original.

Verify *before* commit, delete *after* commit, in that order. A crash
anywhere in the middle leaves either the untouched original or a proven
archive - never a half state. The worst outcome is a benign duplicate
that the next pass cleans up.

## What stays hot

The hot set is a budget, not a timer. `FOTORO_HOT_TARGET` (default 2000)
caps how many assets get direct-serve originals; `FOTORO_HOT_GRACE_DAYS`
(default 30) protects new arrivals; candidates are picked lowest-activity
first by `(access_count, last_accessed_at)`. Two pressure valves sit on
top: when primary free space drops under `FOTORO_TIER_MIN_FREE` (8%),
demotion drains extra per pass until the reserve is restored, and a
non-hot asset that reaches `FOTORO_PROMOTE_AFTER` accesses (3) is promoted
back on the next pass. And critically: **assets whose previews are not
ready can never be demoted** - you cannot archive the only decodable
version of something the UI still needs to render.

## Serving cold bytes

`ContentPathTiered` resolves an asset's location in one SQL query - for
cold members, `cold_members JOIN cold_packs` returns the member's offset
and length directly, so locating bytes never walks the filesystem. The
decode lands in `.cache/rehydrated/<hh>/<hash><ext>` - but only after the
decoded payload hashes to the asset id. The rehydrated file exists to give
`http.ServeFile` a real file to range-serve, and the bounded sweep evicts
oldest-mtime first, which means it evicts least-recently-*served* first.
The directory is disposable: delete it, the next serve simply decodes
again.

Display derivatives are never tiered. The 256/1024/2048 px previews stay
hot forever, so the grid and viewer are instant even when the original
is three years deep in a pack. Only a full-original fetch - deep zoom,
download, restore - pays the decode.

## Packing the long tail

Per-file warm archives keep repair and verification trivially auditable -
one asset, one file, one hash. But at 100k assets, inode count and
backup granularity argue for batching. So quiet warm archives move into
monthly **packs**: append-only files keyed on
`COALESCE(captured_at, imported_at)` month - the same date the timeline
uses, so one memory's photos live in at most a few packs. A pack seals at
2000 members or 256 MiB of compressed payload.

```
[member payloads concatenated][8B index_len][JSON index][8B index_len]["FTRPACK1"]
```

The trailer is the whole format: validate the magic, read one JSON index
of `{hash: {offset, length, codec, raw_size}}`, then `ReadAt` any member
by extent. Members carry *already-compressed* payloads - warm→cold is
append + index + delete, never recompression. Promotion marks a member
`retired` and accrues its length onto the pack's `dead_bytes`; past 40%
dead, compaction rewrites live members into a fresh file (byte-move, no
recompression), fsyncs, atomically swaps onto the same name, and -
deliberately - clears the pack's backup markers so the new bytes get
mirrored again.

## The honest edges

Two crash windows are worth stating plainly. The pack writer creates the
final `.fpack` name with `O_EXCL` rather than a temp name; a crash between
create and seal leaves an unsealed file that makes the next pack pass fail
on the same name until it is removed by hand. And compaction renames the
new pack over the old *before* the transaction that updates member
offsets - a crash in that gap leaves SQL pointing at stale offsets into a
valid pack, detected by hash failures but not yet auto-repaired. Both are
small windows in a system that otherwise resumes from durable SQL state
with no journal to lose - and both are exactly the kind of thing a
series like this should say out loud.

## Design lesson

Tiering a byte-exact archive is safe precisely when you refuse to lose
the invariant at the boundary: decode-and-prove before delete, every
single time. The tier engine itself is deliberately boring - bounded
passes, a state machine in SQL, one mutex, atomic renames. The
interesting work is in refusing the shortcuts.

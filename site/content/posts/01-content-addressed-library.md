---
slug: content-addressed-originals
title: "Content-addressed originals"
summary: "Why every file lives under its own SHA-256, and what that buys everywhere else."
publishedAt: 2026-11-02
updatedAt: 2026-11-02
category: building
order: 1
---

# Part 1: Content-addressed originals

The single decision everything else in Fotoro stands on: **an asset's
identity is the SHA-256 of its bytes.** Not a UUID assigned at import, not a
filename, not a database row id. The hash of the content itself.

## The layout

```
library/
  originals/
    3f/
      3f8a91...c2.jpg      <- the file's own sha256, sharded by first byte pair
    a1/
      a14e07...9b.png
```

Every ingestion path - Android resumable upload, browser upload, folder
watch, bulk `fotoro ingest` - ends at the same place: stream the bytes,
hash them, move the file into place under its hash. The hash is computed
*before* the row is committed; the upload session records the client's
expected SHA-256 up front and the host verifies the assembled bytes match
before the asset exists at all.

## What content addressing buys

**Idempotent uploads for free.** A retried chunk upload, a phone that syncs
the same camera roll twice, a Takeout re-imported a year later - they all
converge on the same path. Duplicate detection is `os.Stat`, not a query.
The upload protocol can be dumb and resumable because convergence is
structural.

**Verification is the identity check.** Any time the system needs "is this
the right file?", the answer is `sha256sum` compared to the asset id. No
separate checksum column to drift out of sync. When a derivative worker
reads an original it re-hashes and compares against the id - a wrong answer
means the disk, not the code.

**Safe compression.** This is the payoff that matters later: when a JPEG is
transcoded to JPEG XL for cold storage, the acceptance test is "decoded
bytes hash to the asset id". There is no ambiguity about whether the
archive is equivalent to the original - it either reproduces the id or it
doesn't. (Part 2 and 3 live inside that check.)

**Deletion becomes reversible in structure.** A derived artifact - preview,
archive, pack member - is always disposable because it maps back to a
verifiable identity. The only sacred thing is the verified byte stream, and
the system can always prove it still has exactly that.

## The catalogue is a witness, not the truth

`media_assets` rows store `storage_path` alongside the hash, but the path is
a cache of the addressing scheme, not a foreign key into some parallel
universe. If the database says an asset exists, its file must hash to the
asset's id; if a file exists on disk, hashing it tells you which asset it
is. The two views reconcile mechanically - `fotoro ingest` pointed at a
restored tree re-imports by hash and deduplicates against itself.

## The one cost: no rename semantics

Content addressing means you cannot "rename" a file by renaming it - a
photo's location is its content. Fotoro keeps `original_name` in the
catalogue purely as display metadata; it participates in nothing
structural. Filenames only matter at the edges: during date repair
(`fix-dates --infer-names` mines `IMG_20240315_142530.jpg`-style names for
missing capture dates) and during a re-import where they are the only hint
of what a file was.

## Design lesson

Pick the identifier that is truest to what the thing *is*. For a media
archive, the thing is the bytes. Identity-from-content turns dedup,
verification, tiering, and backup into the same operation seen from
different angles - which is why later posts can be short: they keep
reusing it.

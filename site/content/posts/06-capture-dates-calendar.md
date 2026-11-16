---
slug: capture-date-first-organization
title: "Capture-date-first organization"
summary: "EXIF, filename archaeology, and making the calendar the source of truth."
publishedAt: 2026-11-06
updatedAt: 2026-11-06
category: building
order: 6
---

# Part 6: Capture-date-first organization

A photo archive's primary sort key should be *when the moment happened*,
not when the file arrived. Those are two different truths, and Fotoro
keeps both: `captured_at` is the user's timeline, `imported_at` is the
system's audit log. Everywhere the product orders photos - the timeline,
the calendar, the monthly cold packs - it sorts by
`COALESCE(captured_at, imported_at)`, the expression index from Part 4.

## The precedence chain

An asset's `captured_at` is decided, in order, by:

1. **The client**, if it knows. Android sends the MediaStore capture
   timestamp with the device manifest and the upload session carries it
   through to commit.
2. **EXIF**, read pre-commit for images - deliberately *before* the row
   exists, so the first timeline render is already right.
3. **Nothing, yet.** If both miss, `captured_at` stays NULL and
   `imported_at` fills the COALESCE - and a background derivative worker
   may COALESCE-fill `captured_at` later if metadata appears. It never
   overwrites.

`ValidCapturedAt` bounds every path to `[1900-01-01, now + 24h]` - far
enough back for scanned prints, tight enough to reject clock garbage.

## The EXIF gap nobody mentions

EXIF `DateTimeOriginal` has no timezone. The decoder (goexif's
`x.DateTime()`, which tries `DateTimeOriginal` then `DateTime`) parses
`"2006:01:02 15:04:05"` in `time.Local` - so a photo taken in Lisbon and
imported in Denver lands hours off its real position. Fotoro absorbs this
honestly: `fix-dates --prefer-exif` re-reads embedded dates across the
*whole* library and corrects stored rows that disagree by more than a
minute. The flag exists precisely because the parse drifted.

For video, there is no EXIF - the code shells to `ffprobe` for
`creation_time` with a 4-second timeout, and explicitly rejects year
**1904**: the QuickTime zero-epoch that every camera emits when the date
was never set. A rejected sentinel is a NULL `captured_at`, not a
timeline full of Edwardian home movies.

## Filename archaeology

`fix-dates --infer-names` is the last resort: when a file has no metadata
and no preserved mtime, its *name* is often the only surviving evidence.
The pattern table covers how cameras and messengers actually name files:

- `IMG_|VID_|PXL_|MVIMG_|BURST_|SAVE_YYYYMMDD_HHMMSS` - camera prefixes
- `Screenshot_YYYY-MM-DD-HH-MM-SS` (suffix like `_com.whatsapp` ignored)
- `signal-YYYY-MM-DD-HHMMSS`, `WhatsApp ... at HH.MM.SS` - messengers
- `mmexport<13 digits>` - WeChat's millisecond epoch, via `UnixMilli`
- a generic `YYYY-MM-DD[T_ ]HH[.:_-]mm[.:_-]ss` for everything else

Every candidate field is validated (month 1-12, day 1-31, hour ≤ 23...)
because `IMG_20241315_000000.jpg` is a filename, not a date. And mtime is
only trusted when it *predates import by more than 24 hours* - a file
copied at import time has an mtime of "whenever it was copied", which is
worse than no date at all.

## The calendar as an API surface

The payoff for canonicalizing on `COALESCE` is that the calendar is one
grouped query: `GET /api/v1/calendar` rolls year→month→day counts over
the same expression, plus the single most important health signal -
`missing_capture_dates`, the count of assets still living on import
time. `GET /api/v1/calendar/day?date=` lists a day; `GET
/api/v1/memories/on-this-day` groups the same month-day across years -
the "memories" feature is a `substr(...,6,5)` filter on the same index.

Even cold storage is calendar-native: monthly `.fpack` batches are keyed
on `substr(COALESCE(captured_at, imported_at),1,7)`, so a memory's photos
cluster in the same pack and the packer never has to ask a different
question than the timeline does.

## Design lesson

Capture time is user truth; import time is system truth; mtime is a
rumor. Keeping the first two as separate columns - rather than
"normalizing" one into the other - is what lets a `COALESCE` serve both
the timeline the user sees and the audit trail the operator needs, and
it's what makes date *repair* a convergent process instead of a guess:
every repair path writes `captured_at` only when it can prove a better
answer than NULL.

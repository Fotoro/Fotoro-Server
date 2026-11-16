---
slug: lossless-jpeg-recompression-with-jpeg-xl
title: "Lossless JPEG recompression with JPEG XL"
summary: "Binding to libjxl from Go, and the decoder bug that cost a day."
publishedAt: 2026-11-03
updatedAt: 2026-11-03
category: building
order: 3
---

# Part 3: Lossless JPEG recompression with JPEG XL

Tiering (Part 2) moves bytes around. This post is about making the bytes
smaller - *without changing a single decoded bit*.

## What doesn't work: compressing a JPEG

A stratified 32-file sample of real library JPEGs through zlib level 3
produced a **median ratio of 1.000** and a mean of 0.986. JPEG is already
entropy-coded; wrapping it in a generic compressor buys nothing and costs
a decode on every read. That measurement is why `.jpg` files never go to
zstd in Fotoro - it is an empirical decision, not a guess.

## What does work: rewriting the codestream

JPEG XL is the only widely-deployed codec that can ingest an existing
JPEG *bitstream* - not decoded pixels - and store a reconstruction record
(the `jbrd` box) that lets a decoder emit the original JPEG file
bit-for-bit. On the real library this measured **about 18% smaller
(81.7% ratio)**. That is the difference between a format conversion and a
codec trick: the archive still contains the original, in a proof-carrying
envelope.

The acceptance test is the identity check again: transcode, decode, and
the output must SHA-256 to the asset id. Not "visually identical". Equal.

## The binding: cgo without the headers

`internal/jxl` is a hand-rolled minimal FFI to the system `libjxl`. No
development headers required - the C preamble declares the ~15 stable-API
entry points itself (`JxlEncoderCreate`, `JxlDecoderProcessInput`, the
buffer functions, constants like `JXL_DEC_JPEG_RECONSTRUCTION`), and links
the versioned soname:

```go
#cgo LDFLAGS: -l:libjxl.so.0.10
```

Every call crosses the boundary through one struct returned by value -
`jxl_op_result{status int; err[160] char}` - so Go error handling stays
Go. Buffers are whole-file, not streaming: an out-buffer starts at the
input size plus slack and doubles via `realloc` whenever the encoder asks
for more room. For a media archive operating on 5 MB files, that
simplicity beats a streaming loop.

One honest caveat: linking the soname makes libjxl a *hard* dependency -
if the `.so` is absent the binary refuses to load rather than degrading to
zstd. The designed `cjxl`/`djxl` binary fallback was never implemented;
the codec table says "zstd fallback" but the code says
`func Available() bool { return true }`.

## Encode: the frame that isn't pixels

`JxlEncoderAddJPEGFrame` takes the original JPEG file bytes - the encoder
never sees pixels. With `JxlEncoderUseContainer` the output is a boxed
JXL carrying both the codestream and the JPEG metadata needed for exact
reconstruction; `JxlEncoderStoreJPEGMetadata(1)` is what makes the `jbrd`
record complete. Effort is clamped 1-9, default **4** - effort 9 measured
~18x the CPU for under 0.1% more savings, which is the kind of trade you
make once, in a benchmark, and then never again.

## The decoder bug that cost a day

The reconstruction loop subscribes to two events -
`JPEG_RECONSTRUCTION` and `FULL_IMAGE` - then spins on
`JxlDecoderProcessInput`. Three statuses are meaningful:
`JPEG_NEED_MORE_OUTPUT` means grow the reconstruction buffer and continue
(`ReleaseJPEGBuffer` returns the *unwritten* byte count, so the written
total is capacity minus that), `NEED_MORE_INPUT` after `CloseInput` means
the archive is truncated, `SUCCESS` means done.

The bug: `ProcessInput` can return statuses outside that set, and a loop
that treats "not success" as "keep going" spins forever while emitting
nothing. The shipped fix is a guard counter - unexpected statuses are
tolerated and skipped, but 1000 of them abort the decode with an error
naming the status. Defensive, slightly ugly, and exactly the sort of
scar tissue an FFI boundary accumulates: the C API's contract is "the
status enum", the actual behavior is "the status enum as implemented by
this .so".

After `SUCCESS`, a final `ReleaseJPEGBuffer` recovers the total; a
zero-byte result means the JXL was never produced by a lossless-JPEG
transcode (no `jbrd` payload) - which is a correct rejection, not a bug.

## The codec table

`Choose()` decides by extension, and the choice is recorded per asset in
`archive_codec` - decode dispatches on the recorded value, never on
sniffing:

- `.jpg/.jpeg` → JXL
- ~30 uncompressed formats (TIFF, DNG and the RAW alphabet soup, WAV,
  text/codecs that actually compress) → zstd
- everything already compressed (PNG, HEIC, MP4, WebP) → `none`: stored
  verbatim, still index-addressed, still hash-verified

zstd gets the only savings test: under 1% saved, the payload is stored as
a `none` member so the restore path stays uniform. JXL deliberately gets
no savings check - a lossless-JPEG transcode is always the right
envelope for a JPEG.

## Design lesson

"Lossless" is a claim you verify per byte, not a property of a format.
Fotoro's version of it is procedural: record the codec, decode to hash,
store what proved itself. The JPEG XL bet paid for ~18% of the library
back because the format's one superpower - bitstream-level JPEG
reconstruction - happens to be the only compression trick compatible
with an archive whose identity *is* its bytes.

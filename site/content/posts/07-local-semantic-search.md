---
slug: local-semantic-search
title: "Local semantic search"
summary: "EmbeddingGemma on a CPU, Matryoshka truncation, and an in-process vector index."
publishedAt: 2026-11-09
updatedAt: 2026-11-09
category: building
order: 7
---

# Part 7: Local semantic search

Fotoro's search promise is "describe the photo, find the photo" - on a
CPU, on a laptop, with no network. That takes two different models doing
two different jobs, and a search architecture that treats them as
strictly optional.

## Two models, two runtimes

**Captions**: a 3B vision-language model (Qwen2.5-VL, Q4_K_M GGUF +
mmproj) served by llama.cpp's `llama-server` on `LLAMA_ADDR`. The host
spawns it with laptop-survival settings: 4 threads, ctx 1024, KV cache
quantized to q8_0, `--no-mmap`, image tokens capped at 64-256. Each photo
is downsized to a 336 px JPEG before the model ever sees it, and the
prompt demands two sentences at temperature 0.05 - near-deterministic,
because a caption is index data, not poetry. Category, tags and
`has_text`/`has_faces` are then *keyword-inferred* from the caption text
(a ~70-word stoplist filters the tag extraction) - cheap heuristics over
a good caption beat a second model pass.

**Embeddings**: Google's `embeddinggemma` (300M, 768-d, Matryoshka) via
the Ollama daemon - or any OpenAI-compatible `/v1/embeddings` endpoint
when `EMBED_ADDR` is set. Captions embed as *documents*, queries as
*queries*, with asymmetric task prefixes (`"title: none | text: "` vs
`"task: search result | query: "`) because the model was trained with
them.

## The Matryoshka trick

`EMBED_DIM=256` (default) keeps the leading 256 of the model's 768
dimensions and renormalizes to unit length - Matryoshka truncation, where
the prefix is the trained subspace. At 256 dims each vector is a 1 KiB
little-endian float32 blob in `images.embedding`; 100k photos ≈ 100 MB of
index RAM, a number a laptop survives. Full 768 is an env var away if you
want the recall back.

## The in-process index

No vector database. `search.Index` is a Go struct - a `[]Vector` slice, a
parallel array of precomputed norms, a `byHash` map. Boot does one bulk
`LoadFromDB` (`[INIT] Loaded N vectors into memory`); a 30-second ticker
delta-merges `WHERE embedded_at > lastLoad`, so new embeddings appear in
search without a reload. Query time: copy the slice under RLock, fan
cosine similarity across `min(GOMAXPROCS, 8)` workers against precomputed
norms, keep score > 0.10, sort, cut to top-N. At 100k × 256-d this is
low-tens-of-milliseconds arithmetic - the design estimate, and the right
order of magnitude for a brute-force scan at this scale.

The deliberate consequence: the "index" is disposable. Rebuild = read the
blob column. Derived data, always regenerable, never part of the archive
contract.

## The hybrid query

`GET /api/search?q=` is three scorers summed per asset hash:

| Scorer | Weight | What it does |
| --- | --- | --- |
| semantic | 0.55 | expand query → `EmbedQuery` → index top-100 |
| FTS5 | 0.65 | `term*` OR-MATCH on `fts_captions` (path/caption/tags/ocr), rank → `1/(1+\|rank\|/8)` |
| LIKE | 0.45 | literal substring hits across caption/tags/ocr → `0.35 + 0.65·(hits/terms)` |

Before embedding, a `QueryExpander` stems the query (trailing-s trim) and
maps a synonym table (`me→person face portrait self`,
`beach→ocean sand sea coast waves`) plus a category boost for short
queries. The merge drops anything under 0.10 and breaks near-ties in
favor of newer photos. FTS5 is the precision layer, semantic is the
recall layer, LIKE is the safety net for the terms neither understood -
each weighted to what it's actually good at.

## The honest gaps

- `images.ocr_text` exists, is indexed, is searched - and **nothing
  writes it**. OCR coverage comes only from the VLM caption ("transcribe
  key text" is in the prompt). Real OCR is a known unfilled slot.
- `has_faces` is caption keyword inference, not face detection. There is
  no face pipeline.
- New embeddings take up to ~30 s to become searchable - `Index.Upsert`
  at write time was designed but isn't wired; the delta loop is the
  actual mechanism.

## CPU discipline

The caption worker runs **one** VLM job at a time (`FOTORO_ALLOW_PARALLEL_VLM=1`
to override), 25 images per batch, and asks `CanStartLLM` before each
batch - the memory guard wants `model_size×1.3 + 2 GB` available, refuses
outright if swap is already >50% used, and a 5-second `MonitorSwap`
poller SIGTERMs the model process if swap crosses 80%. The model is
mortal by design.

Most important is what search does *not* gate: the derivative worker that
makes thumbnails is a different loop on a different table, precisely so
that "a missing model cannot prevent thumbnails". Originals are served,
verified, tiered and backed up whether or not any model is installed.
Captions and vectors are derived data; the archive does not require them.

## Design lesson

Local AI search on modest hardware is an exercise in refusal: refuse the
full embedding dim (256 works), refuse a vector DB (a slice + norms
works), refuse parallel VLM (one worker works), refuse to let the model
matter to preservation. The result is search that degrades to "slower and
less clever" instead of "unavailable" - which is exactly what a personal
archive's AI layer should do.

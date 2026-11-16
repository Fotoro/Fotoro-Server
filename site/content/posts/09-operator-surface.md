---
slug: the-operator-surface
title: "The operator surface"
summary: "Socket activation, bounded background work, and health endpoints that mean something."
publishedAt: 2026-11-12
updatedAt: 2026-11-12
category: building
order: 9
---

# Part 9: The operator surface

The last layer is the one that decides whether any of this runs when
nobody is watching. Fotoro's answer: a service that is *asleep by
default*, wakes on demand, and refuses to sleep while there's still work
that matters.

## Socket activation: the server that isn't running

`fotoroctl start` doesn't start the server. It writes two *user* systemd
units - `fotoro.socket` (bound to `127.0.0.1:<port>`, enforced loopback)
and `fotoro.service` (`ExecStart=<repo>/fotoro server`, never `enable`d,
no boot startup) - then starts only the socket. The Go listener is three
lines of convention:

```go
if os.Getenv("LISTEN_PID") == strconv.Itoa(os.Getpid()) &&
   os.Getenv("LISTEN_FDS") == "1" {
    l, _ = net.FileListener(os.NewFile(3, "fotoro.socket"))
} else {
    l, _ = net.Listen("tcp", addr)
}
```

`http.Serve` runs identically whether fd 3 arrived from systemd or a port
was dialed - the whole trick is that the deployer and the developer run
the same code path. First connection activates the service; the socket
stays bound forever.

## Sleeping with a clear conscience

The idle watchdog ticks every 15 s and exits only when *all* hold: no
active requests, idle past `FOTORO_IDLE_MINUTES` (10), the upload queue
not processing, `backgroundActive == 0`, and - the telling one - **no
backup pending**. The server will not sleep while a verified second copy
is still owed. `/api/health` is deliberately excluded from activity
tracking, so monitoring can't keep it awake; everything else resets the
clock. On the far side, the website's relay knows the game: a
502/503/504 on a GET gets one retry after 700 ms - just long enough for
the socket to wake the API.

## Everything is bounded

Every background loop is a bounded batch on a timer, never a drain:

| Loop | Cadence | Work per pass |
| --- | --- | --- |
| derivative worker | 3 s | ≤ 2 thumbnail jobs (resets interrupted at boot) |
| backup worker | 30 s | verify 10 primaries, copy 10, mirror 1 pack |
| tier pass | 15 min | 25 demote/promote, 100 pack, 1 compact, 50 embeds |
| verify + snapshot | 24 h | 100 backup re-hashes, 1 `VACUUM INTO` snapshot |
| vector index / metrics / node heartbeat | 30 s / 60 s / 60 s | delta merge, 45 s TTL cache, endpoint sync |

The scheduler is opt-in and human-scale: disabled by default, fires at
`02:00`, batches `max_per_batch=25`, asks the memory guard once per run
rather than per file. Nothing in this codebase loops until done - "done"
is a limit, repeated.

## The memory guard

`CanStartLLM` reads `/proc/meminfo` and requires `model_size×1.3 + 2048
MB` free before a single caption job starts - the 3B GGUF alone wants
~2.2 GB. Two failure postures, two mechanisms: if swap is already >50%
used the start is *refused* (a swapping box doesn't get a VLM), and if a
running model pushes swap past 80%, a 5-second `MonitorSwap` poller kills
the process group. Prevention and containment, deliberately separate.

Uploads get the same treatment: 16 MiB chunks max (enforced by
`MaxBytesReader` → 413), offset-exact appends (409 + the expected offset
back, so clients resume without a protocol dance), 48 h session expiry,
a whole-file SHA-256 re-check at `complete` before a row exists, 100 GiB
asset ceiling, and a statfs reserve - max(15% free, 1 GiB) - that refuses
uploads before the disk does.

## Health that means three different things

- `GET /api/health` → `{"status":"ok"}`. Pure liveness, touches nothing -
  safe for socket wake probes and uptime pings.
- `GET /api/v1/ready` → 503 unless `db.Ping` *and* the primary mount
  passes revalidation. "Ready" means the dependencies are real.
- `GET /api/v1/diagnostics` (owner) → schema version, `PRAGMA
  quick_check`, primary/backup state, queue depth, search vector count,
  Tailscale status. The honest whole picture, one request.

`fotoroctl status` shows both units; `fotoro storage`, `fotoro cold
status`, `fotoro backup status`, `fotoro embed status` print the same
ledgers the APIs serve. The CLI and the dashboard are two views of one
source of truth.

## Design lesson

Operability for a personal server isn't dashboards and alerts - it's
*the absence of a reason to look*. Idle shutdown means the box isn't
running a service you're not using; bounded passes mean no runaway work
competes with the laptop's actual job; mount validation and memory guards
mean the dangerous configurations fail loudly at startup instead of
corrupting quietly at 3 a.m. The operator surface is the product's
promise that it will be a polite tenant of a machine that has other
things to do.

import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Get started",
  description: "Build the Fotoro Linux server from source, run setup, and open the web dashboard.",
};

const commands = [
  "git clone https://github.com/Fotoro/Fotoro-Model.git",
  "cd Fotoro-Model",
  "go build -o fotoro .",
  "./fotoro setup",
  "./fotoroctl start",
];

export default function DownloadPage() {
  return (
    <PageShell>
      <div className="container-tight pb-28">
        <div className="grid gap-8 border-b border-border pb-14 lg:grid-cols-[1fr_0.6fr]"><div><p className="matrix-label">Start here / Linux host</p><h1 className="mt-5 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-7xl">Give your archive a home.</h1></div><p className="self-end text-base leading-relaxed text-muted-foreground">Build from source, run setup, and connect your account. You need Go, a storage location, and Tailscale for private remote access.</p></div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="matrix-panel min-h-80 p-8"><span className="matrix-label">What you need / 01</span><h2 className="mt-14 text-3xl font-semibold tracking-tight">One Linux machine. A place for the originals.</h2><p className="mt-5 text-sm leading-relaxed text-muted-foreground">Add a separate backup drive to make verified second copies. Setup opens the web sign in, connects Tailscale, and links this host to your account.</p></div>
          <div className="overflow-hidden border border-border bg-card"><div className="flex items-center justify-between border-b border-border px-5 py-3 font-mono text-[11px] uppercase tracking-wider"><span className="text-[hsl(var(--brand))]">Terminal / first run</span><span className="text-muted-foreground">01—05</span></div><ol className="space-y-0 font-mono text-sm">{commands.map((command, index) => <li key={command} className="flex gap-4 overflow-x-auto border-b border-border/60 px-5 py-4 last:border-0"><span className="text-[hsl(var(--brand))]">{String(index + 1).padStart(2, "0")}</span><code>{command}</code></li>)}</ol></div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3"><div className="border border-border bg-card p-7"><p className="matrix-label">01 / Sign in</p><p className="mt-4 text-sm leading-relaxed text-muted-foreground">The setup command opens a browser. Sign in with the Google account you will use for the dashboard.</p></div><div className="border border-border bg-card p-7"><p className="matrix-label">02 / Connect</p><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Finish the Tailscale sign in and let setup link this machine to your account. Keep Tailscale running for remote access.</p></div><div className="border border-border bg-card p-7"><p className="matrix-label">03 / Browse</p><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Run <code className="text-foreground">./fotoroctl start</code>, then <Link href="/dashboard" className="border-b border-[hsl(var(--brand))] text-foreground">open the dashboard</Link>. Use <code className="text-foreground">./fotoroctl stop</code> to turn it off.</p></div></div>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">Start is manual and does not enable boot startup. The API sleeps after ten idle minutes; its user socket wakes it when a request arrives. A remotely hosted website needs a reachable relay, such as an explicitly enabled Tailscale Funnel. Private tailnet access alone works only when the website host is on the same tailnet.</p>
        <div className="mt-8 border border-border bg-card p-7"><p className="matrix-label">Desktop / optional</p><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Use <code className="text-foreground">./fotoro app</code> for the Qt desktop interface. Qt development packages and CMake are needed to build it. For manual on demand server control, use <code className="text-foreground">./fotoroctl start</code> and <code className="text-foreground">./fotoroctl stop</code>.</p></div>
        <div className="matrix-paper mt-12 flex flex-wrap items-end justify-between gap-8 p-8 sm:p-10"><div><p className="font-mono text-[11px] font-bold uppercase tracking-widest">Release status</p><h2 className="mt-3 text-2xl font-semibold">Linux source is available now.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed">The Android client and packaged installers are in development. For now, use host import or the upload API to test offloading.</p></div><Link href="https://github.com/Fotoro/Fotoro-Model" className="border-b border-background pb-1 font-mono text-xs font-bold uppercase tracking-wider">View server source ↗</Link></div>
      </div>
    </PageShell>
  );
}

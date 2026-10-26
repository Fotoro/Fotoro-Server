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
  "./fotoro server",
];

export default function DownloadPage() {
  return (
    <PageShell>
      <div className="container-tight max-w-3xl pb-28">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Linux host / source install</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Set up Fotoro</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Fotoro currently runs from source on a Linux host. You need Go, a storage location, and Tailscale for remote access. The setup command walks through server configuration.
        </p>
        <ol className="mt-10 space-y-3 rounded-lg border border-border bg-card p-5 font-mono text-sm">
          {commands.map((command, index) => <li key={command} className="flex gap-4 overflow-x-auto"><span className="text-muted-foreground">{index + 1}.</span><code>{command}</code></li>)}
        </ol>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">Use <code className="text-foreground">./fotoro app</code> if you want the desktop UI. After the server is linked to your account, <Link href="/dashboard" className="text-foreground underline underline-offset-4">open the web dashboard</Link> and sign in.</p>
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-xl font-medium">Client availability</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The server and desktop app are built for Linux. The Android app and packaged installers are still in development. For now, import media on the host or use the server upload API to test offloading.</p>
          <Link href="https://github.com/Fotoro/Fotoro-Model" className="mt-5 inline-block border-b border-foreground pb-1 text-sm">View server source ↗</Link>
        </div>
      </div>
    </PageShell>
  );
}

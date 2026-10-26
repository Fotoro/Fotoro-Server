import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="container-tight pb-28">
      <div className="rounded-xl border border-border bg-card p-8 sm:p-12">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Start with a Linux host</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight">Run your own archive.</h2>
        <p className="mt-4 max-w-xl text-muted-foreground">Build the server from source, complete setup, then sign in to view your library. The Android client is still in development.</p>
        <Link href="/download" className="mt-8 inline-block border-b border-foreground pb-1 text-sm font-medium hover:text-muted-foreground">Setup instructions ↗</Link>
      </div>
    </section>
  );
}

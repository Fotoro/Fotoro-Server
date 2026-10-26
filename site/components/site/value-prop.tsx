const CAPABILITIES = [
  { title: "Timeline", detail: "Photos appear by capture date. The dashboard loads pages as you scroll and keeps only visible rows in the browser." },
  { title: "Storage", detail: "File hashes prevent duplicate originals. Small thumbnails serve the grid while the original stays on your storage drive." },
  { title: "Backup status", detail: "The server records verified primary and backup copies and marks an item safe to delete only when both files are available." },
  { title: "Remote access", detail: "Sign in to the dashboard and connect to your own server over its Tailscale route." },
];

export function ValueProp() {
  return (
    <section className="container-tight pb-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">What the system does</h2>
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Current server + web dashboard</span>
      </div>
      <div className="grid border-t border-border sm:grid-cols-2">
        {CAPABILITIES.map(({ title, detail }, index) => (
          <div key={title} className="border-b border-border py-8 sm:pr-10">
            <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
            <h3 className="mt-3 text-xl font-medium">{title}</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Database, HardDrive, Images, LockKeyhole, ScanSearch, SlidersHorizontal } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";

export const metadata: Metadata = { title: "Features", description: "Explore Fotoro's ingestion, storage, backup, timeline, search, device access and local server tools." };

const groups = [
  { id: "ingest", index: "01", icon: Database, name: "Bring everything in", summary: "Move an existing collection or offload new media without starting over after a broken connection.", features: [
    ["Resumable uploads", "Transfer files in chunks, inspect the saved offset, then continue after an interruption."],
    ["Verified originals", "The server checks SHA-256 before it commits an uploaded file."],
    ["Duplicate detection", "The content hash links a repeated file to the original already stored."],
    ["Folder import & web upload", "Import an existing host folder or upload from the dashboard."],
    ["Device inventory", "The device status API records which local assets have reached the server."],
  ] },
  { id: "store", index: "02", icon: HardDrive, name: "Store with confidence", summary: "Know exactly which copy exists and whether another independent target has it too.", features: [
    ["Content-addressed library", "Originals are placed by hash, with metadata in local SQLite."],
    ["Separate backup target", "Primary and backup drives are tracked as distinct storage copies."],
    ["Backup reconciliation", "Background work finds primary-only items and copies them to the configured backup target."],
    ["Deletion safety", "The server marks an item safe to delete from its source only after two verified files are available."],
    ["Storage diagnostics", "See capacity, free space, missing files and failed copy checks in the dashboard."],
  ] },
  { id: "browse", index: "03", icon: Images, name: "Move through the years", summary: "The archive stays navigable even when it contains thousands of photographs.", features: [
    ["Capture-date timeline", "Photos are ordered by capture time, with import time as the fallback."],
    ["Small and medium previews", "Generated JPEG previews keep the grid light and the image viewer responsive."],
    ["Virtualized gallery", "The browser renders rows near the viewport and fetches more pages as you scroll."],
    ["Full originals & video", "Open the stored original; video responses support byte ranges for seeking."],
    ["Browser caching", "Content-addressed thumbnails are cached privately on the viewing device."],
  ] },
  { id: "find", index: "04", icon: ScanSearch, name: "Find what matters", summary: "Use available captions and local search indexes to get back to a moment.", features: [
    ["Text search", "Search indexed captions and tags from the gallery."],
    ["Local vector search", "Search vectors can add similarity results when the local embedding service is configured."],
    ["Metadata extraction", "Ingestion records timestamps and image properties for browsing and processing."],
    ["Processing queue", "Track pending and failed jobs instead of guessing whether analysis finished."],
  ] },
  { id: "access", index: "05", icon: LockKeyhole, name: "Keep access yours", summary: "The website connects to the server linked to your account.", features: [
    ["Owner sign-in", "The dashboard verifies your account before proxying requests to the home server."],
    ["Tailscale route", "Reach a linked server through its private network endpoint."],
    ["Device pairing", "Create a short-lived pairing key for a device, with restricted media permissions."],
    ["Linked-node checks", "Connectivity and health views help identify a server that has gone offline."],
  ] },
  { id: "operate", index: "06", icon: SlidersHorizontal, name: "Run the system", summary: "A small set of tools for a real machine with real storage.", features: [
    ["Linux desktop launcher", "Run ./fotoro app to start the backend and desktop interface; ./fotoro server runs the API alone."],
    ["Scheduled processing", "Configure the local queue and batch size, or trigger processing manually."],
    ["Measured dashboard", "Media, previews, disks, devices, backups and queue figures are measured on the host and saved to SQLite."],
    ["Diagnostics", "Inspect database, storage, search index and Tailscale state from the authenticated dashboard."],
  ] },
];

export default function FeaturesPage() {
  return <PageShell><div className="container-tight pb-28">
    <section className="grid gap-8 border-b border-border pb-14 lg:grid-cols-[1fr_0.6fr]">
      <div><p className="matrix-label">Feature index / 001—006</p><h1 className="mt-5 max-w-3xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-7xl">Every part of the picture.</h1></div>
      <p className="self-end text-base leading-relaxed text-muted-foreground">From first upload to a verified second copy, Fotoro gives each image a traceable path through your own system. These are the capabilities in the current server and website.</p>
    </section>
    <nav aria-label="Feature groups" className="flex flex-wrap gap-2 border-b border-border py-5">{groups.map((group) => <Link key={group.id} href={`#${group.id}`} className="border border-border px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition hover:border-[hsl(var(--brand))] hover:text-[hsl(var(--brand))]">{group.index} / {group.name}</Link>)}</nav>
    <div>{groups.map((group) => <section id={group.id} key={group.id} className="scroll-mt-24 grid gap-8 border-b border-border py-16 lg:grid-cols-[0.78fr_1.22fr]">
      <div className="relative min-h-[250px] overflow-hidden border border-border bg-card p-7">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-dot-grid opacity-80" aria-hidden="true" />
        <span className="matrix-label">{group.index} / Fotoro system</span>
        <group.icon className="mt-10 size-10 text-[hsl(var(--brand))]" strokeWidth={1.25} />
        <h2 className="relative mt-6 max-w-sm text-3xl font-semibold tracking-tight">{group.name}</h2>
        <p className="relative mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">{group.summary}</p>
      </div>
      <div className="divide-y divide-border border-t border-border">{group.features.map(([title, detail], index) => <div key={title} className="grid gap-2 py-5 sm:grid-cols-[2rem_12rem_1fr]"><span className="font-mono text-[11px] text-[hsl(var(--brand))]">{String(index + 1).padStart(2, "0")}</span><h3 className="text-sm font-medium">{title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{detail}</p></div>)}</div>
    </section>)}</div>
    <div className="matrix-paper mt-16 grid gap-6 p-8 sm:grid-cols-[1fr_auto] sm:p-10"><div><p className="font-mono text-[11px] font-bold uppercase tracking-widest">Still in development</p><h2 className="mt-3 text-2xl font-semibold">Native Android backup and packaged installers</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed">The server upload and device APIs are in place. The native mobile client and ready-to-install releases are not yet available.</p></div><Link href="/download" className="inline-flex items-center gap-2 self-end border-b border-background pb-1 font-mono text-xs font-bold uppercase tracking-wider">Current setup <ArrowUpRight className="size-4" /></Link></div>
  </div></PageShell>;
}

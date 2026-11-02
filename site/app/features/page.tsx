import type { Metadata } from "next";
import { publicMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowUpRight, Database, HardDrive, Images, LockKeyhole, ScanSearch, SlidersHorizontal, Smartphone } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";

export const metadata: Metadata = publicMetadata("Features", "Explore Fotoro's ingestion, storage, backup, timeline, search, device access and local server tools.", "/features");

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
    ["Manual on demand server", "Run ./fotoroctl start or stop. A user socket wakes the API for requests and lets it sleep when idle."],
    ["Scheduled processing", "Configure the local queue and batch size, or trigger processing manually."],
    ["Measured dashboard", "Media, previews, disks, devices, backups and queue figures are measured on the host and saved to SQLite."],
    ["Diagnostics", "Inspect database, storage, search index and Tailscale state from the authenticated dashboard."],
  ] },
  { id: "android", index: "07", icon: Smartphone, name: "Use the phone app", summary: "Browse the phone and server libraries while backups run in the background.", features: [
    ["Google account and QR pairing", "Sign in with the same account and pair the phone to the linked server from the dashboard."],
    ["Automatic photo and video backup", "WorkManager schedules background checks with Wi-Fi and battery constraints."],
    ["Pause and resume", "Stop active or queued transfers from the app or notification and resume an interrupted original later."],
    ["Local and server galleries", "Browse phone media and a paginated server library, with image viewing and video playback."],
    ["Selected file offload", "Choose photos, videos or documents for a background upload."],
  ] },
];

export default function FeaturesPage() {
  return <PageShell><div className="container-tight pb-28">
    <section className="grid gap-8 border-b border-border pb-14 lg:grid-cols-[1fr_0.6fr]">
      <div><p className="matrix-label">What Fotoro does</p><h1 className="mt-5 max-w-3xl text-balance text-5xl font-medium leading-[1.02] sm:text-7xl">The whole route from phone to archive</h1></div>
      <p className="self-end text-base leading-relaxed text-muted-foreground">Each original has a traceable path through transfer, storage, verification and browsing. These capabilities span the Linux server, web dashboard and Android app.</p>
    </section>
    <nav aria-label="Feature groups" className="flex flex-wrap gap-2 border-b border-border py-5">{groups.map((group) => <Link key={group.id} href={`#${group.id}`} className="border border-border px-3 py-2 text-sm transition-colors hover:border-foreground">{group.name}</Link>)}</nav>
    <div>{groups.map((group) => <section id={group.id} key={group.id} className="scroll-mt-24 grid gap-8 border-b border-border py-16 lg:grid-cols-[0.78fr_1.22fr]">
      <div className="relative min-h-[250px] border border-border bg-card p-7">
        <span className="matrix-label">{group.index}</span>
        <group.icon className="mt-10 size-8 text-muted-foreground" strokeWidth={1.5} />
        <h2 className="relative mt-6 max-w-sm text-3xl font-medium">{group.name}</h2>
        <p className="relative mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">{group.summary}</p>
      </div>
      <div className="divide-y divide-border border-t border-border">{group.features.map(([title, detail], index) => <div key={title} className="grid gap-2 py-5 sm:grid-cols-[2rem_12rem_1fr]"><span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><h3 className="text-sm font-medium">{title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{detail}</p></div>)}</div>
    </section>)}</div>
    <div className="matrix-paper mt-16 grid gap-6 p-8 sm:grid-cols-[1fr_auto] sm:p-10"><div><p className="text-sm">Android v0.1</p><h2 className="mt-3 text-2xl font-medium">Backup from your phone</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed">The Android app sends photos and videos in the background, shows transfer progress, and lets you stop and resume uploads.</p></div><Link href="https://github.com/Fotoro/Fotoro-Android/releases/tag/v0.1" className="inline-flex items-center gap-2 self-end border-b border-background pb-1 text-sm font-medium">View Android release <ArrowUpRight className="size-4" /></Link></div>
  </div></PageShell>;
}

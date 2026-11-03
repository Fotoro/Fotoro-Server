import type { Metadata } from "next";
import { publicMetadata } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
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
  return <PageShell mainClassName="features-shell"><div className="features-page">
    <header className="features-hero">
      <div className="features-hero__copy"><p className="eyebrow">PRODUCT / CAPTURE THROUGH PRESERVATION</p><h1 className="font-display">The whole route<br />from phone <em>to archive.</em></h1><p>Every original has a path through transfer, storage, verification and browsing. Here are the pieces Fotoro ships today.</p><Link href="/how-it-works" className="text-link">How the system fits together <ArrowUpRight size={15} /></Link></div>
      <figure className="features-hero__image"><Image src="/images/editorial/last-light.jpg" alt="People at the shoreline in the last light of day" fill priority sizes="(max-width: 760px) 100vw, 50vw" quality={82} /><figcaption><span>STORAGE / BROWSING</span><span>FOTORO / 01</span></figcaption></figure>
      <span className="features-hero__index">07 SYSTEM AREAS</span>
    </header>
    <nav aria-label="Feature groups" className="feature-index">{groups.map((group) => <Link key={group.id} href={`#${group.id}`}><span>{group.index}</span>{group.name}</Link>)}</nav>
    <div className="feature-sections">{groups.map((group, groupIndex) => {
      const Icon = group.icon;
      return <section id={group.id} key={group.id} className={`feature-section${groupIndex === 1 ? " feature-section--cobalt" : ""}`}>
        <header className="feature-section__intro"><span className="feature-section__index">{group.index} / 07</span><Icon size={19} strokeWidth={1.3} aria-hidden="true" /><h2 className="font-heading">{group.name}</h2><p>{group.summary}</p></header>
        <div className="feature-records">{group.features.map(([title, detail], index) => <article key={title} className="feature-record"><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{detail}</p></article>)}</div>
      </section>;
    })}</div>
    <aside className="feature-release"><div><span>ANDROID / V0.1</span><h2 className="font-display">A way home<br /><em>for the phone library.</em></h2><p>The Android app sends photos and videos in the background, shows transfer progress, and lets you stop or resume uploads.</p></div><Link href="https://github.com/Fotoro/Fotoro-Android/releases/tag/v0.1">View Android release <ArrowUpRight size={15} /></Link></aside>
  </div></PageShell>;
}

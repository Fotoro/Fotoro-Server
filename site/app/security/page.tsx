import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { SecurityMap } from "@/components/site/security-map";
import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata("Security", "How Fotoro handles account access, private routes, original files, integrity checks and backup copies.", "/security");

export default function SecurityPage() {
  return <PageShell mainClassName="security-page-shell"><div className="security-page">
    <header className="security-hero">
      <div className="security-hero__grid" aria-hidden="true" />
      <p className="eyebrow">SECURITY / HOW YOUR ARCHIVE IS PROTECTED</p>
      <h1 className="font-display">Private by design.<br /><em>Transparent by default.</em></h1>
      <p className="security-hero__lede">Your photographs live on storage you configure. Access is authenticated, devices are paired deliberately, and each copy has a state you can inspect.</p>
      <div className="security-hero__foot"><span>ACCESS / ROUTING / STORAGE / INTEGRITY</span><span>FOTORO SECURITY MODEL / 01</span></div>
    </header>

    <section className="security-explain" aria-labelledby="map-title">
      <div className="security-section-head"><div><span className="chapter-index">01 / WHERE YOUR DATA LIVES</span><h2 id="map-title" className="font-heading">Follow the path.<br /><em>Know the boundary.</em></h2></div><p>Choose a component to see what it handles and what stays elsewhere. Account infrastructure and media storage have separate jobs.</p></div>
      <SecurityMap />
    </section>

    <section className="security-principles" aria-label="Security properties">
      <article><span>02 / AUTHENTICATED ACCESS</span><h2 className="font-heading">A private route is only a route.</h2><p>Owner requests use the signed-in account, and the host checks the owner identity again on protected requests. Paired phones use their own restricted device credential.</p></article>
      <article><span>03 / CHECKED ORIGINALS</span><h2 className="font-heading">Integrity is recorded per file.</h2><p>The host verifies the uploaded original with SHA-256 before commit. A checksum helps confirm file identity; it does not describe the state of a separate backup copy.</p></article>
      <article><span>04 / TWO DISTINCT COPIES</span><h2 className="font-heading">Backup status stands on its own.</h2><p>The backup target is configured separately. Fotoro only reports source deletion safety when the primary and backup copies are both verified and available.</p></article>
    </section>

    <aside className="security-honesty"><span>DEPLOYMENT NOTE</span><p>This describes Fotoro’s current access, storage and integrity behavior. It does not claim end-to-end encryption or automatic off-site disaster recovery. A separate backup target and its physical location are choices you configure.</p><Link href="/docs#privacy">Read the deployment and privacy notes <ArrowRight size={14} /></Link></aside>

    <section className="security-end"><p className="eyebrow">YOUR HARDWARE / YOUR CONFIGURATION</p><h2 className="font-display">Trust should be<br /><em>inspectable.</em></h2><Link className="editorial-action" href="/docs#self-host">Explore self-hosting <ArrowUpRight size={15} /></Link></section>
  </div></PageShell>;
}

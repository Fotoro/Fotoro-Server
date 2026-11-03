import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { LifecycleExplorer } from "@/components/site/lifecycle-explorer";

export function HomeStory() {
  return <div className="home-story">
    <section className="photo-hero" aria-labelledby="hero-title">
      <div className="photo-hero__image">
        <Image src="/images/editorial/hero-ocean-path.jpg" alt="A solitary figure walking a quiet path toward the sea" fill priority sizes="100vw" quality={85} />
      </div>
      <div className="photo-hero__shade" />
      <span className="hero-cross hero-cross--a" aria-hidden="true">+</span>
      <span className="hero-cross hero-cross--b" aria-hidden="true">+</span>
      <div className="photo-hero__content">
        <p className="eyebrow">FOTORO / PRIVATE PHOTO ARCHIVE</p>
        <h1 id="hero-title" className="font-display">Your photos.<br /><em>On your server.</em></h1>
        <p className="photo-hero__lede">An open-source photo archive that brings your originals from Android to a machine you control. Verified, preserved, and ready to rediscover.</p>
        <div className="photo-hero__actions"><Link className="editorial-action" href="/download">Get started <ArrowRight size={15} /></Link><Link className="quiet-action" href="#how-it-works">See how it works <ArrowDown size={14} /></Link></div>
      </div>
      <aside className="hero-record glass-material" aria-label="Illustration of Fotoro file information">
        <div className="hero-record__head"><span>FOTORO / FILE RECORD</span><span>PRODUCT MODEL</span></div>
        <div className="hero-record__main"><span className="hero-record__mark">◫</span><div><strong>ORIGINAL MEDIA</strong><small>Configured Linux storage</small></div></div>
        <div className="hero-record__row"><span>INTEGRITY</span><b>SHA-256 CHECK</b></div>
        <div className="hero-record__row"><span>BACKUP</span><b>SEPARATE STATE</b></div>
        <small className="hero-record__note">Illustrative interface · actual states come from your host</small>
      </aside>
      <div className="photo-hero__foot"><span>ANDROID / LINUX HOST / PRIVATE CONNECTIVITY</span><span>01—∞ &nbsp; A PLACE FOR WHAT STAYS</span></div>
    </section>

    <section className="idea-chapter" id="product" aria-labelledby="idea-title">
      <div className="chapter-ruler"><span>01 / THE IDEA</span><span>AN ARCHIVE OF YOUR OWN</span></div>
      <div className="idea-layout">
        <h2 id="idea-title" className="font-heading">Your photographs<br />deserve a place<br /><em>of their own.</em></h2>
        <figure className="idea-photo photo-lift"><Image src="/images/editorial/friends-memory.jpg" alt="Friends sharing a quiet afternoon together on the grass" fill sizes="(max-width: 760px) 90vw, 48vw" quality={82} /><figcaption><span>THE DAYS THAT STAY</span><span>FOTORO / 01</span></figcaption></figure>
        <p className="idea-copy">Your photographs are part of your life. Fotoro gives their originals a home on infrastructure you control, and gives you a beautiful way back to the moments inside them.</p>
        <span className="idea-margin-note">A QUIETER KIND OF KEEPING</span>
      </div>
    </section>

    <section id="how-it-works" className="lifecycle-chapter" aria-labelledby="lifecycle-title">
      <div className="chapter-ruler chapter-ruler--light"><span>02 / A PHOTOGRAPH’S JOURNEY</span><span>FROM CAPTURE TO ARCHIVE</span></div>
      <div className="lifecycle-heading"><h2 id="lifecycle-title" className="font-heading">Every photograph<br />has a <em>journey.</em></h2><p>From the moment you capture it to the moment you find it again.</p></div>
      <LifecycleExplorer />
      <p className="lifecycle-footnote"><span>RECEIVED ≠ VERIFIED ≠ BACKED UP</span> Each step describes a distinct state recorded by the host.</p>
    </section>

    <section className="archive-chapter" id="archive" aria-labelledby="archive-title">
      <div className="chapter-ruler"><span>03 / THE DAYS WE KEEP</span><span>YOUR PRIVATE PHOTO ARCHIVE</span></div>
      <div className="archive-intro"><div><h2 id="archive-title" className="font-heading">A beautiful place<br />to <em>return to.</em></h2><p>Browse the photographs on your linked host in a quiet, chronological timeline.</p></div><Link className="editorial-action editorial-action--dark" href="/dashboard/library">Enter the archive <ArrowUpRight size={15} /></Link></div>
      <div className="archive-composition" aria-label="Curated editorial photographs; the signed-in archive contains only your own media">
        <figure className="archive-composition__wide"><Image src="/images/editorial/mountain-light.jpg" alt="Late sunlight breaking through cloud above a mountain range" fill sizes="(max-width:760px) 100vw, 55vw" quality={82} /><figcaption><span>LAND / AFTER THE RAIN</span><span>EXAMPLE PHOTOGRAPH</span></figcaption></figure>
        <figure className="archive-composition__portrait"><Image src="/images/editorial/last-light.jpg" alt="People as silhouettes on a beach at the last light of day" fill sizes="(max-width:760px) 45vw, 24vw" quality={82} /><figcaption><span>AT THE WATERLINE</span></figcaption></figure>
        <figure className="archive-composition__print"><Image src="/images/editorial/printed-memories.jpg" alt="A camera resting on an open book beside printed photographs" fill sizes="(max-width:760px) 52vw, 28vw" quality={82} /><figcaption><span>PRINT / 03</span></figcaption></figure>
        <p className="archive-composition__note"><span>EDITORIAL STUDY / 001</span><br />These are selected examples. The private archive loads only media from your host.</p>
      </div>
    </section>

    <section className="original-chapter" aria-labelledby="original-title">
      <div className="chapter-ruler chapter-ruler--light"><span>04 / THE ORIGINAL MATTERS</span><span>A FILE RECORD, NOT A PROMISE</span></div>
      <div className="original-layout">
        <div className="original-copy"><h2 id="original-title" className="font-heading">An upload is not<br />the same as a<br /><em>safely kept photo.</em></h2><p>A received file, a verified original and a separate backup copy are different states. Fotoro keeps those distinctions visible.</p><Link className="text-link" href="/security">See how verification works <ArrowRight size={14} /></Link></div>
        <div className="file-ledger" aria-label="Explanation of a Fotoro file record; states shown depend on the linked host">
          <div className="file-ledger__top"><span>FILE RECORD</span><span>FIELDS SUPPLIED BY HOST</span></div>
          <div className="file-ledger__file"><span className="file-ledger__glyph">▤</span><div><strong>ORIGINAL MEDIA</strong><small>Kept on your configured storage</small></div></div>
          <dl><div><dt>Integrity</dt><dd>SHA-256 state from host</dd></div><div><dt>Primary copy</dt><dd>Tracked by server</dd></div><div><dt>Backup copy</dt><dd>Independent state</dd></div></dl>
          <small className="file-ledger__fine">No preset counts or sample verification results.</small>
        </div>
      </div>
    </section>

    <section className="infrastructure-chapter" aria-labelledby="infrastructure-title">
      <div className="chapter-ruler"><span>05 / YOUR MACHINE. YOUR ARCHIVE.</span><span>MEDIA STORAGE AND ACCOUNT LINKING ARE SEPARATE</span></div>
      <div className="infrastructure-head"><h2 id="infrastructure-title" className="font-heading">The place your photographs live<br />should be <em>yours to choose.</em></h2><p>Original media stays on your configured Linux storage. Fotoro’s hosted site and Supabase support account sign-in and node linking; they are not the destination for your photographs.</p></div>
      <div className="infra-flow" aria-label="Media path from Android through private Tailscale connectivity to the user’s Linux host, then a separately configured backup">
        <div className="infra-node"><span>01</span><b>ANDROID</b><small>Capture &amp; send</small></div><i className="infra-wire" /><div className="infra-node"><span>02</span><b>TAILSCALE</b><small>Private route</small></div><i className="infra-wire" /><div className="infra-node infra-node--host"><span>03</span><b>YOUR LINUX HOST</b><small>Originals / previews / catalogue</small></div><i className="infra-wire" /><div className="infra-node"><span>04</span><b>BACKUP TARGET</b><small>Separate, configured copy</small></div>
      </div>
      <div className="infra-account"><span>ACCOUNT &amp; NODE LINKING / SUPABASE</span><p>Sign-in and server routing metadata. Original photo and video files stay on the host you choose.</p></div>
      <div className="security-teaser"><span>06 / SECURITY</span><h3 className="font-display">Private by design.<br /><em>Transparent by default.</em></h3><p>See how authentication, private connectivity, pairing, verification and independent backups fit together.</p><Link className="text-link" href="/security">Explore the security model <ArrowUpRight size={15} /></Link><Image src="/images/editorial/quiet-architecture.jpg" alt="A dark passage opening toward a sunlit courtyard" fill sizes="(max-width:760px) 100vw, 42vw" quality={82} /></div>
    </section>

    <section className="closing-chapter" aria-labelledby="closing-title">
      <div className="closing-orbit" aria-hidden="true"><span /><span /><span /></div>
      <p className="eyebrow">FOTORO / PRIVATE PHOTO ARCHIVE</p>
      <h2 id="closing-title" className="font-display">Keep the moments.<br /><em>Own the archive.</em></h2>
      <p>Your photographs. Your hardware. Your terms.</p>
      <Link className="editorial-action" href="/download">Get started with Fotoro <ArrowUpRight size={15} /></Link>
      <span className="closing-folio">END PAPER / FOTORO</span>
    </section>
  </div>;
}

import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Check, HardDrive, Smartphone, Wifi } from "lucide-react";

const stages = [
  { n: "01", title: "Capture", text: "A photograph begins on your Android device.", icon: Smartphone },
  { n: "02", title: "Transfer", text: "The original travels over your private Tailscale connection.", icon: Wifi },
  { n: "03", title: "Verify", text: "Your Linux host checks the received file before confirming it.", icon: Check },
  { n: "04", title: "Preserve", text: "Backup copies are tracked separately. The moment finds its place in your timeline.", icon: HardDrive },
];

export function HomeStory() {
  return <div className="home-story">
    <section className="home-hero" aria-labelledby="hero-title">
      <Image src="/editorial/coast-memory.webp" alt="A quiet coastline at dusk, a person looking out across the water" fill priority sizes="100vw" className="home-hero__image" />
      <div className="home-hero__shade" />
      <div className="home-hero__inner">
        <div className="home-hero__copy">
          <p className="eyebrow home-hero__eyebrow">A PRIVATE PHOTO ARCHIVE <span>·</span> BUILT FOR YOUR OWN HARDWARE</p>
          <h1 id="hero-title" className="font-display">Your photos.<br /><em>On your server.</em></h1>
          <p className="home-hero__lede">An open-source archive that brings originals from Android to a machine you control. Verified, preserved, and ready to rediscover.</p>
          <div className="home-hero__actions"><Link className="button-paper" href="/download">Get started <ArrowUpRight size={16} /></Link><Link className="button-quiet" href="#archive">Explore the archive <ArrowDownRight size={16} /></Link></div>
        </div>
        <div className="hero-index"><span>ANDROID APP</span><i /> <span>LINUX HOST</span><i /> <span>PRIVATE ACCESS</span></div>
        <div className="hero-note"><span className="hero-note__cross">＋</span><span>ORIGINALS LIVE<br />ON YOUR HARDWARE</span></div>
        <div className="hero-count"><span>01 / 05</span><span>A quieter home for every photograph.</span></div>
      </div>
    </section>

    <section className="story-section philosophy" id="product">
      <div className="story-label"><span>01 / THE IDEA</span><span>OWNERSHIP, MADE ORDINARY</span></div>
      <div className="philosophy-grid">
        <h2 className="font-display">Your memories deserve<br />more than <em>a subscription.</em></h2>
        <div className="philosophy-copy"><p>Your photographs are part of your life. Fotoro gives them a home on infrastructure you control, without sending the original archive to another cloud.</p><Link className="text-link" href="/about">Why Fotoro <ArrowUpRight size={15} /></Link></div>
        <figure className="philosophy-image"><Image src="/editorial/printed-memories.webp" alt="A small collection of printed photographs in the afternoon light" fill sizes="(max-width: 800px) 100vw, 58vw" /><figcaption><span>THE ORIGINAL MATTERS</span><span>01 — PERSONAL ARCHIVE</span></figcaption></figure>
        <aside className="file-slip"><span className="eyebrow">AN ARCHIVE FILE RECORD</span><strong>ORIGINAL MEDIA</strong><span>STORAGE <b>YOUR HOST</b></span><span>ACCOUNT LINK <b>FOTORO WEB</b></span><small>Supabase supports sign-in and server linking. It is not the photo store.</small></aside>
      </div>
    </section>

    <section className="journey-section" id="how-it-works">
      <div className="story-label"><span>02 / FROM CAPTURE TO ARCHIVE</span><span>A CLEARER KIND OF BACKUP</span></div>
      <div className="journey-heading"><h2 className="font-display">Every photograph has a journey.<br /><em>Know where it ends.</em></h2><p>Four considered steps. One original file, on a machine you chose.</p></div>
      <div className="journey-rail">{stages.map(({ n, title, text, icon: Icon }) => <article className="journey-step" key={n}><span className="journey-step__number">{n}</span><div className="journey-step__icon"><Icon size={18} strokeWidth={1.5} /></div><h3 className="font-display">{title}</h3><p>{text}</p><span className="journey-step__line" /></article>)}</div>
      <p className="journey-footnote"><span>TRANSFER ≠ PRESERVATION</span> Fotoro shows when a file is received, when its integrity is verified, and the separately tracked state of backup copies.</p>
    </section>

    <section className="archive-section" id="archive">
      <div className="story-label"><span>03 / THE ARCHIVE</span><span>TIME, IN ITS OWN ORDER</span></div>
      <div className="archive-heading"><h2 className="font-display">An archive worth<br /><em>getting lost in.</em></h2><Link className="text-link" href="/dashboard/library">Explore the archive <ArrowUpRight size={15} /></Link></div>
      <div className="editorial-gallery" aria-label="Editorial photography preview">
        <figure className="editorial-gallery__one"><Image src="/editorial/lake-walk.webp" alt="Two friends walking beside a still lake" fill sizes="(max-width: 700px) 52vw, 36vw" /><figcaption><span>01 / THE LONG WAY HOME</span><span>AFTERNOON LIGHT</span></figcaption></figure>
        <figure className="editorial-gallery__two"><Image src="/editorial/coast-memory.webp" alt="A person watching the last light at the coast" fill sizes="(max-width: 700px) 42vw, 28vw" /><figcaption><span>02 / LAST LIGHT</span></figcaption></figure>
        <figure className="editorial-gallery__three"><Image src="/editorial/printed-memories.webp" alt="Printed photographs kept close at hand" fill sizes="(max-width: 700px) 48vw, 31vw" /><figcaption><span>03 / KEPT CLOSE</span></figcaption></figure>
      </div>
      <p className="archive-disclaimer">A small editorial preview. Your private archive contains only your own media.</p>
    </section>

    <section className="integrity-section">
      <div className="story-label"><span>04 / THE ORIGINAL</span><span>INTEGRITY YOU CAN INSPECT</span></div>
      <div className="integrity-grid"><div><h2 className="font-display">Nothing lost<br /><em>in the making.</em></h2><p>The server keeps the original bytes and records their integrity. Backup copies have their own state, so a received file is never mistaken for a preserved one.</p><Link className="text-link" href="/features">How file records work <ArrowUpRight size={15} /></Link></div>
        <div className="record-card"><div className="record-card__head"><span>ARCHIVE RECORD</span><span>HOST CATALOGUE</span></div><strong>Original media</strong><dl><div><dt>Source</dt><dd>Android device</dd></div><div><dt>Stored at</dt><dd>Your Linux host</dd></div><div><dt>Integrity</dt><dd>State reported by host</dd></div><div><dt>Backup copy</dt><dd>Tracked separately</dd></div></dl><small>Per-file state comes from the linked Fotoro host.</small></div>
      </div>
    </section>

    <section className="architecture-section" id="self-hosting">
      <div className="story-label"><span>05 / YOUR STORAGE. YOUR DECISIONS.</span><span>THE ACTUAL MEDIA PATH</span></div>
      <div className="architecture-heading"><h2 className="font-display">Your machine.<br /><em>Your archive. Your rules.</em></h2><p>Fotoro connects your devices to your host. The web account helps link the server; originals stay on the storage you manage.</p></div>
      <div className="architecture-flow"><div><Smartphone /><b>ANDROID</b><small>Capture &amp; send</small></div><span className="flow-line"><i /></span><div><Wifi /><b>TAILSCALE</b><small>Private connectivity</small></div><span className="flow-line"><i /></span><div className="host-node"><HardDrive /><b>YOUR LINUX HOST</b><small>Originals · verification · backup tracking</small></div><span className="flow-line"><i /></span><div><span className="archive-glyph">f.</span><b>WEB ARCHIVE</b><small>Timeline &amp; file records</small></div></div>
      <div className="account-note"><span>ACCOUNT &amp; SERVER LINKING</span><span>Supabase holds account and node-linking data. It does not store the original photo archive.</span></div>
      <Link className="text-link" href="/docs#self-host">Explore self-hosting <ArrowUpRight size={15} /></Link>
    </section>

    <section className="closing-section"><Image src="/editorial/lake-walk.webp" alt="A quiet walk beside the water" fill sizes="100vw" /><div className="closing-shade" /><div className="closing-content"><span className="eyebrow">MADE FOR THE MOMENTS THAT STAY</span><h2 className="font-display">Keep the moments.<br /><em>Own the archive.</em></h2><p>Your photographs. Your hardware. Your terms.</p><Link className="button-paper" href="/download">Get started with Fotoro <ArrowUpRight size={16} /></Link></div><span className="closing-index">FOTORO / A PRIVATE PHOTO ARCHIVE</span></section>
  </div>;
}

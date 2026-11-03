import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, HardDrive, Smartphone, Wifi } from "lucide-react";

const stages = [
  { n: "01", title: "Capture", text: "A photograph begins on your Android device.", image: "/editorial/lake-walk.webp", alt: "Two friends walking down to a mountain lake" },
  { n: "02", title: "Transfer", text: "Its original travels over your private Tailscale connection.", image: "/editorial/coast-memory.webp", alt: "A person holding a print at the water's edge" },
  { n: "03", title: "Verify", text: "Your Linux host checks the received file and records its integrity.", image: "/editorial/printed-memories.webp", alt: "A hand holding a printed photograph" },
  { n: "04", title: "Preserve", text: "Backup copies are tracked separately. The photograph takes its place in the timeline.", image: "/editorial/lake-walk.webp", alt: "A quiet path beside a lake" },
];

export function HomeStory() {
  return <div className="home-story">
    <section className="folio-hero" aria-labelledby="hero-title">
      <div className="folio-hero__head"><p>FOTORO / PRIVATE PHOTO ARCHIVE</p><span>01—∞ &nbsp; A PLACE FOR WHAT STAYS</span></div>
      <h1 id="hero-title" className="font-display">Your photos.<br /><em>On your server.</em></h1>
      <div className="folio-hero__art" aria-label="A photographic contact sheet of ordinary moments">
        <figure className="folio-frame folio-frame--wide"><Image src="/editorial/coast-memory.webp" alt="A person standing at the coast at the end of the day" fill priority sizes="(max-width: 760px) 100vw, 56vw" /><figcaption><span>FOTORO / 001</span><span>ORIGINAL · COAST</span></figcaption></figure>
        <figure className="folio-frame folio-frame--portrait"><Image src="/editorial/lake-walk.webp" alt="Two friends at a mountain lake in late afternoon light" fill sizes="(max-width: 760px) 47vw, 22vw" /><figcaption><span>FRAME 02</span></figcaption></figure>
        <figure className="folio-frame folio-frame--print"><Image src="/editorial/printed-memories.webp" alt="A hand holding a small print among photographs" fill sizes="(max-width: 760px) 53vw, 26vw" /><figcaption><span>THE THINGS WE KEEP</span></figcaption></figure>
        <span className="folio-cross folio-cross--one">+</span><span className="folio-cross folio-cross--two">+</span>
      </div>
      <div className="folio-hero__foot"><p>An open-source photographic archive. Originals from Android, kept on a Linux machine you control.</p><div className="folio-hero__links"><Link href="/download">Explore Fotoro <ArrowUpRight size={15} /></Link><Link href="#how-it-works">See how it works <ArrowDownRight size={15} /></Link></div><span>ANDROID / LINUX HOST / PRIVATE CONNECTIVITY</span></div>
      <span className="folio-hero__edition">F—01<br />A PERSONAL ARCHIVE</span>
    </section>

    <section className="idea-chapter" id="product">
      <div className="chapter-ruler"><span>01 / THE IDEA</span><span>AN ARCHIVE OF YOUR OWN</span></div>
      <div className="idea-composition"><h2 className="font-heading">A place for<br />the photographs<br /><em>that made you.</em></h2><figure><Image src="/editorial/printed-memories.webp" alt="Printed photographs in warm late-afternoon light" fill sizes="(max-width:760px) 78vw, 49vw" /><figcaption><span>FOUND AGAIN, YEARS LATER</span><span>THE ORIGINAL MATTERS</span></figcaption></figure><p className="idea-copy">The small, unremarkable moments are often the ones we return to. Give them a home that belongs to you, and a way back into view.</p><span className="idea-index">A QUIETER KIND OF KEEPING</span></div>
    </section>

    <section className="journey-chapter" id="how-it-works">
      <div className="chapter-ruler"><span>02 / A PHOTOGRAPH’S JOURNEY</span><span>FROM THE MOMENT IT HAPPENED TO THE MOMENT YOU FIND IT AGAIN</span></div>
      <div className="journey-intro"><h2 className="font-heading">A photograph<br />keeps <em>moving.</em></h2><p>Fotoro makes its route visible: from the phone, to a machine you chose, and back to the moment in your timeline.</p></div>
      <div className="journey-scenes">{stages.map((stage) => <article className={`journey-scene journey-scene--${stage.n}`} key={stage.n}><figure><Image src={stage.image} alt={stage.alt} fill sizes="(max-width:760px) 92vw, 24vw" /></figure><div className="journey-scene__title"><span>{stage.n} / {stage.title.toUpperCase()}</span><h3 className="font-heading">{stage.title}</h3></div><p>{stage.text}</p></article>)}</div>
      <p className="journey-note"><span>RECEIVED ≠ VERIFIED ≠ BACKED UP</span> Each state is recorded separately by the host.</p>
    </section>

    <section className="archive-chapter" id="archive">
      <div className="chapter-ruler"><span>03 / THE DAYS WE KEEP</span><span>YOUR PRIVATE PHOTO ARCHIVE</span></div>
      <div className="archive-opening"><h2 className="font-heading">A beautiful place<br />to <em>return to.</em></h2><Link href="/dashboard/library" className="archive-enter">Enter the archive <ArrowUpRight size={18} /></Link></div>
      <div className="contact-sheet" aria-label="Editorial photography sample, not user archive data"><figure className="contact-sheet__large"><Image src="/editorial/lake-walk.webp" alt="Two friends descending toward the water" fill sizes="(max-width:760px) 65vw, 44vw" /><figcaption><span>PRINT 01</span><span>LAND / LATE SUMMER</span></figcaption></figure><figure className="contact-sheet__small"><Image src="/editorial/coast-memory.webp" alt="A solitary figure watching the evening sea" fill sizes="(max-width:760px) 48vw, 24vw" /><figcaption><span>PRINT 02 / COAST</span></figcaption></figure><figure className="contact-sheet__detail"><Image src="/editorial/printed-memories.webp" alt="A photograph held in the warm light of a home" fill sizes="(max-width:760px) 58vw, 34vw" /><figcaption><span>PRINT 03 / HELD CLOSE</span></figcaption></figure><div className="contact-sheet__caption"><span>EDITORIAL STUDY / 001</span><p>A preview in photographs. The archive itself shows only your media.</p></div></div>
    </section>

    <section className="original-chapter">
      <div className="chapter-ruler"><span>04 / THE ORIGINAL</span><span>AN UPLOAD IS NOT A PRESERVATION STATE</span></div>
      <div className="original-layout"><h2 className="font-heading">A file should<br />be <em>accounted for.</em></h2><p className="original-lede">A received file, a verified original, and a separate backup copy mean different things. Fotoro keeps those states legible, using the record from your host.</p>
        <div className="archive-record"><div className="archive-record__top"><span>ARCHIVE RECORD</span><span>FIELDS FROM YOUR HOST</span></div><div className="archive-record__body"><div className="record-photo"><Image src="/editorial/coast-memory.webp" alt="Coastal photograph represented in an archive record" fill sizes="260px" /><span>ORIGINAL MEDIA</span></div><dl><div><dt>Original file</dt><dd>Preserved on your host</dd></div><div><dt>Integrity</dt><dd><i /><span>State supplied by host</span></dd></div><div><dt>Backup copies</dt><dd>Tracked separately</dd></div></dl></div><small>No sample counts or preset verification claims. Each file record reflects the linked server.</small></div>
      </div>
    </section>

    <section className="machine-chapter" id="self-hosting">
      <div className="chapter-ruler"><span>05 / YOUR MACHINE. YOUR ARCHIVE.</span><span>THE MEDIA PATH, AT A GLANCE</span></div>
      <div className="machine-title"><h2 className="font-heading">The place they live<br />should be <em>yours.</em></h2><p>Your photos travel to the Linux host over Tailscale. The hosted website and Supabase help with sign-in and server linking; they do not store the originals.</p></div>
      <div className="machine-diagram">
        <div className="machine-endpoint"><Smartphone /><b>ANDROID</b><small>Capture &amp; send</small></div><span className="machine-wire"><i /></span>
        <div className="machine-endpoint"><Wifi /><b>TAILSCALE</b><small>Private connectivity</small></div><span className="machine-wire"><i /></span>
        <div className="machine-server"><HardDrive /><b>YOUR LINUX HOST</b><small>Originals / verification / backup tracking</small></div><span className="machine-wire"><i /></span>
        <div className="machine-endpoint"><span className="machine-mark">f.</span><b>WEB ARCHIVE</b><small>Timeline &amp; file record</small></div>
      </div>
      <div className="linking-note"><span>ACCOUNT &amp; SERVER LINKING</span><span>Supabase holds account and node-linking data. Original media remains on your host.</span></div>
      <Link href="/docs#self-host" className="machine-link">Explore self-hosting <ArrowUpRight size={15} /></Link>
    </section>

    <section className="last-chapter"><div className="last-chapter__image"><Image src="/editorial/lake-walk.webp" alt="Two friends walking toward the light beside a lake" fill sizes="100vw" /></div><div className="last-chapter__copy"><span>FOTORO / PRIVATE PHOTO ARCHIVE</span><h2 className="font-display">Keep the moments.<br /><em>Own the archive.</em></h2><p>Your photographs. Your hardware. Your terms.</p><Link href="/download">Get started with Fotoro <ArrowUpRight size={16} /></Link></div><span className="last-chapter__folio">END PAPER&nbsp; / &nbsp;FOTORO</span></section>
  </div>;
}

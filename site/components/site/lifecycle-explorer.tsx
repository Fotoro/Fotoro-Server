"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowRight, Check, Circle, HardDrive, LockKeyhole, Smartphone, Wifi } from "lucide-react";

const stages = [
  { id: "capture", n: "01", label: "CAPTURE", eyebrow: "THE MOMENT", title: "It starts where life happens.", copy: "A photograph or video begins on your Android device. The app can identify available media and schedule background work within the permissions and device constraints you choose.", detail: "Your phone is the source. The archive does not replace the original on the device.", state: "MEDIA ON DEVICE", icon: Smartphone },
  { id: "transfer", n: "02", label: "TRANSFER", eyebrow: "ON ITS WAY", title: "Your original makes its way home.", copy: "Media travels to your Linux host over the configured Tailscale route. Resumable upload sessions retain their saved position so an interrupted transfer can continue.", detail: "Private connectivity provides a route; the host still checks authorization on protected requests.", state: "RESUMABLE TRANSFER", icon: Wifi },
  { id: "verify", n: "03", label: "VERIFY", eyebrow: "PROVE THE ORIGINAL", title: "Received isn’t the same as verified.", copy: "The server checks the file’s SHA-256 checksum before committing the uploaded original. Content hashes can also identify duplicate media.", detail: "The visible integrity state comes from the linked host’s record for that file.", state: "CHECKSUM CHECK", icon: Check },
  { id: "store", n: "04", label: "STORE", eyebrow: "YOUR MACHINE", title: "The original stays on storage you choose.", copy: "Original media, generated previews and the local catalogue live on your configured Linux host storage. Previews are made for browsing; the original remains available as the source file.", detail: "Supabase stores account and node-linking information, not your original photo archive.", state: "ORIGINAL + PREVIEWS", icon: HardDrive },
  { id: "organise", n: "05", label: "ORGANISE", eyebrow: "FIND IT AGAIN", title: "Time gives everything its place.", copy: "The archive uses capture time when it is available and import time as a fallback. The web library pages records and virtualises nearby rows for large collections.", detail: "The public demonstration images here are editorial examples. A signed-in library uses only media from your host.", state: "CHRONOLOGICAL TIMELINE", icon: Circle },
  { id: "backup", n: "06", label: "BACK UP", eyebrow: "ANOTHER COPY", title: "A separate copy has its own state.", copy: "You configure a distinct backup target. The host tracks copy status separately from upload state and reconciles items that still need a backup copy.", detail: "A received original is not automatically described as backed up.", state: "BACKUP TRACKED SEPARATELY", icon: HardDrive },
  { id: "preserve", n: "07", label: "PRESERVE", eyebrow: "SAFELY KEPT", title: "Know when the second copy is verified.", copy: "Fotoro reports primary and backup availability independently. It only marks an item safe to remove from the phone when both copies have been verified and are available.", detail: "This is the condition represented here, not the live state of a particular photograph.", state: "SAFE WHEN BOTH COPIES VERIFY", icon: LockKeyhole },
] as const;

export function LifecycleExplorer() {
  const [active, setActive] = React.useState(0);
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const stage = stages[active];
  const Icon = stage.icon;

  function handleKeys(event: React.KeyboardEvent<HTMLButtonElement>) {
    let next = active;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (active + 1) % stages.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (active - 1 + stages.length) % stages.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = stages.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return <div className="lifecycle-explorer">
    <div className="lifecycle-tabs glass-material" role="tablist" aria-label="Photograph lifecycle stages">
      {stages.map((item, index) => <button key={item.id} ref={(node) => { tabRefs.current[index] = node; }} id={`lifecycle-tab-${item.id}`} type="button" role="tab" aria-selected={active === index} aria-controls="lifecycle-panel" tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={handleKeys}>
        <span>{item.n}</span><b>{item.label}</b><i aria-hidden="true" />
      </button>)}
    </div>
    <div className="lifecycle-progress" role="progressbar" aria-label="Lifecycle stage" aria-valuemin={1} aria-valuemax={stages.length} aria-valuenow={active + 1} style={{ "--stage-progress": `${(active / (stages.length - 1)) * 100}%` } as React.CSSProperties}><span /></div>
    <article className="lifecycle-panel" id="lifecycle-panel" role="tabpanel" aria-labelledby={`lifecycle-tab-${stage.id}`}>
      <div className="lifecycle-art" data-stage={stage.id}>
        <div className="lifecycle-art__mat"><Image src="/images/editorial/friends-at-the-shore.jpg" alt="Demonstration photograph of two friends at the water’s edge; illustrative content, not a user archive record" fill sizes="(max-width: 760px) 100vw, 48vw" quality={82} /><span className="lifecycle-art__index">FOTORO / EXAMPLE IMAGE</span></div>
        <div className="lifecycle-art__annotation glass-material"><span className="lifecycle-art__icon"><Icon size={15} strokeWidth={1.6} /></span><div><small>STAGE {stage.n} / {stage.eyebrow}</small><b>{stage.state}</b></div><span className="lifecycle-art__light" aria-hidden="true" /></div>
        <div className="lifecycle-art__route" aria-hidden="true">{stages.map((item, index) => <span key={item.id} className={index <= active ? "is-passed" : ""} />)}</div>
        <p className="lifecycle-art__disclaimer">Illustrative flow · no live file or checksum shown</p>
      </div>
      <div className="lifecycle-copy" key={stage.id}>
        <p className="lifecycle-copy__eyebrow"><span>{stage.n} / {stage.eyebrow}</span><span>07 STEPS</span></p>
        <h3 className="font-heading">{stage.title}</h3>
        <p className="lifecycle-copy__body">{stage.copy}</p>
        <div className="lifecycle-detail"><span>IN PRACTICE</span><p>{stage.detail}</p></div>
        <div className="lifecycle-copy__nav"><span>{String(active + 1).padStart(2, "0")} <i>/</i> {String(stages.length).padStart(2, "0")}</span><button type="button" onClick={() => setActive((active + 1) % stages.length)} aria-label={`Go to ${stages[(active + 1) % stages.length].label.toLowerCase()} stage`}>Next stage <ArrowRight size={14} /></button></div>
      </div>
    </article>
  </div>;
}

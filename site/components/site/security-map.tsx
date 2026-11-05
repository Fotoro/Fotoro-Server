"use client";

import * as React from "react";
import { ArrowDown, CircleHelp, Cloud, HardDrive, KeyRound, LockKeyhole, Smartphone, Wifi } from "lucide-react";

const systems = [
  { id: "android", label: "Android device", index: "01", icon: Smartphone, handles: "The phone is where photos and videos begin. A short-lived pairing invitation is redeemed by the app for its own restricted device credential.", not: "The pairing credential is not the owner’s Google sign-in. It can be revoked separately." },
  { id: "route", label: "Tailscale route", index: "02", icon: Wifi, handles: "Tailscale provides a private network path to a linked host. The host API listens on loopback by default; Serve or a hosted deployment's explicitly configured Funnel can provide the route.", not: "Network reachability does not replace API authorization. Funnel is not enabled automatically." },
  { id: "host", label: "Linux host", index: "03", icon: HardDrive, handles: "The host stores originals, generated previews and its local media catalogue. It checks the owner identity or a paired-device credential on protected media requests and verifies uploaded originals with SHA-256.", not: "The hosted website and Supabase are not the original-media destination." },
  { id: "backup", label: "Backup target", index: "04", icon: HardDrive, handles: "A separately configured storage target receives distinct backup copies. The server tracks copy state and reports which primary and backup copies are verified and available.", not: "An upload alone is not treated as an independently verified backup, and a second physical location is not automatically created." },
  { id: "web", label: "Fotoro website", index: "05", icon: LockKeyhole, handles: "The website uses the signed-in session to make authenticated requests to the linked host. Media can use a scoped, short-lived host URL when configured, with the authenticated website relay as a fallback.", not: "The website does not store the original photo archive." },
  { id: "account", label: "Supabase", index: "06", icon: Cloud, handles: "Supabase handles account sign-in and stores the endpoint ciphertext produced by the Linux host. That host creates and keeps the recovery key locally; the owner copies it to signed-in devices that need to unlock the route.", not: "Supabase does not receive the key or store original photographs, generated previews or the host catalogue. A database-only reader cannot decrypt the endpoint; the website deployment can handle the route while relaying requests." },
] as const;

export function SecurityMap() {
  const [selected, setSelected] = React.useState<(typeof systems)[number]["id"]>("host");
  const item = systems.find((system) => system.id === selected) ?? systems[2];
  const Icon = item.icon;

  return <div className="security-map">
    <div className="security-diagram" role="group" aria-label="Fotoro data-flow diagram. Select a system to inspect its data boundary.">
      <div className="security-diagram__main">
        {systems.slice(0, 4).map((system, index) => {
          const NodeIcon = system.icon;
          return <React.Fragment key={system.id}>
            <button type="button" className={`security-node ${selected === system.id ? "is-selected" : ""}`} aria-pressed={selected === system.id} onClick={() => setSelected(system.id)}>
              <span className="security-node__index">{system.index}</span><NodeIcon size={18} strokeWidth={1.5} /><b>{system.label}</b>
            </button>
            {index < 3 ? <span className="security-connector" aria-hidden="true"><i /></span> : null}
          </React.Fragment>;
        })}
      </div>
      <div className="security-diagram__account">
        <span className="security-account-wire" aria-hidden="true"><i /><ArrowDown size={12} /></span>
        <div className="security-account-nodes">
          {[systems[4], systems[5]].map((system) => {
            const NodeIcon = system.icon;
            return <button type="button" key={system.id} className={`security-node security-node--account ${selected === system.id ? "is-selected" : ""}`} aria-pressed={selected === system.id} onClick={() => setSelected(system.id)}>
              <span className="security-node__index">{system.index}</span><NodeIcon size={16} strokeWidth={1.5} /><b>{system.label}</b>
            </button>;
          })}
        </div>
        <p className="security-account-note"><KeyRound size={12} /> ACCOUNT &amp; NODE LINKING / separate from the media path</p>
      </div>
    </div>
    <div key={item.id} className="security-detail" aria-live="polite">
      <div className="security-detail__heading"><span>SELECTED SYSTEM / {item.index}</span><span><Icon size={14} /> {item.label}</span></div>
      <h3>{item.label}</h3>
      <div className="security-detail__columns"><div><span>WHAT IT HANDLES</span><p>{item.handles}</p></div><div><span>BOUNDARY</span><p>{item.not}</p></div></div>
      <p className="security-detail__state"><CircleHelp size={13} /> Network routing and data location vary with the host configuration. Access checks remain a separate part of the request.</p>
    </div>
  </div>;
}

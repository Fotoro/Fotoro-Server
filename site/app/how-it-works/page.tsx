import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";

export const metadata: Metadata = { title: "How it works", description: "Set up a Linux server, connect your account, and browse your photo timeline." };

const steps = [
  ["Run the Linux server", "Build Fotoro from source, run setup, and choose a primary storage location. Add a second drive for verified backup copies."],
  ["Link it to your account", "Connect Tailscale and complete server sign-in. Your account keeps the route to your own machine."],
  ["Import and browse", "Import files on the host or send them through the upload API. Open the dashboard to browse by date and check copy status."],
];

export default function HowItWorksPage() {
  return <PageShell><div className="container-tight max-w-4xl pb-28">
    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">The flow</p>
    <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">From storage to timeline</h1>
    <div className="mt-12 border-t border-border">{steps.map(([title, detail], index) => <section key={title} className="grid gap-3 border-b border-border py-8 sm:grid-cols-[3rem_14rem_1fr]"><span className="font-mono text-xs text-muted-foreground">0{index + 1}</span><h2 className="text-lg font-medium">{title}</h2><p className="text-sm leading-relaxed text-muted-foreground">{detail}</p></section>)}</div>
    <Link href="/download" className="mt-10 inline-block border-b border-foreground pb-1 text-sm font-medium">Set up the server ↗</Link>
  </div></PageShell>;
}

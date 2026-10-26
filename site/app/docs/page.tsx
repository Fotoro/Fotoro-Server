import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
import { DocsSidebar } from "@/components/docs/sidebar";
import { CodeBlock } from "@/components/docs/code-block";

export const metadata: Metadata = { title: "Documentation", description: "Install and operate the Fotoro Linux server and web dashboard." };

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return <section id={id} data-doc-section className="scroll-mt-24 border-t border-border py-12 first:border-0 first:pt-0">
    <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
    <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
  </section>;
}

export default function DocsPage() {
  return <PageShell><div className="container-tight pb-28">
    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Documentation</p>
    <h1 className="mt-4 text-4xl font-semibold tracking-tight">Run Fotoro</h1>
    <p className="mt-5 max-w-2xl text-muted-foreground">Current setup and API entry points for the Linux server. The Android app and packaged releases are still in development.</p>
    <div className="mt-12 flex gap-10"><DocsSidebar /><article className="min-w-0 max-w-3xl flex-1">
      <Section id="overview" title="Overview">
        <p>Fotoro has a Go server for storage and ingestion, and a separate website for account sign-in and browsing. The server listens on <code>127.0.0.1:8765</code> by default. The website connects to the server linked to your account.</p>
      </Section>
      <Section id="self-host" title="Self-host guide">
        <p>Install Go and Tailscale on your Linux host, then build and set up the server:</p>
        <CodeBlock lang="bash" code={`git clone https://github.com/Fotoro/Fotoro-Model.git
cd Fotoro-Model
go build -o fotoro .
./fotoro setup
./fotoro server`} />
        <p><code>./fotoro app</code> starts the server with the desktop UI when its Qt dependencies are available. <code>./fotoro nodesync</code> re-publishes your node record if the route changes.</p>
      </Section>
      <Section id="first-sync" title="Add your first media">
        <p>Use <code>./fotoro ingest /path/to/photos</code> to process an existing folder. The resumable upload API is available for testing a device offload flow. The Android client is not released yet.</p>
      </Section>
      <Section id="backups" title="Backup copies">
        <p>Configure a separate backup location during setup. The server records verified storage copies and reports whether an item has both its primary and backup file available. A single copy is an offload, but is not marked safe to delete from the source device.</p>
      </Section>
      <Section id="api" title="HTTP API">
        <p>The server requires an authenticated account or paired device for media routes. Common paths are:</p>
        <CodeBlock lang="http" code={`GET  /api/health
GET  /api/v1/media?page=1&limit=100
GET  /api/v1/media/{sha256}/thumbnail?size=small
GET  /api/v1/media/{sha256}/content
POST /api/v1/uploads
GET  /api/v1/device-assets/status`} />
      </Section>
      <Section id="troubleshooting" title="Troubleshooting">
        <p>If the dashboard cannot reach your host, confirm <code>./fotoro server</code> is running, check <code>./fotoro tailscale status</code>, then run <code>./fotoro nodesync</code>. The website host must be able to reach the server route on the tailnet, or run beside the Go server with a loopback proxy configuration.</p>
        <p>If previews are missing for imported media, run <code>./fotoro backfill-thumbs</code>.</p>
      </Section>
      <Section id="privacy" title="Where data goes">
        <p>Original media and generated previews live on your configured server storage. Account sign-in and node routing use Supabase, and remote access uses Tailscale. Review your deployment configuration before exposing the server.</p>
      </Section>
      <p className="mt-8 text-sm text-muted-foreground">For implementation details, see the <Link className="text-foreground underline" href="https://github.com/Fotoro/Fotoro-Model">server source</Link> and <Link className="text-foreground underline" href="https://github.com/Fotoro/Fotoro-Server">website source</Link>.</p>
    </article></div>
  </div></PageShell>;
}

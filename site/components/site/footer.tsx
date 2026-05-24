import Link from "next/link";
import { Github } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { FOOTER_LINKS, SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border">
      <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-24 max-w-6xl bg-brand-glow opacity-60" />
      <div className="container-tight pt-16 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {SITE.description}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href={SITE.github}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub"
                className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Github className="size-4" />
              </Link>
            </div>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.heading} className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/90">
                {col.heading}
              </p>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={"external" in link && link.external ? "_blank" : undefined}
                      rel={
                        "external" in link && link.external
                          ? "noreferrer noopener"
                          : undefined
                      }
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Built for people who own their memories.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/docs#privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/docs#license" className="hover:text-foreground">
              License (MIT)
            </Link>
            <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              v{SITE.version}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

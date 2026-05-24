"use client";

import * as React from "react";
import Link from "next/link";

const SECTIONS = [
  {
    heading: "Getting started",
    items: [
      { id: "overview", label: "Overview" },
      { id: "self-host", label: "Self-host guide" },
      { id: "first-sync", label: "Your first sync" },
    ],
  },
  {
    heading: "Operate",
    items: [
      { id: "ai", label: "Local AI models" },
      { id: "backups", label: "Backups & dedup" },
      { id: "api", label: "HTTP API" },
    ],
  },
  {
    heading: "Support",
    items: [
      { id: "troubleshooting", label: "Troubleshooting" },
      { id: "privacy", label: "Privacy" },
      { id: "license", label: "License (MIT)" },
    ],
  },
] as const;

export function DocsSidebar() {
  const [active, setActive] = React.useState<string>("overview");

  React.useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-doc-section]");
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-25% 0% -55% 0%", threshold: [0.1, 0.5, 1] }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-20 hidden h-[calc(100vh-6rem)] w-60 shrink-0 overflow-y-auto pr-3 md:block" aria-label="Docs">
      {SECTIONS.map((section) => (
        <div key={section.heading} className="mb-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            {section.heading}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`#${item.id}`}
                  className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active === item.id
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

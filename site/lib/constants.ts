export const SITE = {
  name: "Fotoro",
  domain: "fotoro.vercel.app",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://fotoro.vercel.app").replace(/\/$/, ""),
  tagline: "Your photos, on your server.",
  description: "Fotoro is an open-source photo and video archive for a Linux host, with a web dashboard for browsing and managing backups.",
  github: "https://github.com/Fotoro/Fotoro-Server",
  twitter: "@fotoroapp",
  email: "hello@fotoro.app",
} as const;

export const NAV_LINKS = [
  { href: "/features", label: "Product" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#archive", label: "Archive" },
  { href: "/security", label: "Security" },
  { href: "/blog", label: "Journal" },
  { href: "/docs", label: "Documentation" },
] as const;

export const FOOTER_LINKS = [
  { heading: "Product", links: [
    { href: "/features", label: "Features" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/security", label: "Security" },
    { href: "/download", label: "Get started" },
  ] },
  { heading: "Resources", links: [
    { href: "/blog", label: "Journal" },
    { href: "/docs", label: "Documentation" },
    { href: "/docs#self-host", label: "Self-host guide" },
    { href: "/docs#api", label: "API reference" },
    { href: "/docs#troubleshooting", label: "Troubleshooting" },
  ] },
  { heading: "Project", links: [
    { href: "/about", label: "About" },
    { href: SITE.github, label: "GitHub", external: true },
    { href: `mailto:${SITE.email}`, label: "Contact", external: true },
  ] },
] as const;

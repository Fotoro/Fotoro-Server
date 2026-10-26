export const SITE = {
  name: "Fotoro",
  domain: "fotoro.app",
  url: "https://fotoro.app",
  tagline: "Your photos, on your server.",
  description: "Fotoro is an open-source photo and video archive for a Linux host, with a web dashboard for browsing and managing backups.",
  github: "https://github.com/Fotoro/Fotoro-Server",
  twitter: "@fotoroapp",
  email: "hello@fotoro.app",
  version: "0.4.0",
} as const;

export const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/docs", label: "Docs" },
] as const;

export const FOOTER_LINKS = [
  { heading: "Product", links: [
    { href: "/features", label: "Features" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/download", label: "Get started" },
  ] },
  { heading: "Resources", links: [
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

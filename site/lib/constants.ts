export const SITE = {
  name: "Fotoro",
  domain: "fotoro.app",
  url: "https://fotoro.app",
  tagline: "Own your memories. Search them like magic.",
  description:
    "Fotoro is a fully self-hosted, open-source photo & video archive with a local multimodal AI that lets you search your library in natural language. Your memories, on your hardware.",
  github: "https://github.com/Fotoro/Fotoro-Server",
  twitter: "@fotoroapp",
  email: "hello@fotoro.app",
  version: "0.4.0",
} as const;

export const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/docs", label: "Docs" },
] as const;

export const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/download", label: "Download" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/docs#self-host", label: "Self-host guide" },
      { href: "/docs#api", label: "API reference" },
      { href: "/docs#troubleshooting", label: "Troubleshooting" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/pricing", label: "Pricing" },
      { href: SITE.github, label: "GitHub", external: true },
      { href: `mailto:${SITE.email}`, label: "Contact", external: true },
    ],
  },
] as const;

export type Platform = "macos" | "windows" | "linux" | "android" | "ios" | "unknown";

export const DOWNLOADS: Record<
  Exclude<Platform, "unknown">,
  {
    label: string;
    primary: { name: string; href: string; ext: string; arch?: string };
    secondary?: { name: string; href: string; ext: string; arch?: string }[];
    install?: string;
  }
> = {
  macos: {
    label: "macOS",
    primary: {
      name: "Fotoro for macOS",
      href: "/downloads/Fotoro-0.4.0-arm64.dmg",
      ext: "dmg",
      arch: "Apple Silicon",
    },
    secondary: [
      {
        name: "Intel build",
        href: "/downloads/Fotoro-0.4.0-x64.dmg",
        ext: "dmg",
        arch: "Intel",
      },
    ],
    install: "brew install --cask fotoro",
  },
  windows: {
    label: "Windows",
    primary: {
      name: "Fotoro for Windows",
      href: "/downloads/Fotoro-0.4.0-x64-setup.exe",
      ext: "exe",
      arch: "x64",
    },
    secondary: [
      {
        name: "MSI installer",
        href: "/downloads/Fotoro-0.4.0-x64.msi",
        ext: "msi",
        arch: "x64",
      },
    ],
    install: "winget install fotoro",
  },
  linux: {
    label: "Linux",
    primary: {
      name: "AppImage",
      href: "/downloads/Fotoro-0.4.0-x86_64.AppImage",
      ext: "AppImage",
      arch: "x86_64",
    },
    secondary: [
      {
        name: ".deb (Debian/Ubuntu)",
        href: "/downloads/fotoro_0.4.0_amd64.deb",
        ext: "deb",
        arch: "amd64",
      },
      {
        name: ".rpm (Fedora/RHEL)",
        href: "/downloads/fotoro-0.4.0.x86_64.rpm",
        ext: "rpm",
        arch: "x86_64",
      },
    ],
    install: "curl -fsSL get.fotoro.app | bash",
  },
  android: {
    label: "Android",
    primary: {
      name: "Fotoro APK",
      href: "/downloads/fotoro-0.4.0.apk",
      ext: "apk",
      arch: "universal",
    },
    install: "Sideload or grab it from the Play Store",
  },
  ios: {
    label: "iOS",
    primary: {
      name: "TestFlight (waitlist)",
      href: "#",
      ext: "—",
    },
  },
};

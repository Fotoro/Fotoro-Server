"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowUpRight, LayoutDashboard, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/site/logo";
import { SITE } from "@/lib/constants";
import { isAuthenticated } from "@/lib/fotoro-session";
import { cn } from "@/lib/utils";

const links = [
  { href: "/features", label: "Product" },
  { href: "/#how-it-works", label: "How it works", section: "how-it-works" },
  { href: "/#archive", label: "Archive", section: "archive" },
  { href: "/security", label: "Security" },
  { href: "/blog", label: "Journal", journal: true },
  { href: "/docs", label: "Documentation" },
];

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("");
  const pathname = usePathname();

  React.useEffect(() => setOpen(false), [pathname]);
  React.useEffect(() => setLoggedIn(isAuthenticated()), [pathname]);

  React.useEffect(() => {
    const update = () => setScrolled(window.scrollY > 28);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  React.useEffect(() => {
    if (pathname !== "/") { setActiveSection(""); return; }
    const sections = ["how-it-works", "archive"]
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element instanceof HTMLElement);
    if (!sections.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: "-82px 0px -64% 0px", threshold: [0, .15, .35, .6] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  const isActive = (link: (typeof links)[number]) => {
    if (link.section) return pathname === "/" && activeSection === link.section;
    const hrefPath = link.href.split("#")[0];
    return Boolean(hrefPath && (pathname === hrefPath || (hrefPath !== "/" && pathname.startsWith(`${hrefPath}/`))));
  };

  return <header className={cn("site-nav fixed inset-x-0 top-0 z-50", (scrolled || pathname !== "/") && "is-glass")}>
    <div className="container-tight site-nav__inner">
      <Logo className="site-nav__logo" />
      <nav className="site-nav__links" aria-label="Main navigation">
        {links.map((link, index) => <Link key={link.href} href={link.href} aria-current={isActive(link) ? (link.section ? "location" : "page") : undefined} className={cn("site-nav__link", isActive(link) && "is-active", link.journal && "site-nav__link--journal")}>
          <span>{link.label}</span>
          {link.journal ? <ArrowUpRight size={11} aria-hidden="true" /> : null}
          {!link.journal ? <span className="site-nav__link-order" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span> : null}
        </Link>)}
      </nav>
      <div className="site-nav__actions">
        {loggedIn ? <Button asChild variant="ghost" size="sm" className="site-nav__signin"><Link href="/dashboard"><LayoutDashboard size={14} /> Dashboard</Link></Button> : <Button asChild variant="ghost" size="sm" className="site-nav__signin"><Link href="/login">Sign in</Link></Button>}
        <Button asChild size="sm" className="site-nav__cta"><Link href="/download">Get started <ArrowRight size={14} /></Link></Button>
      </div>
      <div className="site-nav__mobile">
        {loggedIn ? <Link href="/dashboard" className="site-nav__mobile-account">Dashboard</Link> : <Link href="/login" className="site-nav__mobile-account">Sign in</Link>}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open navigation"><Menu size={19} /></Button></SheetTrigger>
          <SheetContent side="right" className="site-nav__sheet">
            <SheetHeader><SheetTitle><Logo /></SheetTitle></SheetHeader>
            <nav className="site-nav__mobile-links" aria-label="Mobile navigation">
              {links.map((link, index) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={isActive(link) ? (link.section ? "location" : "page") : undefined} className={cn(isActive(link) && "is-active", link.journal && "is-journal")}>
                {!link.journal ? <span className="site-nav__mobile-number">{String(index + 1).padStart(2, "0")}</span> : <span aria-hidden="true" />}<span>{link.label}</span>{link.journal ? <ArrowUpRight size={14} /> : <ArrowRight size={14} />}
              </Link>)}
            </nav>
            <div className="site-nav__sheet-foot"><p>ANDROID / LINUX / PRIVATE ACCESS</p><Button asChild className="site-nav__cta"><Link href="/download">Get started <ArrowRight size={14} /></Link></Button><Link href={SITE.github} target="_blank" rel="noreferrer noopener" className="site-nav__github">Open-source on GitHub <ArrowUpRight size={12} /></Link></div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>;
}

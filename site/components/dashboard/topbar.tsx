"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FotoroUser } from "@/lib/fotoro-session";

export function DashboardTopbar({ user, onLogout }: {
  user?: FotoroUser | { name?: string | null; email?: string | null; avatar_url?: string; picture?: string };
  onLogout?: () => void;
}) {
  const initials = (user?.name ?? user?.email ?? "User").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const avatar = user && "avatar_url" in user ? user.avatar_url ?? user.picture : user && "picture" in user ? user.picture : undefined;

  return <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-5 backdrop-blur">
    <span className="matrix-label hidden sm:block">Your archive / Control room</span>
    <Link href="/dashboard/library" className="inline-flex items-center gap-2 border-b border-[hsl(var(--brand))] pb-1 font-mono text-[11px] uppercase tracking-wider text-[hsl(var(--brand))] sm:ml-6">Open library <ArrowUpRight className="size-3" /></Link>
    <div className="ml-auto flex items-center gap-2">
      <div className="inline-flex items-center gap-2 border border-border bg-card py-1 pl-1 pr-3">
        {avatar ? <Image src={avatar} alt="" width={28} height={28} unoptimized className="size-7 object-cover" /> : <span className="inline-flex size-7 items-center justify-center bg-[hsl(var(--brand))] font-mono text-[10px] font-bold text-background">{initials}</span>}
        <span className="hidden max-w-40 truncate text-xs text-muted-foreground sm:inline">{user?.name ?? user?.email ?? "User"}</span>
      </div>
      {onLogout ? <Button size="icon" variant="ghost" aria-label="Sign out" onClick={onLogout}><LogOut className="size-4" /></Button> : null}
    </div>
  </header>;
}

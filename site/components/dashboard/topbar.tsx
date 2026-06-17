"use client";

import * as React from "react";
import { Bell, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FotoroUser } from "@/lib/fotoro-session";

export function DashboardTopbar({
  user,
  onLogout,
}: {
  user?: FotoroUser | { name?: string | null; email?: string | null; avatar_url?: string; picture?: string };
  onLogout?: () => void;
}) {
  const initials = (user?.name ?? user?.email ?? "User")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatar = user && "avatar_url" in user ? user.avatar_url ?? user.picture : user && "picture" in user ? user.picture : undefined;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/70 px-5 backdrop-blur-md">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Describe a memory… (semantic search)"
          className="pl-9"
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button size="icon" variant="ghost" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card pr-3 pl-1 py-1">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt=""
              className="size-7 rounded-full border border-border object-cover"
            />
          ) : (
            <span className="inline-flex size-7 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-white/20 to-white/[0.03] text-xs font-semibold text-foreground">
              {initials}
            </span>
          )}
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {user?.name ?? user?.email ?? "User"}
          </span>
        </div>
        {onLogout ? (
          <Button
            size="icon"
            variant="ghost"
            aria-label="Sign out"
            onClick={onLogout}
          >
            <LogOut className="size-4" />
          </Button>
        ) : null}
      </div>
    </header>
  );
}

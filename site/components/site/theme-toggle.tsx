"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");

  React.useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.dataset.theme = next;
    root.classList.toggle("dark", next === "dark");
    try { localStorage.setItem("fotoro-theme", next); } catch { /* private mode */ }
    setTheme(next);
  }

  return <button type="button" onClick={toggle}
    aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    title={theme === "dark" ? "Daylight gallery" : "Night gallery"}
    className="inline-flex size-10 items-center justify-center rounded-full border border-border/70 bg-card/60 text-foreground transition-[background-color,transform] duration-200 hover:bg-accent active:scale-95"
  >{theme === "dark" ? <Sun className="size-4" strokeWidth={1.5} /> : <Moon className="size-4" strokeWidth={1.5} />}</button>;
}

import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  showWord = true,
}: {
  className?: string;
  href?: string;
  showWord?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 tracking-tight",
        className
      )}
      aria-label="Fotoro home"
    >
      <svg className="size-7 text-[hsl(var(--brand))]" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M3 9V3h6M23 3h6v6M29 23v6h-6M9 29H3v-6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 22V10h10" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="22.5" cy="22.5" r="1.5" fill="currentColor" />
      </svg>
      {showWord ? (
        <span className="font-display text-[28px] leading-none tracking-[-0.055em]">fotoro<span className="text-[hsl(var(--brand))]">.</span></span>
      ) : null}
    </Link>
  );
}

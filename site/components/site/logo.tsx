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
      <svg className="size-8 text-[hsl(var(--brand))]" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M4.5 4.5h23v23h-23z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20.5 9.5h-9v13m0-6.5h7" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        <path d="M23.5 23.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {showWord ? (
        <span className="font-display text-[27px] leading-none tracking-[-0.04em]">fotoro<span className="text-[hsl(var(--brand))]">.</span></span>
      ) : null}
    </Link>
  );
}

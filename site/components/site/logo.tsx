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
        "group inline-flex items-center gap-2 font-semibold tracking-tight",
        className
      )}
      aria-label="Fotoro home"
    >
      <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-gradient-to-br from-white/15 via-white/5 to-transparent ring-1 ring-inset ring-white/20 shadow-[0_0_12px_-2px_hsl(0_0%_100%/0.25)] transition-all group-hover:shadow-[0_0_18px_-2px_hsl(0_0%_100%/0.35)]">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <circle cx="12" cy="12" r="3.25" />
          <path d="M7 5l1.2-1.7a1 1 0 0 1 .82-.43h6a1 1 0 0 1 .82.43L17 5" />
        </svg>
      </span>
      {showWord ? (
        <span className="text-[15px] leading-none">Fotoro</span>
      ) : null}
    </Link>
  );
}

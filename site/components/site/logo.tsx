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
        "group inline-flex items-center gap-2.5 font-semibold tracking-tight",
        className
      )}
      aria-label="Fotoro home"
    >
      <span className="inline-grid size-8 grid-cols-3 place-items-center border border-[hsl(var(--brand))] bg-[hsl(var(--brand))] p-1" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => <span key={index} className={index === 4 ? "size-1.5 rounded-full bg-background" : "size-1 rounded-full bg-background/70"} />)}
      </span>
      {showWord ? (
        <span className="text-[17px] font-semibold leading-none tracking-[-0.04em]">fotoro<span className="text-[hsl(var(--brand))]">.</span></span>
      ) : null}
    </Link>
  );
}

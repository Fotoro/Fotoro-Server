import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[70vh] items-center justify-center px-5 pt-24">
        <div className="relative isolate w-full max-w-xl rounded-2xl border border-border bg-card p-10 text-center ring-soft">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-line-grid opacity-25 mask-fade-radial"
          />
          <p className="font-mono text-xs uppercase tracking-wider text-foreground">
            404 · vector not found
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Even the local model couldn&apos;t find it.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist, was moved, or
            never lived here. Try one of these instead.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <Button asChild>
              <Link href="/">Go home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs">Read the docs</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/download">Download Fotoro</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

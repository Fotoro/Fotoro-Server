import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex min-h-[70vh] items-center justify-center px-5 pt-24">
        <div className="matrix-panel relative isolate w-full max-w-xl p-10 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-40 mask-fade-radial"
          />
          <p className="matrix-label">
            404 / Page missing
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            This page isn&apos;t in the archive.
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
              <Link href="/download">Get started</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

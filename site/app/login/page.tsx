import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage your self-hosted Fotoro instance.",
};

export default function LoginPage() {
  return (
    <main id="main" className="relative isolate flex min-h-screen flex-col items-center justify-center px-5 py-10">

      <div className="absolute left-5 top-5 sm:left-8 sm:top-8">
        <Logo />
      </div>

      <div className="grid w-full max-w-5xl overflow-hidden border border-border bg-card lg:grid-cols-2">
        <div className="p-7 sm:p-12">
          <div className="mb-6">
            <p className="matrix-label">Your archive / sign in</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight">
              Welcome back.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Continue with the account that pairs your devices to your local server.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex h-72 items-center justify-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Account sign-in links this dashboard to your own Fotoro server. Read the{" "}
            <Link href="/docs#privacy" className="text-foreground underline-offset-4 hover:underline">
              privacy notice
            </Link>
            .
          </p>
          <p className="mt-6 text-sm text-muted-foreground">New here? <Link href="/download" className="border-b border-[hsl(var(--brand))] pb-1 text-[hsl(var(--brand))]">Set up your Linux server</Link> first.</p>
        </div>
        <div className="matrix-art hidden lg:block" aria-hidden="true"><div className="matrix-art__frame" /><p className="absolute bottom-8 left-8 z-10 font-mono text-xs uppercase tracking-widest">A private route back to every frame.</p></div>
      </div>
    </main>
  );
}

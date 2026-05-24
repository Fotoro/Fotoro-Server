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
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-brand-glow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-line-grid opacity-20 mask-fade-radial"
      />

      <div className="absolute left-5 top-5 sm:left-8 sm:top-8">
        <Logo />
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-7 shadow-2xl ring-soft">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Sign in to Fotoro
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

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to the{" "}
            <Link href="/docs#privacy" className="text-foreground underline-offset-4 hover:underline">
              privacy notice
            </Link>{" "}
            and{" "}
            <Link href="/docs#license" className="text-foreground underline-offset-4 hover:underline">
              MIT license
            </Link>
            . No tracking, ever.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/download"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Download Fotoro
          </Link>{" "}
          and run the setup wizard.
        </p>
      </div>
    </main>
  );
}

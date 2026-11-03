import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage your self-hosted Fotoro instance.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main id="main" className="login-page">

      <div className="login-logo">
        <Logo />
      </div>

      <div className="login-layout">
        <div className="login-panel">
          <div className="mb-6">
            <p className="text-xs tracking-[.14em] text-[hsl(var(--brand))]">YOUR FOTORO ACCOUNT</p>
            <h1 className="font-display mt-5 text-5xl leading-none">
              Open your archive
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
        <div className="login-image"><Image src="/images/editorial/hero-ocean-path.jpg" alt="A figure walking a path toward the coastline" fill sizes="50vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0C]/65 to-transparent" /><p className="font-display absolute bottom-9 left-9 max-w-sm text-4xl italic leading-tight text-[#F5F1EB]">Your server holds the originals.</p></div>
      </div>
    </main>
  );
}

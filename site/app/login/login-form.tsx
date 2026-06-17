"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { GoogleSignIn } from "@/components/auth/google-one-tap";
import { isAuthenticated } from "@/lib/fotoro-session";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    if (isAuthenticated()) {
      router.replace(callbackUrl);
      return;
    }
    setChecking(false);
  }, [callbackUrl, router]);

  if (checking) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GoogleSignIn redirectTo={callbackUrl} />

      <div className="relative flex items-center">
        <span className="h-px flex-1 bg-border" />
        <span className="px-3 text-xs uppercase tracking-wider text-muted-foreground">
          Secure, self-hosted, private
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Sign in with the same Google account you use on your Fotoro server.
        Your photos never leave your devices — Fotoro runs entirely on your hardware.
      </p>
    </div>
  );
}

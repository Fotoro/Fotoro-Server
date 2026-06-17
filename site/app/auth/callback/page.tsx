import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCallbackClient } from "./auth-callback-client";

export const metadata: Metadata = {
  title: "Signing in",
};

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-muted-foreground">
          Completing sign-in…
        </main>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}

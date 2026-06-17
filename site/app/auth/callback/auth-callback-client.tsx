"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  captureCliParamsFromSearchParams,
  isCliAuthFlow,
} from "@/lib/cli-handoff";
import { finishAuthFromSupabaseSession } from "@/lib/auth-finish";
import { createBrowserClient } from "@/lib/supabase/browser";

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [cliComplete, setCliComplete] = useState(false);

  useEffect(() => {
    captureCliParamsFromSearchParams(searchParams);

    async function handleCallback() {
      try {
        const supabase = createBrowserClient();
        const code = searchParams.get("code");

        let session;

        if (code) {
          const { data, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError || !data.session) {
            setError(exchangeError?.message ?? "Could not complete sign-in.");
            return;
          }
          session = data.session;
        } else {
          const { data, error: sessionError } =
            await supabase.auth.getSession();
          if (sessionError || !data.session) {
            setError(sessionError?.message ?? "No session found.");
            return;
          }
          session = data.session;
        }

        const result = await finishAuthFromSupabaseSession(session);

        if (result === "redirect") return;
        if (result === "poll") {
          setCliComplete(true);
          return;
        }

        router.replace("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign-in failed.");
      }
    }

    void handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5">
        <p className="max-w-md rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive-foreground">
          {error}
        </p>
      </main>
    );
  }

  if (cliComplete) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-5 text-center">
        <CheckCircle2 className="size-10 text-green-400" />
        <p className="text-lg font-semibold">Signed in — return to the Fotoro app</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          You can close this tab. The CLI should continue automatically.
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
      <p className="text-sm">
        {isCliAuthFlow() ? "Connecting to Fotoro…" : "Completing sign-in…"}
      </p>
    </main>
  );
}

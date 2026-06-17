"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { GoogleSignIn } from "@/components/auth/google-one-tap";
import { captureCliParamsFromSearchParams } from "@/lib/cli-handoff";
import { finishAuthForCli } from "@/lib/cli-handoff-session";
import { isAuthenticated } from "@/lib/fotoro-session";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [checking, setChecking] = React.useState(true);
  const [cliComplete, setCliComplete] = React.useState(false);
  const [cliPending, setCliPending] = React.useState(false);

  React.useEffect(() => {
    captureCliParamsFromSearchParams(params);

    async function init() {
      if (!isAuthenticated()) {
        setChecking(false);
        return;
      }

      const handoff = await finishAuthForCli();
      if (handoff === "redirect") return;
      if (handoff === "poll") {
        setCliComplete(true);
        setChecking(false);
        return;
      }
      if (handoff === "missing_refresh") {
        // Stale session without refresh token — force re-sign-in for CLI
        setChecking(false);
        return;
      }

      router.replace(callbackUrl);
    }

    void init();
  }, [callbackUrl, params, router]);

  if (checking || cliPending) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        {cliPending ? (
          <p className="text-xs">Returning to Fotoro…</p>
        ) : null}
      </div>
    );
  }

  if (cliComplete) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="size-10 text-green-400" />
        <p className="text-sm font-medium text-foreground">
          Signed in — return to the Fotoro app
        </p>
        <p className="text-xs text-muted-foreground">
          You can close this tab. The CLI should continue automatically.
        </p>
      </div>
    );
  }

  const isCli = params.get("cli") === "1" || params.has("state");

  return (
    <div className="space-y-6">
      {isCli ? (
        <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-center text-xs text-muted-foreground">
          Sign in to connect your local Fotoro server.
        </p>
      ) : null}

      <GoogleSignIn
        redirectTo={callbackUrl}
        onCliHandoffComplete={(mode) => {
          if (mode === "poll") setCliComplete(true);
          if (mode === "redirect") setCliPending(true);
        }}
      />

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

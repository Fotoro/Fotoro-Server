"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { GoogleOAuthSignIn } from "@/components/auth/google-oauth-sign-in";
import {
  captureCliParamsFromSearchParams,
  getCliHandoffContext,
} from "@/lib/cli-handoff";
import { handoffExistingSessionForCli } from "@/lib/cli-handoff-session";
import {
  clearAuth,
  getStoredToken,
  getStoredUser,
} from "@/lib/fotoro-session";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [booting, setBooting] = React.useState(true);
  const [cliComplete, setCliComplete] = React.useState(false);
  const [redirecting, setRedirecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (params.get("reauth") === "1") {
      clearAuth();
    }

    if (params.get("cli") === "complete") {
      setCliComplete(true);
      setBooting(false);
      return;
    }

    const authError = params.get("error");
    if (authError) {
      setError(decodeURIComponent(authError));
      setBooting(false);
    }

    captureCliParamsFromSearchParams(params);

    async function boot() {
      if (params.get("cli") === "complete" || params.get("error")) {
        return;
      }

      const cli = getCliHandoffContext();
      const token = getStoredToken();
      const user = getStoredUser();

      if (cli && token && user) {
        try {
          const result = await handoffExistingSessionForCli();
          if (result === "redirect") {
            setRedirecting(true);
            return;
          }
          if (result === "poll") {
            setCliComplete(true);
            setBooting(false);
            return;
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "CLI handoff failed");
          setBooting(false);
          return;
        }
      }

      if (!token) {
        setBooting(false);
        return;
      }

      if (!cli) {
        router.replace(callbackUrl);
        return;
      }

      try {
        const result = await handoffExistingSessionForCli();
        if (result === "redirect") {
          setRedirecting(true);
          return;
        }
        if (result === "poll") {
          setCliComplete(true);
          setBooting(false);
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "CLI handoff failed");
      }

      setBooting(false);
    }

    void boot();
  }, [callbackUrl, params, router]);

  if (booting || redirecting) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <p className="text-xs">
          {redirecting ? "Returning to Fotoro…" : "Checking session…"}
        </p>
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

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive-foreground">
          {error}
        </p>
      ) : null}

      <GoogleOAuthSignIn />

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

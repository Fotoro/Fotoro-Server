"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/site/oauth-icons";
import { completeCliHandoff } from "@/lib/cli-handoff";
import {
  getStoredRefreshToken,
  setStoredSession,
} from "@/lib/fotoro-session";

interface GoogleSignInProps {
  onSuccess?: (token: string) => void;
  /** Used only when not in a CLI auth flow */
  redirectTo?: string;
  onCliHandoffComplete?: (mode: "redirect" | "poll") => void;
}

export function GoogleSignIn({
  onSuccess,
  redirectTo = "/dashboard",
  onCliHandoffComplete,
}: GoogleSignInProps) {
  const router = useRouter();
  const handled = useRef(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const finishAuth = useCallback(
    async (data: {
      access_token: string;
      refresh_token?: string;
      user: {
        id: string;
        email?: string | null;
        name?: string | null;
      };
    }) => {
      setStoredSession(
        data.access_token,
        {
          id: data.user.id,
          email: data.user.email ?? "",
          name: data.user.name ?? data.user.email ?? "",
        },
        data.refresh_token
      );
      onSuccess?.(data.access_token);

      const refresh = data.refresh_token ?? getStoredRefreshToken() ?? "";

      try {
        const result = await completeCliHandoff({
          access_token: data.access_token,
          refresh_token: refresh,
          user_id: data.user.id,
          email: data.user.email ?? "",
          name: data.user.name ?? data.user.email ?? "",
        });

        if (result === "redirect") return;
        if (result === "poll") {
          onCliHandoffComplete?.("poll");
          return;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "CLI handoff failed";
        setError(message);
        handled.current = false;
        return;
      }

      router.push(redirectTo);
    },
    [onSuccess, onCliHandoffComplete, redirectTo, router]
  );

  const handleCredentialResponse = useCallback(
    async (response: google.accounts.id.CredentialResponse) => {
      if (handled.current) return;
      handled.current = true;
      setError(null);

      const credential = response.credential;
      if (!credential) {
        handled.current = false;
        return;
      }

      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        });

        let data: {
          success?: boolean;
          access_token?: string;
          refresh_token?: string;
          error?: string;
          hint?: string;
          user?: {
            id: string;
            email?: string | null;
            name?: string | null;
          };
        };

        try {
          data = await res.json();
        } catch {
          setError(
            res.ok
              ? "Unexpected server response."
              : `Server error (${res.status}). Restart \`npm run dev\` and try again.`
          );
          handled.current = false;
          return;
        }

        if (!data.success || !data.access_token || !data.user) {
          setError(
            [data.error, data.hint].filter(Boolean).join(" ") ||
              "Sign-in failed. Try again."
          );
          handled.current = false;
          return;
        }

        await finishAuth({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          user: data.user,
        });
      } catch {
        setError(
          "Could not reach /api/auth/verify. Make sure `npm run dev` is running in the site folder."
        );
        handled.current = false;
      }
    },
    [finishAuth]
  );

  useEffect(() => {
    if (!clientId) {
      setError(
        "Google sign-in is not configured (missing NEXT_PUBLIC_GOOGLE_CLIENT_ID)."
      );
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 100;

    function mountButton() {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current)
        return false;

      const existing = localStorage.getItem("fotoro_access_token");
      if (existing) return true;

      window.google.accounts.id.initialize({
        client_id: clientId!,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
        itp_support: true,
      });

      buttonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 320,
        logo_alignment: "left",
      });

      window.google.accounts.id.prompt();
      setReady(true);
      return true;
    }

    if (mountButton()) return;

    const interval = setInterval(() => {
      attempts++;
      if (mountButton() || attempts >= maxAttempts) {
        clearInterval(interval);
        if (!cancelled && attempts >= maxAttempts && !ready) {
          setError(
            "Google sign-in failed to load. Check your connection and refresh."
          );
        }
      }
    }, 100);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [clientId, handleCredentialResponse, ready]);

  return (
    <div className="space-y-3">
      <div
        ref={buttonRef}
        className="flex min-h-[44px] items-center justify-center"
        aria-label="Sign in with Google"
      />

      {!ready && clientId && !error ? (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Loading Google sign-in…
        </div>
      ) : null}

      {!clientId ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled
        >
          <GoogleIcon className="size-4" />
          Continue with Google
        </Button>
      ) : null}

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** @deprecated Use GoogleSignIn */
export const GoogleOneTap = GoogleSignIn;

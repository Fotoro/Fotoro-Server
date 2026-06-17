"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/site/oauth-icons";
import { buildAuthCallbackUrl } from "@/lib/auth-finish";
import { createBrowserClient } from "@/lib/supabase/browser";

export function GoogleOAuthSignIn() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setError(null);
    setPending(true);

    try {
      const supabase = createBrowserClient();
      const redirectTo = buildAuthCallbackUrl();

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (oauthError) {
        setError(oauthError.message);
        setPending(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setError("Could not start Google sign-in.");
      setPending(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => void signInWithGoogle()}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GoogleIcon className="size-4" />
        )}
        Continue with Google
      </Button>

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}

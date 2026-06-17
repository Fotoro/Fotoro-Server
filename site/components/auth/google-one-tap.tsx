"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { setStoredSession } from "@/lib/fotoro-session";

interface GoogleOneTapProps {
  onSuccess?: (token: string) => void;
  redirectTo?: string;
}

export function GoogleOneTap({
  onSuccess,
  redirectTo = "/dashboard",
}: GoogleOneTapProps) {
  const router = useRouter();
  const handled = useRef(false);

  const handleCredentialResponse = useCallback(
    async (response: google.accounts.id.CredentialResponse) => {
      if (handled.current) return;
      handled.current = true;

      const credential = response.credential;
      if (!credential) return;

      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        });
        const data = await res.json();

        if (!data.success || !data.access_token) {
          handled.current = false;
          return;
        }

        setStoredSession(data.access_token, data.user);
        onSuccess?.(data.access_token);
        router.push(redirectTo);
      } catch {
        handled.current = false;
      }
    },
    [onSuccess, redirectTo, router]
  );

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    function init() {
      if (!window.google?.accounts?.id || !clientId) return;

      const existing = localStorage.getItem("fotoro_access_token");
      if (existing) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
        itp_support: true,
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason();
          if (reason !== "suppressed_by_user") {
            // Render fallback button if One Tap unavailable
            const el = document.getElementById("g_id_signin");
            if (el && window.google?.accounts?.id) {
              window.google.accounts.id.renderButton(el, {
                type: "standard",
                theme: "filled_black",
                size: "large",
                shape: "pill",
                text: "continue_with",
                width: 320,
              });
            }
          }
        }
      });
    }

    if (window.google?.accounts?.id) {
      init();
      return;
    }

    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(interval);
        init();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [handleCredentialResponse]);

  return null;
}

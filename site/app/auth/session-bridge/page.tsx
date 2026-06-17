"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { setStoredSession } from "@/lib/fotoro-session";

/** Sync Supabase cookie session → localStorage for the dashboard. */
export default function SessionBridgePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function sync() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setError(sessionError?.message ?? "No session found.");
          return;
        }

        const meta = session.user.user_metadata ?? {};
        setStoredSession(
          session.access_token,
          {
            id: session.user.id,
            email: session.user.email ?? "",
            name:
              (meta.full_name as string | undefined) ??
              (meta.name as string | undefined) ??
              session.user.email ??
              "",
            avatar_url: meta.avatar_url as string | undefined,
            picture: meta.avatar_url as string | undefined,
          },
          session.refresh_token
        );

        router.replace("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load session.");
      }
    }

    void sync();
  }, [router]);

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5">
        <p className="max-w-md rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive-foreground">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
      <p className="text-sm">Completing sign-in…</p>
    </main>
  );
}

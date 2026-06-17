import type { Session } from "@supabase/supabase-js";
import { completeCliHandoff, getCliHandoffContext } from "@/lib/cli-handoff";
import { setStoredSession } from "@/lib/fotoro-session";

export type AuthFinishResult = "redirect" | "poll" | "none";

export function buildAuthCallbackUrl(): string {
  if (typeof window === "undefined") {
    return "/auth/callback";
  }

  const url = new URL(`${window.location.origin}/auth/callback`);
  const ctx = getCliHandoffContext();

  if (ctx?.state) {
    url.searchParams.set("state", ctx.state);
    url.searchParams.set("cli", "1");
  }

  return url.toString();
}

export async function finishAuthFromSupabaseSession(
  session: Session
): Promise<AuthFinishResult> {
  const user = session.user;
  const meta = user.user_metadata ?? {};

  setStoredSession(
    session.access_token,
    {
      id: user.id,
      email: user.email ?? "",
      name:
        (meta.full_name as string | undefined) ??
        (meta.name as string | undefined) ??
        user.email ??
        "",
      avatar_url: meta.avatar_url as string | undefined,
      picture: meta.avatar_url as string | undefined,
    },
    session.refresh_token
  );

  return completeCliHandoff({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    user_id: user.id,
    email: user.email ?? "",
    name:
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      user.email ??
      "",
  });
}

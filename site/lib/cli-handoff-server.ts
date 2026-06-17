import type { Session } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { type CliSessionPayload } from "@/lib/cli-handoff";

export function sessionToCliPayload(session: Session): CliSessionPayload {
  const meta = session.user.user_metadata ?? {};
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    user_id: session.user.id,
    email: session.user.email ?? "",
    name:
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      session.user.email ??
      "",
  };
}

/**
 * Server-side CLI handoff after OAuth code exchange.
 * Always writes tokens to Supabase for CLI polling — never redirects the browser
 * to localhost (the CLI may not be listening when OAuth completes).
 */
export async function resolveCliHandoffRedirect(
  session: Session,
  cliState: string,
  _redirectUri: string | null | undefined,
  origin: string
): Promise<string> {
  const payload = sessionToCliPayload(session);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("cli_auth_sessions")
    .update({
      access_token: payload.access_token,
      refresh_token: payload.refresh_token,
      user_id: payload.user_id,
      email: payload.email,
      name: payload.name,
      completed_at: new Date().toISOString(),
    })
    .eq("state", cliState)
    .select("state")
    .maybeSingle();

  if (error || !data) {
    return `${origin}/login?error=${encodeURIComponent(
      error?.message ??
        "No pending CLI session for this state. Run fotoro login again."
    )}`;
  }

  return `${origin}/login?cli=complete`;
}

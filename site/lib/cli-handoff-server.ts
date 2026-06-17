import type { Session } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildLocalCallbackUrl,
  isAllowedCliRedirect,
  type CliSessionPayload,
} from "@/lib/cli-handoff";

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
 * Returns the URL to redirect the browser to.
 */
export async function resolveCliHandoffRedirect(
  session: Session,
  cliState: string,
  redirectUri: string | null | undefined,
  origin: string
): Promise<string> {
  const payload = sessionToCliPayload(session);

  if (redirectUri && isAllowedCliRedirect(redirectUri)) {
    return buildLocalCallbackUrl(redirectUri, cliState, payload).toString();
  }

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

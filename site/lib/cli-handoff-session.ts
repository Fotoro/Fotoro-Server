import {
  completeCliHandoff,
  getCliHandoffContext,
  isCliAuthFlow,
} from "@/lib/cli-handoff";
import {
  getStoredRefreshToken,
  getStoredToken,
  getStoredUser,
} from "@/lib/fotoro-session";

export type CliHandoffAttempt = "redirect" | "poll" | "none" | "missing_refresh";

function sessionPayload(refreshToken: string) {
  const token = getStoredToken()!;
  const user = getStoredUser()!;
  return {
    access_token: token,
    refresh_token: refreshToken,
    user_id: user.id,
    email: user.email,
    name: user.name,
  };
}

/** Hand off an existing browser session to the CLI (login page / dashboard). */
export async function finishAuthForCli(): Promise<CliHandoffAttempt> {
  if (!isCliAuthFlow()) return "none";

  const token = getStoredToken();
  const user = getStoredUser();
  if (!token || !user) return "none";

  const refresh = getStoredRefreshToken() ?? "";

  return completeCliHandoff(sessionPayload(refresh));
}

/** Immediate CLI handoff when token + user already exist (login boot). */
export async function handoffExistingSessionForCli(): Promise<
  "redirect" | "poll" | "none"
> {
  const ctx = getCliHandoffContext();
  if (!ctx) return "none";

  const token = getStoredToken();
  const user = getStoredUser();
  if (!token || !user) return "none";

  return completeCliHandoff(sessionPayload(getStoredRefreshToken() ?? ""));
}

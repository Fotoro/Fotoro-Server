import { completeCliHandoff, isCliAuthFlow } from "@/lib/cli-handoff";
import {
  getStoredRefreshToken,
  getStoredToken,
  getStoredUser,
} from "@/lib/fotoro-session";

export type CliHandoffAttempt = "redirect" | "poll" | "none" | "missing_refresh";

/** Hand off an existing browser session to the CLI (login page / dashboard). */
export async function finishAuthForCli(): Promise<CliHandoffAttempt> {
  if (!isCliAuthFlow()) return "none";

  const token = getStoredToken();
  const user = getStoredUser();
  const refresh = getStoredRefreshToken();

  if (!token || !user) return "none";
  if (!refresh) return "missing_refresh";

  const result = await completeCliHandoff({
    access_token: token,
    refresh_token: refresh,
    user_id: user.id,
    email: user.email,
    name: user.name,
  });

  return result;
}

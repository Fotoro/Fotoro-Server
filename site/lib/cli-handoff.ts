/**
 * CLI browser login handoff.
 * CLI opens /login?redirect_uri=http://127.0.0.1:8765/auth/callback&state=...&cli=1
 */

export const CLI_COOKIE_STATE = "fotoro_cli_state";
export const CLI_COOKIE_REDIRECT = "fotoro_redirect_uri";
export const CLI_COOKIE_FLAG = "fotoro_cli";
const CLI_COOKIE_MAX_AGE = 900; // 15 min

const STATE_KEY = "fotoro_cli_state";
const REDIRECT_KEY = "fotoro_redirect_uri";
const CLI_FLAG_KEY = "fotoro_cli";

export interface CliHandoffContext {
  state: string;
  redirectUri: string | null;
  isCli: boolean;
}

export interface CliSessionPayload {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
  name: string;
}

function cookieOpts() {
  return `path=/; max-age=${CLI_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function persistCliContextToCookies(ctx: CliHandoffContext) {
  if (typeof document === "undefined") return;
  document.cookie = `${CLI_COOKIE_STATE}=${encodeURIComponent(ctx.state)}; ${cookieOpts()}`;
  if (ctx.redirectUri) {
    document.cookie = `${CLI_COOKIE_REDIRECT}=${encodeURIComponent(ctx.redirectUri)}; ${cookieOpts()}`;
  }
  if (ctx.isCli) {
    document.cookie = `${CLI_COOKIE_FLAG}=1; ${cookieOpts()}`;
  }
}

export function clearCliContextCookies() {
  if (typeof document === "undefined") return;
  const expired = "path=/; max-age=0; SameSite=Lax";
  document.cookie = `${CLI_COOKIE_STATE}=; ${expired}`;
  document.cookie = `${CLI_COOKIE_REDIRECT}=; ${expired}`;
  document.cookie = `${CLI_COOKIE_FLAG}=; ${expired}`;
}

export function captureCliParamsFromSearchParams(
  params: URLSearchParams
): CliHandoffContext | null {
  if (typeof window === "undefined") return null;

  const state = params.get("state");
  const redirectUri = params.get("redirect_uri");
  const cli = params.get("cli");

  if (state) {
    sessionStorage.setItem(STATE_KEY, state);
    sessionStorage.setItem(REDIRECT_KEY, redirectUri ?? "");
    if (cli) sessionStorage.setItem(CLI_FLAG_KEY, cli);

    const ctx: CliHandoffContext = {
      state,
      redirectUri: redirectUri || null,
      isCli: cli === "1",
    };
    persistCliContextToCookies(ctx);
    return ctx;
  }

  return getCliHandoffContext();
}

export function getCliHandoffContext(): CliHandoffContext | null {
  if (typeof window === "undefined") return null;

  const state = sessionStorage.getItem(STATE_KEY);
  if (!state) return null;

  const redirectUri = sessionStorage.getItem(REDIRECT_KEY);
  return {
    state,
    redirectUri: redirectUri || null,
    isCli: sessionStorage.getItem(CLI_FLAG_KEY) === "1",
  };
}

export function isCliAuthFlow(): boolean {
  return getCliHandoffContext() !== null;
}

export function clearCliHandoffContext() {
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(REDIRECT_KEY);
  sessionStorage.removeItem(CLI_FLAG_KEY);
  clearCliContextCookies();
}

/** Only allow loopback callbacks — never redirect tokens to external hosts. */
export function isAllowedCliRedirect(uri: string): boolean {
  try {
    const url = new URL(uri);
    const host = url.hostname.toLowerCase();
    if (host !== "127.0.0.1" && host !== "localhost" && host !== "::1") {
      return false;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }
    return (
      url.pathname === "/auth/callback" ||
      url.pathname.endsWith("/auth/callback")
    );
  } catch {
    return false;
  }
}

export function buildLocalCallbackUrl(
  redirectUri: string,
  state: string,
  session: CliSessionPayload
): URL {
  const url = new URL(redirectUri);
  url.searchParams.set("access_token", session.access_token);
  url.searchParams.set("refresh_token", session.refresh_token);
  url.searchParams.set("state", state);
  url.searchParams.set("user_id", session.user_id);
  url.searchParams.set("email", session.email);
  url.searchParams.set("name", session.name);
  url.searchParams.set("cli", "1");
  return url;
}

export type CliHandoffResult = "redirect" | "poll" | "none";

/**
 * Complete CLI auth: redirect to local callback (preferred) or write tokens to Supabase for polling.
 */
export async function completeCliHandoff(
  session: CliSessionPayload
): Promise<CliHandoffResult> {
  const ctx = getCliHandoffContext();
  if (!ctx?.state) return "none";

  if (ctx.redirectUri && isAllowedCliRedirect(ctx.redirectUri)) {
    const target = buildLocalCallbackUrl(ctx.redirectUri, ctx.state, session);
    clearCliHandoffContext();
    window.location.href = target.toString();
    return "redirect";
  }

  const res = await fetch("/api/auth/cli-handoff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      state: ctx.state,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user_id: session.user_id,
      email: session.email,
      name: session.name,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as { error?: string }).error ?? "CLI handoff failed"
    );
  }

  clearCliHandoffContext();
  return "poll";
}

export interface FotoroUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  avatar_url?: string;
}

const TOKEN_KEY = "fotoro_access_token";
const REFRESH_KEY = "fotoro_refresh_token";
const USER_KEY = "fotoro_user";

export function getStoredUser(): FotoroUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FotoroUser;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setStoredSession(
  token: string,
  user: FotoroUser,
  refreshToken?: string
) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

function tokenExpiringSoon(jwt: string, leewaySec = 90): boolean {
  try {
    const b64 = jwt.split(".")[1];
    if (!b64) return true;
    const padded = b64.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(padded)) as { exp?: number };
    if (!json.exp) return false;
    return Math.floor(Date.now() / 1000) >= json.exp - leewaySec;
  } catch {
    return true;
  }
}

/** Refresh Supabase session when access token is expired — fixes "exp claim" relay errors. */
export async function getValidAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return getStoredToken();

  const access = getStoredToken();
  const refresh = getStoredRefreshToken();
  if (!access && !refresh) return null;

  if (access && !tokenExpiringSoon(access)) {
    return access;
  }

  if (!refresh) {
    clearAuth();
    return null;
  }

  try {
    const { createBrowserSupabaseClient } = await import("@/lib/supabase/browser");
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refresh,
    });

    if (error || !data.session) {
      clearAuth();
      return null;
    }

    const meta = data.session.user.user_metadata ?? {};
    const user: FotoroUser = {
      id: data.session.user.id,
      email: data.session.user.email ?? "",
      name:
        (meta.full_name as string | undefined) ??
        (meta.name as string | undefined) ??
        data.session.user.email ??
        "",
      avatar_url: meta.avatar_url as string | undefined,
      picture: (meta.avatar_url as string | undefined) ?? (meta.picture as string | undefined),
    };

    setStoredSession(
      data.session.access_token,
      user,
      data.session.refresh_token
    );
    return data.session.access_token;
  } catch {
    clearAuth();
    return null;
  }
}

/** Sync httpOnly cookie so <img> tags can load /api/fotoro thumbs without blob fetch. */
export async function syncProxyCookie(token: string): Promise<void> {
  await fetch("/api/fotoro/cookie", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

export async function clearProxyCookie(): Promise<void> {
  await fetch("/api/fotoro/cookie", { method: "DELETE" }).catch(() => {});
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

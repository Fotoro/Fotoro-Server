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

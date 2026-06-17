export interface FotoroUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  avatar_url?: string;
}

const TOKEN_KEY = "fotoro_access_token";
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

export function setStoredSession(token: string, user: FotoroUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

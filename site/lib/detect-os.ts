import type { Platform } from "@/lib/constants";

export function detectPlatform(userAgent?: string): Platform {
  const ua = (userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "")).toLowerCase();
  if (!ua) return "unknown";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  if (/mac os|macintosh/.test(ua)) return "macos";
  if (/windows/.test(ua)) return "windows";
  if (/linux|x11|cros/.test(ua)) return "linux";
  return "unknown";
}

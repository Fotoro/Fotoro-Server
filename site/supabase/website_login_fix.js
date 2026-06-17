/**
 * CLI login fixes — reference for fotoro.vercel.app
 * See site/app/login/login-form.tsx and components/auth/google-oauth-sign-in.tsx
 *
 * Fixed:
 * - Infinite "Loading Google sign-in…" when token exists (google-one-tap setReady)
 * - CLI handoff without waiting for Google button (login-form boot)
 * - ?reauth=1 clears stale localStorage session
 * - Supabase OAuth replaces GSI on login (no origin issues on Vercel)
 */

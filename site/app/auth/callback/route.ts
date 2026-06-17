import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  CLI_COOKIE_REDIRECT,
  CLI_COOKIE_STATE,
} from "@/lib/cli-handoff";
import { resolveCliHandoffRedirect } from "@/lib/cli-handoff-server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const cli = requestUrl.searchParams.get("cli");
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll can throw when called from a context that cannot mutate cookies
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message ?? "auth_failed")}`
    );
  }

  const session = data.session;
  const cliState =
    state ?? cookieStore.get(CLI_COOKIE_STATE)?.value ?? undefined;
  const redirectUri =
    cookieStore.get(CLI_COOKIE_REDIRECT)?.value ?? undefined;

  let redirectTo: string;

  if (cli === "1" && cliState) {
    redirectTo = await resolveCliHandoffRedirect(
      session,
      cliState,
      redirectUri,
      origin
    );
  } else {
    redirectTo = `${origin}/auth/session-bridge`;
  }

  const response = NextResponse.redirect(redirectTo);

  // Ensure Supabase auth cookies are on the redirect response
  cookieStore.getAll().forEach(({ name, value }) => {
    if (name.startsWith("sb-")) {
      response.cookies.set(name, value);
    }
  });

  // Clear CLI context cookies after handoff
  if (cli === "1" && cliState) {
    response.cookies.set(CLI_COOKIE_STATE, "", { maxAge: 0, path: "/" });
    response.cookies.set(CLI_COOKIE_REDIRECT, "", { maxAge: 0, path: "/" });
  }

  return response;
}

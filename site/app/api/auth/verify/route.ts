import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();
    if (!credential) {
      return NextResponse.json(
        { success: false, error: "Missing credential" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: credential,
    });

    if (error || !data.user || !data.session) {
      return NextResponse.json(
        { success: false, error: error?.message ?? "Authentication failed" },
        { status: 401 }
      );
    }

    const { user, session } = data;

    await supabase.from("users").upsert(
      {
        id: user.id,
        email: user.email ?? "",
        name: user.user_metadata?.full_name ?? user.email ?? "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    return NextResponse.json({
      success: true,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name ?? user.email,
        avatar_url: user.user_metadata?.avatar_url,
        picture: user.user_metadata?.avatar_url,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

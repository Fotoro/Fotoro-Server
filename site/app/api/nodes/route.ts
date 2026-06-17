import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySupabaseToken } from "@/lib/auth-verify";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const claims = await verifySupabaseToken(token);
    const userId = claims.sub as string;

    const body = await request.json();
    const { tailscale_ip, tailnet_name, magic_dns, node_name, status } = body;

    if (!tailscale_ip) {
      return NextResponse.json({ error: "Missing tailscale_ip" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("nodes")
      .upsert(
        {
          user_id: userId,
          tailscale_ip,
          tailnet_name: tailnet_name || null,
          magic_dns: magic_dns || null,
          node_name: node_name || "fotoro-server",
          status: status || "online",
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, node: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Node registration error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const claims = await verifySupabaseToken(token);
    const userId = claims.sub as string;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("nodes")
      .select("*")
      .eq("user_id", userId)
      .order("last_seen", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ node: data ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Node fetch error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

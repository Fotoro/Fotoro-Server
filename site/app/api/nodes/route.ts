import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySupabaseToken } from "@/lib/auth-verify";

type EndpointEnvelope = {
  version: 1;
  algorithm: "A256GCM";
  nonce: string;
  ciphertext: string;
};

function parseEnvelope(value: unknown): EndpointEnvelope | null {
  let parsed = value;
  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed); } catch { return null; }
  }
  if (!parsed || typeof parsed !== "object") return null;
  const candidate = parsed as Record<string, unknown>;
  if (
    candidate.version !== 1 || candidate.algorithm !== "A256GCM" ||
    typeof candidate.nonce !== "string" || !/^[A-Za-z0-9_-]{16}$/.test(candidate.nonce) ||
    typeof candidate.ciphertext !== "string" || !/^[A-Za-z0-9_-]{22,5500}$/.test(candidate.ciphertext)
  ) return null;
  return {
    version: 1,
    algorithm: "A256GCM",
    nonce: candidate.nonce,
    ciphertext: candidate.ciphertext,
  };
}

async function ensureUserProfile(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  email: string,
  name: string | null
) {
  const { error } = await supabase.from("users").upsert(
    { id: userId, email: email || "unknown@fotoro.local", name, updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );
  if (error) console.warn("User profile upsert:", error.message);
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = await verifySupabaseToken(authHeader.slice(7));
    const userId = String(claims.sub ?? "");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const email = typeof claims.email === "string" ? claims.email : "";
    const meta = claims.user_metadata as Record<string, unknown> | undefined;
    const name = typeof meta?.full_name === "string" ? meta.full_name : typeof meta?.name === "string" ? meta.name : null;
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid node sync body" }, { status: 400 });
    }

    // Refuse legacy clients rather than accepting a cleartext route, even briefly.
    if (["tailscale_ip", "tailnet_name", "magic_dns", "public_url", "tailnet_url"].some((key) => key in body)) {
      return NextResponse.json({ error: "Update the Linux host before syncing; endpoint details must be encrypted locally." }, { status: 400 });
    }
    const envelope = parseEnvelope(body.endpoint_ciphertext);
    if (!envelope) return NextResponse.json({ error: "Missing or invalid encrypted endpoint envelope" }, { status: 400 });

    const nodeName = typeof body.node_name === "string" ? body.node_name.trim().slice(0, 128) : "fotoro-server";
    const status = body.status === "offline" || body.status === "error" ? body.status : "online";
    const supabase = createAdminClient();
    await ensureUserProfile(supabase, userId, email, name);

    const now = new Date().toISOString();
    const row = {
      user_id: userId,
      tailscale_ip: null,
      tailnet_name: null,
      magic_dns: null,
      node_name: nodeName || "fotoro-server",
      status,
      public_url: null,
      tailnet_url: null,
      endpoint_ciphertext: JSON.stringify(envelope),
      last_seen: now,
      updated_at: now,
    };
    const { data: existing, error: selectError } = await supabase.from("nodes")
      .select("id").eq("user_id", userId).maybeSingle();
    if (selectError) return NextResponse.json({ error: selectError.message }, { status: 500 });

    const result = existing
      ? await supabase.from("nodes").update(row).eq("user_id", userId).select("id").single()
      : await supabase.from("nodes").insert(row).select("id").single();
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });

    return NextResponse.json({ success: true, node_id: result.data.id }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Node registration error:", error);
    return NextResponse.json({ error: message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const claims = await verifySupabaseToken(authHeader.slice(7));
    const userId = String(claims.sub ?? "");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createAdminClient();
    const { data, error } = await supabase.from("nodes")
      .select("node_name, status, last_seen, endpoint_ciphertext")
      .eq("user_id", userId).order("last_seen", { ascending: false }).limit(1).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      node: data ? {
        node_name: data.node_name ?? "fotoro-server",
        status: data.status ?? "unknown",
        last_seen: data.last_seen ?? null,
        endpoint_envelope: parseEnvelope(data.endpoint_ciphertext),
      } : null,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Node fetch error:", error);
    return NextResponse.json({ error: message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

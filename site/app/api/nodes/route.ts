import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySupabaseToken } from "@/lib/auth-verify";
import { getNodeBaseUrl, normalizeFotoroServerUrl } from "@/lib/fotoro-url";

/** Never expose raw Tailscale IP to the browser — funnel URL only. */
function sanitizeNodeForClient(node: Record<string, unknown> | null) {
  if (!node) return null;
  const { tailscale_ip: _ip, ...safe } = node;
  if (typeof safe.public_url === "string") {
    safe.public_url = normalizeFotoroServerUrl(safe.public_url);
  }
  if (typeof safe.tailnet_url === "string") {
    safe.tailnet_url = normalizeFotoroServerUrl(safe.tailnet_url);
  }
  return safe;
}

async function probeFunnelLive(
  baseUrl: string,
  bearerToken: string
): Promise<{ live: boolean; error?: string }> {
  const url = normalizeFotoroServerUrl(baseUrl);
  try {
    const res = await fetch(`${url}/status`, {
      headers: { Authorization: `Bearer ${bearerToken}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        live: false,
        error: `Funnel returned ${res.status}${text ? `: ${text.slice(0, 80)}` : ""}`,
      };
    }
    const data = (await res.json()) as { status?: string };
    return { live: data.status === "online" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unreachable";
    return {
      live: false,
      error: `Cannot reach funnel (${msg}). Run ./fotoro server and check: sudo tailscale funnel status`,
    };
  }
}

type NodeRow = {
  user_id: string;
  tailscale_ip: string;
  tailnet_name: string | null;
  magic_dns: string | null;
  node_name: string;
  status: string;
  public_url: string | null;
  tailnet_url: string | null;
  last_seen: string;
  updated_at: string;
};

async function ensureUserProfile(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  email: string,
  name: string | null
) {
  const { error } = await supabase.from("users").upsert(
    {
      id: userId,
      email: email || "unknown@fotoro.local",
      name,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) {
    console.warn("User profile upsert:", error.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const claims = await verifySupabaseToken(token);
    const userId = claims.sub as string;
    const email = (claims.email as string | undefined) ?? "";
    const meta = claims.user_metadata as Record<string, unknown> | undefined;
    const name =
      (meta?.full_name as string | undefined) ??
      (meta?.name as string | undefined) ??
      null;

    const body = await request.json();
    const {
      tailscale_ip,
      tailnet_name,
      magic_dns,
      node_name,
      status,
      public_url,
      tailnet_url,
    } = body;

    if (!tailscale_ip) {
      return NextResponse.json({ error: "Missing tailscale_ip" }, { status: 400 });
    }

    const supabase = createAdminClient();
    await ensureUserProfile(supabase, userId, email, name);

    const now = new Date().toISOString();
    const row: NodeRow = {
      user_id: userId,
      tailscale_ip,
      tailnet_name: tailnet_name || null,
      magic_dns: magic_dns || null,
      node_name: node_name || "fotoro-server",
      status: status || "online",
      public_url: public_url ? normalizeFotoroServerUrl(public_url) : null,
      tailnet_url: tailnet_url ? normalizeFotoroServerUrl(tailnet_url) : null,
      last_seen: now,
      updated_at: now,
    };

    const { data: existing, error: selectError } = await supabase
      .from("nodes")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    let data;
    let error;

    if (existing) {
      ({ data, error } = await supabase
        .from("nodes")
        .update(row)
        .eq("user_id", userId)
        .select()
        .single());
    } else {
      ({ data, error } = await supabase.from("nodes").insert(row).select().single());
    }

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

    const safe = sanitizeNodeForClient(data);
    if (safe) {
      const base = getNodeBaseUrl(
        safe as { public_url?: string; tailnet_url?: string; magic_dns?: string }
      );
      if (base) {
        const probe = await probeFunnelLive(base, token);
        safe.live = probe.live;
        if (!probe.live && probe.error) {
          safe.connect_error = probe.error;
        }
      } else {
        safe.connect_error = "No funnel URL in database — run ./fotoro server";
      }
    }

    return NextResponse.json({ node: safe ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Node fetch error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

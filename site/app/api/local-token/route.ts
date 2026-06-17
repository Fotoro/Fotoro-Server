import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySupabaseToken } from "@/lib/auth-verify";

const LOCAL_TOKEN_TTL = "5m";

function getLocalTokenSecret(): Uint8Array | null {
  const secret =
    process.env.FOTORO_LOCAL_TOKEN_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_KEY?.trim()?.slice(0, 32);
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = getLocalTokenSecret();
    if (!secret) {
      return NextResponse.json(
        { error: "FOTORO_LOCAL_TOKEN_SECRET not configured" },
        { status: 500 }
      );
    }

    const supabaseToken = authHeader.slice(7);
    const claims = await verifySupabaseToken(supabaseToken);
    const userId = claims.sub as string;

    const supabase = createAdminClient();
    const { data: node, error: nodeError } = await supabase
      .from("nodes")
      .select("public_url, tailnet_url, node_name, status")
      .eq("user_id", userId)
      .order("last_seen", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (nodeError) {
      return NextResponse.json({ error: nodeError.message }, { status: 500 });
    }
    if (!node) {
      return NextResponse.json(
        { error: "No server registered — run ./fotoro setup on your machine" },
        { status: 404 }
      );
    }

    const baseUrl = (node.public_url || node.tailnet_url || "").replace(/\/$/, "");
    if (!baseUrl) {
      return NextResponse.json(
        { error: "Server has no public URL yet — start ./fotoro server" },
        { status: 503 }
      );
    }

    const localToken = await new SignJWT({ sub: userId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(LOCAL_TOKEN_TTL)
      .sign(secret);

    return NextResponse.json({
      local_token: localToken,
      expires_in: 300,
      base_url: baseUrl,
      node_name: node.node_name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { createRemoteJWKSet, jwtVerify } from "jose";
import { getSupabaseProjectUrl } from "@/lib/supabase/admin";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!jwks) {
    const url = getSupabaseProjectUrl();
    if (!url) throw new Error("Missing Supabase URL");
    jwks = createRemoteJWKSet(
      new URL(`${url}/auth/v1/.well-known/jwks.json`)
    );
  }
  return jwks;
}

export async function verifySupabaseToken(token: string) {
  const url = getSupabaseProjectUrl();
  const { payload } = await jwtVerify(token, getJwks(), {
    issuer: `${url}/auth/v1`,
    clockTolerance: 60,
  });
  return payload;
}

import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    ""
  );
}

function getServiceKey() {
  return process.env.SUPABASE_SERVICE_KEY ?? "";
}

export function createAdminClient() {
  const url = getSupabaseUrl();
  const key = getServiceKey();
  if (!url || !key) {
    throw new Error("Missing Supabase admin credentials");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getSupabaseProjectUrl() {
  return getSupabaseUrl();
}

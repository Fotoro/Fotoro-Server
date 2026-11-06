-- Apply before deploying the encrypted endpoint-sync client.
-- The migration is safe to re-run. It removes legacy route columns entirely,
-- so the database schema cannot accept new plaintext endpoint values.
alter table public.nodes
  add column if not exists endpoint_ciphertext text;

alter table public.nodes
  drop column if exists tailscale_ip,
  drop column if exists tailnet_name,
  drop column if exists magic_dns,
  drop column if exists public_url,
  drop column if exists tailnet_url;

-- Node writes go through the authenticated website API using its server key.
-- Ordinary account sessions may read their own envelope but cannot replace it
-- with arbitrary cleartext through the Supabase REST endpoint.
drop policy if exists "Users can insert own nodes" on public.nodes;
drop policy if exists "Users can update own nodes" on public.nodes;

-- Backups and point-in-time history may retain removed values until expiry.

-- Apply before deploying the encrypted endpoint-sync client.
-- Run `./fotoro nodesync` on each host after this migration. That writes the
-- authenticated ciphertext generated locally by the host.
alter table public.nodes
  alter column tailscale_ip drop not null,
  add column if not exists endpoint_ciphertext text;

-- Remove existing cleartext routes from the live table. Supabase backups and
-- point-in-time history may retain older values until their retention expires.
update public.nodes
set tailscale_ip = null,
    tailnet_name = null,
    magic_dns = null,
    public_url = null,
    tailnet_url = null,
    updated_at = now();

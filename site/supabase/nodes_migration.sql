-- Run in Supabase SQL Editor if node sync fails with ON CONFLICT errors

-- Ensure one node row per user
alter table public.nodes
  drop constraint if exists nodes_user_id_key;

alter table public.nodes
  add constraint nodes_user_id_key unique (user_id);

-- Public / tailnet URLs pushed from the CLI after Tailscale setup
alter table public.nodes
  add column if not exists public_url text;

alter table public.nodes
  add column if not exists tailnet_url text;

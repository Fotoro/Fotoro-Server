-- Run in Supabase SQL Editor if node sync fails with ON CONFLICT errors

-- Ensure one node row per user
alter table public.nodes
  drop constraint if exists nodes_user_id_key;

alter table public.nodes
  add constraint nodes_user_id_key unique (user_id);

-- Endpoint routes are stored only as endpoint_ciphertext. Do not add
-- public_url or tailnet_url columns; those values must remain encrypted.

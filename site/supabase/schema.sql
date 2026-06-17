-- Run in Supabase SQL Editor

create table if not exists public.users (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    name text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.nodes (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users(id) on delete cascade not null unique,
    tailscale_ip text not null,
    tailnet_name text,
    magic_dns text,
    node_name text default 'fotoro-server',
    public_url text,
    tailnet_url text,
    status text default 'offline' check (status in ('online', 'offline', 'error')),
    last_seen timestamptz default now(),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.nodes enable row level security;

create policy "Users can read own profile"
    on public.users for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.users for update
    using (auth.uid() = id);

create policy "Users can read own nodes"
    on public.nodes for select
    using (auth.uid() = user_id);

create policy "Users can insert own nodes"
    on public.nodes for insert
    with check (auth.uid() = user_id);

create policy "Users can update own nodes"
    on public.nodes for update
    using (auth.uid() = user_id);

-- Function to update node heartbeat
create or replace function log_node_heartbeat(node_uuid uuid)
returns void as $$
begin
    update public.nodes
    set last_seen = now(), status = 'online'
    where id = node_uuid;
end;
$$ language plpgsql security definer;

-- CLI auth handoff (see supabase/cli_auth_sessions.sql for full migration)

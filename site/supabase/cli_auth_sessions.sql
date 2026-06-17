-- CLI auth handoff: website writes tokens after login; CLI polls by state.
-- Run once in Supabase → SQL Editor.

create table if not exists public.cli_auth_sessions (
    state text primary key,
    access_token text,
    refresh_token text,
    user_id uuid,
    email text,
    name text,
    completed_at timestamptz,
    expires_at timestamptz not null default (now() + interval '15 minutes'),
    created_at timestamptz default now()
);

create index if not exists cli_auth_sessions_expires_at_idx
    on public.cli_auth_sessions (expires_at);

alter table public.cli_auth_sessions enable row level security;

-- No public policies: only service_role (website API) may read/write.
-- CLI polls via its own backend using service credentials.

comment on table public.cli_auth_sessions is
    'Short-lived OAuth handoff rows. CLI inserts state; website fills tokens after browser login.';

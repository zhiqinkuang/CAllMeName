-- CallMeMing MVP schema (design.md §3)
-- Apply with Supabase CLI or SQL editor. Service role used by server; anon blocked via RLS.

create extension if not exists "pgcrypto";

-- 3.1 free_rate_limit_events
create table if not exists public.free_rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists free_rate_limit_events_ip_hash_created_at_idx
  on public.free_rate_limit_events (ip_hash, created_at desc);

-- 3.2 orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  status text not null,
  english_name text not null,
  gender_preference text not null,
  desired_feeling text not null,
  amount_usd numeric(10,2) not null default 6.99,
  currency text not null default 'USD',
  waffo_session_id text,
  waffo_checkout_url text,
  waffo_expires_at timestamptz,
  waffo_order_id text,
  waffo_payment_id text,
  buyer_email text,
  result_token_hash text not null,
  result_expires_at timestamptz not null,
  fulfilled_at timestamptz,
  email_sent_at timestamptz,
  email_error text,
  failure_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_status_check check (
    status in (
      'created','awaiting_payment','expired','paid','fulfilling','ready','failed','refunded'
    )
  ),
  constraint orders_gender_check check (
    gender_preference in ('feminine','masculine','neutral')
  ),
  constraint orders_feeling_check check (
    desired_feeling in ('friendly','calm','bright','elegant','modern','scholarly')
  )
);

create unique index if not exists orders_result_token_hash_uidx
  on public.orders (result_token_hash);
create index if not exists orders_waffo_order_id_idx
  on public.orders (waffo_order_id);
create index if not exists orders_status_idx on public.orders (status);

-- 3.3 name_cards (paid only)
create table if not exists public.name_cards (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  rank smallint not null,
  hanzi text not null,
  pinyin text not null,
  phonetic_hint text not null,
  why_it_fits_you text not null,
  self_introduction text not null,
  audio_url text,
  created_at timestamptz not null default now(),
  constraint name_cards_rank_check check (rank between 1 and 3),
  constraint name_cards_order_rank_uidx unique (order_id, rank)
);

create index if not exists name_cards_order_id_idx on public.name_cards (order_id);

-- 3.4 webhook_events
create table if not exists public.webhook_events (
  event_type text not null,
  event_id text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  primary key (event_type, event_id)
);

-- RLS: enable and deny anon/authenticated direct access; service role bypasses RLS.
alter table public.free_rate_limit_events enable row level security;
alter table public.orders enable row level security;
alter table public.name_cards enable row level security;
alter table public.webhook_events enable row level security;

-- No policies for anon/authenticated → deny all for those roles.
-- Explicit deny policies for clarity (optional but documented):
drop policy if exists deny_all_anon_free_rate on public.free_rate_limit_events;
create policy deny_all_anon_free_rate on public.free_rate_limit_events
  for all to anon, authenticated using (false) with check (false);

drop policy if exists deny_all_anon_orders on public.orders;
create policy deny_all_anon_orders on public.orders
  for all to anon, authenticated using (false) with check (false);

drop policy if exists deny_all_anon_name_cards on public.name_cards;
create policy deny_all_anon_name_cards on public.name_cards
  for all to anon, authenticated using (false) with check (false);

drop policy if exists deny_all_anon_webhook_events on public.webhook_events;
create policy deny_all_anon_webhook_events on public.webhook_events
  for all to anon, authenticated using (false) with check (false);

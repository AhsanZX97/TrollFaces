create extension if not exists "pgcrypto";

create table if not exists public.round_results (
  id uuid primary key default gen_random_uuid(),
  player_id text not null,
  player_name text not null,
  score int not null check (score >= 0 and score <= 100),
  points_awarded int not null check (points_awarded >= 0),
  detection_rate double precision not null check (
    detection_rate >= 0 and detection_rate <= 1
  ),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists round_results_player_id_idx
  on public.round_results (player_id);

create index if not exists round_results_created_at_idx
  on public.round_results (created_at desc);

alter table public.round_results enable row level security;

create policy "round_results_select_public"
  on public.round_results for select
  to anon, authenticated
  using (true);

create policy "round_results_insert_public"
  on public.round_results for insert
  to anon, authenticated
  with check (true);

create or replace view public.leaderboard_entries as
select
  player_id,
  max(player_name) as player_name,
  sum(points_awarded)::bigint as total_points,
  max(score)::int as best_score,
  count(*)::int as rounds,
  min(created_at) as earliest_achieved_at
from public.round_results
group by player_id;

grant select on public.leaderboard_entries to anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select, insert on public.round_results to anon, authenticated;

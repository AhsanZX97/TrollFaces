-- Tighten RLS so only authenticated users can insert rounds, and only
-- as themselves (player_id must equal auth.uid()).
--
-- Run this AFTER 001_round_results.sql.

drop policy if exists "round_results_insert_public" on public.round_results;

create policy "round_results_insert_own"
  on public.round_results for insert
  to authenticated
  with check (auth.uid()::text = player_id);

revoke insert on public.round_results from anon;
grant insert on public.round_results to authenticated;

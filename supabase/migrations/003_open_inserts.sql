-- Allow ALL rounds (Google-signed-in and name-only) to land on the
-- shared leaderboard.
--
-- - Anonymous players insert with whatever player_id the client generates.
-- - Authenticated players must insert with player_id = auth.uid()
--   so a signed-in user cannot post under someone else's id.
--
-- Run this AFTER 001 (and AFTER 002, if you ran it).

drop policy if exists "round_results_insert_own" on public.round_results;
drop policy if exists "round_results_insert_public" on public.round_results;

create policy "round_results_insert_open"
  on public.round_results for insert
  to anon, authenticated
  with check (
    auth.uid() is null
    or auth.uid()::text = player_id
  );

grant insert on public.round_results to anon, authenticated;

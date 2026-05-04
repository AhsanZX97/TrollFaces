# Architecture outline (planned)

## High-level
- **Frontend-only MVP** can compute scores client-side and send only minimal results to a backend (or store locally first).
- The app is a **React + TypeScript** SPA.

## Key modules (frontend)
- `features/round/`
  - **Camera**: `getUserMedia`, permission handling, device selection (later)
  - **Frame sampling**: capture frames at a fixed rate (e.g. 5–10 FPS)
  - **Detection**: face detection + landmarks extraction
  - **Scoring**: normalize landmarks + compute similarity vs reference
  - **Round state**: countdown, timer, status, validation (“face detected”)
- `features/leaderboard/`
  - Fetch + display ranks
  - Highlight current player
- `features/rooms/` (optional for MVP if we do quick play)
  - Room creation/joining
  - Presence (later)

## Suggested page routes
- `/` home
- `/play/:roomId?` round
- `/results/:roundId` results
- `/leaderboard` leaderboard

## Data model (minimal)
- **Player**
  - `id`
  - `displayName`
  - `createdAt`
- **RoundResult**
  - `id`
  - `playerId`
  - `roomId?`
  - `score` (0–100)
  - `pointsAwarded`
  - `createdAt`
  - `meta` (device hints, detection confidence summary; no raw frames)

## Backend / persistence
- **Supabase (optional)**: When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, round rows are inserted into Postgres and the leaderboard is read from a view. See `docs/supabase.md` and `supabase/migrations/001_round_results.sql`. Without env vars, leaderboard data stays in **localStorage** only.
- **Firebase**: alternative for realtime rooms later
- **Node/Express**: alternative if you want a custom API + Postgres

## Scoring strategy options
We’ll choose one and iterate:

1. **Landmark distance (fast, explainable)**  
   Compare normalized landmark vectors against a reference vector.

2. **Lightweight embedding similarity (more robust)**  
   Compute a small embedding from a model and cosine-similarity to a reference.

3. **Hybrid (likely best for a drawing reference)**  
   Use face geometry + a simple image-feature term, both client-side.

## Privacy stance
- Process frames on-device.
- Send only `{score, points, timestamps, minimal metadata}`.


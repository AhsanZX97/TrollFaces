# Supabase leaderboard (free tier)

TrollFaces can store round results in **[Supabase](https://supabase.com/)** (PostgreSQL + auto REST API) so the leaderboard is **shared for everyone** who uses your deployed site.

If you **do not** set the env vars below, the app keeps using **localStorage only** (per browser).

## What you do (one-time)

### 1. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com/) (GitHub login is fine).
2. **New project** → pick org, name, database password, region → create.
3. Wait until the project is **healthy**.

### 2. Run the SQL schema

1. In the Supabase dashboard: **SQL Editor** → **New query**.
2. Paste the full contents of:

   `supabase/migrations/001_round_results.sql`

3. Click **Run**. You should see “Success” with no errors.

This creates:

- Table **`round_results`** — one row per finished round (score, points, detection %, JSON `meta`, no camera frames).
- View **`leaderboard_entries`** — aggregated ranks (total points, best score, round count), sorted the same way as the product spec.
- **Row Level Security (RLS)** with policies that allow **anonymous read + insert** (good for a quick MVP; tighten later if you get abuse).

### 3. Get API keys for the browser

1. **Project Settings** (gear) → **API**.
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`  
     (Use the **anon** key in the frontend, never the **service_role** key in client code.)

### 4. Configure your app locally

1. Copy `.env.example` to `.env` in the repo root (`.env` is gitignored).
2. Set:

   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbG...
   ```

3. Restart the dev server (`npm run dev`). Vite only reads env at startup.

### 5. Configure your host (production)

On **Vercel**, **Netlify**, **Cloudflare Pages**, etc.:

- Add the same two variables in the project’s **Environment variables** UI.
- Names must be exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Redeploy after saving.

Build command stays `npm run build`; the client bundle will include only the **anon** URL + key (expected for Supabase browser apps). Protect abuse with rate limits / auth later if needed.

## Verify it works

1. With `.env` set, play a round → you should land on results with no save error.
2. In Supabase: **Table Editor** → `round_results` → you should see a new row.
3. Open **Leaderboard** in the app — your row should appear in the aggregated list.

## Security note (MVP)

Current policies allow **anyone** who has your anon key to **insert** rows (fake scores). That matches a fast MVP on the free tier. Next steps when you care:

- Require **Supabase Auth** (even anonymous) before insert.
- Add a **Postgres function** or **Edge Function** to validate payloads and rate-limit.
- Or move writes to your own backend with a secret.

## Files in this repo

| Path | Role |
|------|------|
| `supabase/migrations/001_round_results.sql` | Schema + RLS + view (paste in SQL Editor) |
| `src/lib/env.ts` | Detects whether remote leaderboard is enabled |
| `src/lib/supabase.ts` | Singleton Supabase client |
| `src/features/leaderboard/supabase-leaderboard.ts` | Insert + fetch helpers |
| `.env.example` | Documents required env vars |

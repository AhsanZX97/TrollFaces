# Supabase setup (free tier)

TrollFaces can store round results in **[Supabase](https://supabase.com/)** so the leaderboard is **shared for everyone** who uses your deployed site, and players sign in with **Google** so their name on the leaderboard matches their Google account.

If you **do not** set the env vars below, the app falls back to **localStorage only** (per browser, no Google sign-in).

## What you do (one-time)

### 1. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com/) (GitHub login is fine).
2. **New project** → pick org, name, database password, region → create.
3. Wait until the project is **healthy**.

### 2. Run the SQL schema

In **SQL Editor → New query**, paste and run **in order**:

1. `supabase/migrations/001_round_results.sql` — table, view, indexes, base RLS.
2. `supabase/migrations/003_open_inserts.sql` — lets **all** rounds save to the shared leaderboard (anonymous and Google-signed-in). Authenticated users still can’t spoof someone else’s `player_id`.

After both run you should see the `round_results` table and `leaderboard_entries` view in **Table Editor**.

> If you previously ran `002_auth_policies.sql` (Google-only inserts), `003` drops that policy automatically.

### 3. Enable Google sign-in

You need a **Google Cloud OAuth client**, then point Supabase at it.

#### 3a. In **Supabase**

1. **Authentication → URL Configuration**
   - **Site URL**: `https://your-deployed-site.com` (use `http://localhost:5173` for dev)
   - **Redirect URLs**: add both your prod URL and `http://localhost:5173` (and any preview URLs, e.g. Vercel previews).
2. **Authentication → Providers → Google → enable**.
3. Note the **Callback URL** Supabase shows you. It looks like:
   `https://<project-ref>.supabase.co/auth/v1/callback`
4. Leave this tab open — you’ll paste the Google client ID + secret here in step 3c.

#### 3b. In **Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com/))

1. Create / pick a project.
2. **APIs & Services → OAuth consent screen**
   - User type: **External** → fill app name, support email, dev email → save.
   - **Scopes**: keep defaults (`.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`).
   - **Test users**: add your own Google account while the app is in **Testing**. (You can publish later.)
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**.
   - **Authorized JavaScript origins**: your prod origin + `http://localhost:5173`.
   - **Authorized redirect URIs**: paste the **Supabase callback URL** from step 3a (`https://<project-ref>.supabase.co/auth/v1/callback`).
   - Create → copy **Client ID** and **Client secret**.

#### 3c. Back in Supabase

In **Authentication → Providers → Google**, paste the **Client ID** and **Client secret**, save.

### 4. Get API keys for the browser

1. **Project Settings (gear) → API**.
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`  
     (Use the **anon** key in the frontend, never the **service_role** key in client code.)

### 5. Configure your app locally

1. Copy `.env.example` → `.env` (gitignored).
2. Set:

   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbG...
   ```

3. Restart `npm run dev` (Vite reads env at startup only).

### 6. Configure your host (production)

On **Vercel / Netlify / Cloudflare Pages / etc.** add the same two variables in the project’s **Environment variables** UI:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Build command stays `npm run build`. Make sure the deployed origin is included in **Site URL** + **Redirect URLs** in Supabase, and in **Authorized origins** in your Google OAuth client.

## Verify it works

1. Open the app — the home card shows **Continue with Google**.
2. Sign in. You return to `/` signed in; the header shows your Google name with a **Sign out** button.
3. Play a round → land on results with no save error.
4. In Supabase **Table Editor → `round_results`** a new row should appear, with `player_id` equal to your `auth.users.id`.
5. **Leaderboard** in the app shows your row aggregated.

## How the player identity works

- **Signed in with Google**: `player_id = auth.uid()` and `player_name` comes from the Google account (`user_metadata.full_name`, then `name`, then `preferred_username`, then the email local-part).
- **Name only (no sign-in)**: `player_id` is a random UUID generated in the browser and `player_name` is whatever the player typed.
- Either way, every round is inserted into Supabase and shows up in the global leaderboard.

## Security notes (MVP)

- Reads are public.
- Inserts are open: **anyone** can post a round. Authenticated users can only post under **their own** `auth.uid()` (no impersonation), but anonymous users can pick any `player_id`.
- `player_name` is client-supplied. Tighten with a server-side trigger that overwrites it from `auth.users.raw_user_meta_data` for signed-in players if you want.
- Consider Supabase **rate limits** or an Edge Function in front of `insert` if you start seeing abuse.

## Files in this repo

| Path | Role |
|------|------|
| `supabase/migrations/001_round_results.sql` | Table, view, indexes, base RLS |
| `supabase/migrations/002_auth_policies.sql` | (legacy) Google-only inserts |
| `supabase/migrations/003_open_inserts.sql` | All rounds (anon + Google) save to the global board |
| `src/lib/env.ts` | Detects whether remote leaderboard is enabled |
| `src/lib/supabase.ts` | Singleton Supabase client |
| `src/features/auth/use-auth.ts` | Auth state, `signInWithGoogle`, `signOut` |
| `src/features/auth/auth-sync.tsx` | Mirrors Google identity into the leaderboard store |
| `src/features/leaderboard/supabase-leaderboard.ts` | Insert + fetch helpers |
| `.env.example` | Documents required env vars |

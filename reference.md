# Reference apps (inspiration)

This document captures product/UX patterns worth borrowing for **TrollFaces** from:

- [67Quick](https://www.67quick.com/)
- [Omoggle](https://omoggle.com/)

## How this was verified (Playwright MCP)

Observations below were **re-checked with the Playwright MCP** using **accessibility snapshots** (structured page tree, not screenshots) on **2026-05-04**. URLs visited:

| Site | URLs |
| --- | --- |
| 67Quick | [Home](https://www.67quick.com/), [Leaderboard](https://www.67quick.com/leaderboard) |
| Omoggle | [Home](https://omoggle.com/), [Leaderboard](https://omoggle.com/leaderboard) |

Policy/legal detail for Omoggle still benefits from reading [Terms](https://omoggle.com/tos) and [Privacy](https://omoggle.com/privacy) directly (long-form prose).

---

## 67Quick — “viral camera challenge” pattern

### What we saw (home)

- **Brand + nav**: Top bar with site name and a persistent **Leaderboard** link (`/leaderboard`).
- **Hero**: Title **67Quick** + subtitle **The 67 motion speed challenge**.
- **Primary funnel**:
  - Textbox **Enter your username** with a **0/20** character counter (implies max username length **20**).
  - Primary CTA **Enter a username to play** starts **disabled** until a valid username is entered (good empty-state guard).
  - Secondary CTA **View Leaderboard** next to the play path.
- **Auth upsell**: Copy **Sign in to save your score to the global leaderboard** (optional auth framed as persistence, not a wall).
- **Live-ish stats cards**:
  - **Global 67 Count** + large number + caption **67 motions worldwide**.
  - **Total Games Played** + large number + caption **games played total**.
- **How to play**: `HOW TO PLAY` heading + one paragraph explaining the **30-second** camera motion; then a **3-icon row** (Allow camera → Alternate arms → Score points).
- **Footer**: **Terms & Conditions** (`/terms`) · **Privacy Policy** (`/privacy`) · copyright.

### What we saw (leaderboard)

- **Dual nav**: **67Quick.com** (home) + **Play** (`/game`) so users can bounce between compete and browse ranks.
- **Headline block**: **Global Leaderboard** + **Top 100 — resets every 48 hours**.
- **Season tension**: **Resets in** + a live countdown (e.g. **4h 17m** at capture time).
- **Refresh**: **Refresh** control present (was **disabled** in the snapshot capture — worth mirroring as “refresh while loading” or rate-limit UX).
- **Same Google upsell** + **Play Now** back to home.

### What to steal for TrollFaces

- **Username-first** with visible length limit and **disabled primary** until input is valid.
- **Two entry points to leaderboard** (nav + inline link) so ranking is never more than one click away.
- **Short seasonal reset** messaging on the leaderboard page itself (creates urgency).
- **Three-step pictorial checklist** next to the written rules (camera apps are easier when users can scan icons).

### Things to watch

- If leaderboard **resets often**, offer a separate **all-time** or **personal best** so progress does not feel erased.

---

## Omoggle — “camera check gate + competitive ladder” pattern

### What we saw (home)

- **Positioning strip**: **Live 1v1 Mog Arena** above the main **Omoggle** H1.
- **Single mega-CTA**: One large **button** that bundles hero + action + legal in one hit target:
  - **Enter the Arena** / **Start Camera Check →**
  - Inline agreement: links to **Terms of Service** and **Privacy Policy** inside the same control (consent is impossible to miss).
- **Numbered funnel (1–3)** with chevrons between steps:
  1. **Camera Check** — “Complete a quick camera check to get started.”
  2. **Solo PSL Scan** — “Take a Solo PSL Scan to verify you mog.”
  3. **Compete & Climb** — “Win matches, earn points, and climb the ladder.”
- **Secondary community row**:
  - **View Leaderboard** button with subtitle **See top players and rankings.**
  - **Join Discord** external link with subtitle **Chat, events & updates.**
- **Trust footer line**: **Anti-abuse session gate · 18+ acknowledgment · Not legal ID verification** — sets expectations in one line.

### What we saw (leaderboard)

- **Policy surface**: A **region** “Policy update notice” with dismiss (×) — keeps legal changes visible without blocking the whole app forever.
- **Back to core loop**: **← ENTER ARENA** returns to arena entry with query `/?gate=1` (deep-link to gated flow).
- **Season framing**: **Season ends in** countdown + **Ranks reset every month** + **View Rewards** (season + rewards as first-class UI).
- **Leaderboard copy**:
  - **Top 100 ranked players by Elo. Only claimed accounts appear.**
  - Short Elo explainer + link **?** to `/how-elo-works` (reduces “why did my rank move?” confusion).
- **Rank tiers**: Named tiers with emoji + Elo bands (Slayer, Chad, …) — makes the ladder legible beyond raw numbers.

### Console / implementation notes (non-UI)

From the same Playwright session, the home page console showed **anonymous session** style calls (`signInAnonymously`, `getSession`, `ensureSession`) and **CSP report-only** messages around analytics (Supabase/LiveKit/Stripe allowed in `connect-src`; GA attempted). For TrollFaces this is a reminder: **tight CSP + analytics** needs deliberate allowlists.

### What to steal for TrollFaces

- **One obvious primary** that includes **Terms + Privacy** links *before* camera (we can simplify wording for a non-1v1 app).
- **Numbered steps** on the landing page so the product feels like a flow, not a single mystery button.
- **Leaderboard page** that teaches the rules of the ladder (**how scoring works** link) and uses **season countdown** + optional **rewards**.
- **Single-line trust copy** under the fold (what the camera is for / what it is *not*).

### Policy/tech inspiration (still from public legal pages)

- **MediaPipe**-style **in-browser** landmark processing and **minimal server persistence** for gates (see [Privacy](https://omoggle.com/privacy) / [ToS](https://omoggle.com/tos)).
- TrollFaces does **not** need 18+ live video posture; we can still borrow **clear consent** and **plain retention** language.

---

## Synthesis for TrollFaces (actionable takeaways)

### Onboarding & motivation

- **67Quick-style**: username (with limit + disabled CTA) → play; leaderboard always one click away.
- **Omoggle-style**: optional **numbered steps** on the landing page (Check camera → Match reference → Score).

### Game loop UX

- **Pre-round camera check** before the 30s timer (permission + face visible + lighting hint).
- **Icon + text** instructions like 67Quick’s three-step row, tuned for “troll face” cues (mouth width, squint, etc.).

### Leaderboard strategy

- **67Quick**: short **reset cadence** on the leaderboard page itself.
- **Omoggle**: **season countdown**, tier bands, and a **“how it works”** explainer link.
- Consider **Season** + **All-time** (or **Personal best**) tabs.

### Privacy posture (recommended for TrollFaces)

- Short banner before camera, similar in spirit to Omoggle’s bundled CTA:

  - “We process your camera **on your device** to score similarity to the reference face. By default we only store **your score, username, and timestamp** on the server.”

- Footer links: **Terms** · **Privacy** (67Quick pattern).

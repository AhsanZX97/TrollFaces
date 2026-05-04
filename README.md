# TrollFaces

**TrollFaces** is a web app where players compete to make the best “troll face” in **10 seconds** using their camera. After the timer ends, the app **scores how closely** the player’s face matches the reference image (`trollface.png`), awards points, and places the result on a **leaderboard**.

## What the app does

- **Matchmaking / lobby**: Players join a room (public or private) and start a round together.
- **10-second camera challenge**: Camera is enabled; player tries to mimic the reference troll face.
- **Scan & score**: At the end of the round, the app computes a **similarity score (0–100)**.
- **Points**: The score converts to points for the round and cumulative totals over time.
- **Leaderboard**: Players are ranked by points (global, friends, or room-based).

## Core user flow

1. Player enters a name (or signs in later).
2. Player joins a room.
3. Countdown → **10s** challenge with camera preview + reference `trollface.png`.
4. Round ends → “Scanning…” → score appears.
5. Points awarded → leaderboard updates.

## Scoring (initial plan)

We’ll implement scoring entirely in the browser (no image upload required):

- **Face detection / landmarks**: Detect a face and extract facial landmarks.
- **Normalization**: Normalize for scale/rotation so distance comparisons are meaningful.
- **Similarity**: Compare player landmarks (and/or a compact embedding) against a stored reference representation of the troll face.

Notes:
- The reference troll face is a drawing; we’ll likely need a **hybrid** approach: landmark-based similarity for face geometry + optional lightweight image features from the camera frame (still computed client-side).
- The MVP goal is a score that “feels fair” and is consistent, not perfect biometric accuracy.

## Privacy & safety goals

- **MVP default**: No raw images are stored.
- **Client-side processing**: Camera frames used for scoring remain on-device.
- **Server receives**: Only the computed score, timestamps, and minimal player metadata (e.g., display name).

## Product scope (MVP)

- **Single round mode**: Join → play 10s → score → leaderboard.
- **Anti-cheat basics**: Must have a face detected during the round; prevent static image injection where possible.
- **Leaderboard**: Top players by points (global).

## Tech stack (target)

- **Frontend**: React + TypeScript + Vite
- **UI**: TailwindCSS + shadcn/ui
- **State**: Zustand (client state), TanStack Query (server state)
- **Camera**: `getUserMedia` with a `<video>` preview + `<canvas>` for frame capture
- **Scoring**: in-browser face detection/landmarks (exact library TBD)
- **Backend (later)**: simple API for rooms, scores, and leaderboards (Supabase/Firebase/Node can work)

## Assets

- Reference troll face image: `public/trollface.png` (served as `/trollface.png`)

## Getting started

```bash
npm install
npm run dev      # start the app at http://localhost:5173
npm run lint     # ESLint (flat config)
npm test         # run unit tests (Vitest)
npm run build    # type-check + production build
```

The MediaPipe face landmarker model is fetched from a CDN on first load; it is then cached by the browser.

## Docs

- `docs/product.md`: product behavior + rules
- `docs/architecture.md`: app structure + key modules
- `docs/roadmap.md`: MVP milestones


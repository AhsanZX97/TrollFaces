# Product spec (MVP)

## Concept
Players compete to make the best troll face in **10 seconds** with their camera on. When time ends, the app scans the attempt and produces a **similarity score** vs the reference troll face. The score converts to **points** and updates a **leaderboard**.

## Definitions
- **Round**: One timed 10-second attempt.
- **Score**: Similarity number \(0–100\).
- **Points**: A derived value from score used for ranking.
- **Leaderboard**: Ranking by points (total or best-of).

## Primary screens (MVP)
- **Home**
  - Enter display name
  - Join/create room (or “Quick play”)
- **Game / Round**
  - Reference image visible (`trollface.png`)
  - Camera preview
  - Countdown + 10s timer
  - “Face detected” indicator + helpful hints (“move closer”, “more light”)
- **Results**
  - Score + points earned
  - Snapshot thumbnail (optional, MVP can omit storing it)
  - Button to play again / return
- **Leaderboard**
  - Top players
  - Player’s rank

## Round rules
- **Time limit**: 10 seconds per round.
- **Camera required**: Must grant permission to play.
- **Valid attempt**:
  - A face must be detected for a minimum portion of the round (e.g. \(\ge 70\%\) of frames sampled).
  - If no face is detected, the result is “No face detected” and score is 0.

## Scoring requirements (MVP)
- **Fast**: Result in ~1–3 seconds after round ends on typical hardware.
- **Stable**: Similar conditions should produce similar scores.
- **Normalized**: Handle distance to camera and slight head tilt (scale/rotation normalization).
- **No storage of raw frames by default** (privacy-first).

## Points (suggested initial mapping)
- **Points earned** per round = `round(score)` (so 0–100 points)
- Optionally add a small bonus for streaks or daily play later.

## Leaderboard rules (MVP)
- **Global leaderboard** sorted by:
  1. Total points (descending)
  2. Highest single-round score (tie-break)
  3. Earliest achieved (tie-break)

## Non-goals (MVP)
- Friends list
- Cosmetics / avatar customization
- Paid features
- Perfect anti-cheat


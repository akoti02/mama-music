# Open tasks — mama-music (frontend)

## Active
_(none — current build `2026-05-13T-finalise` passed all 5 audits; awaiting user feedback)_

## Watching
- Groq vibe backfill is paused — Юля's tab will still get math-hue fallback for un-analyzed tracks. ~620 / 3206 currently have real LLM colors. Resume via `node scripts/backfill-vibe.mjs` (in `mama-music-api`) at a quiet time. Computer crashed when 3 parallel workers ran simultaneously — keep to 1 worker, batch=6, 1s pause.

## Backlog (low priority)
- Spotify Audio Features integration for real BPM/key/energy → reactive background (requires Spotify dev account)
- Replace per-card listener attaches with delegated `cardHost.addEventListener` (mid Android perf win)
- Cron-trigger for `diag` table cleanup (currently manual via `/admin/cleanup?key=ADMIN_KEY`)
- Schema-doc file listing every `library_*` column origin

## Won't do
- Remove `/api/lovers/*` and `/api/dj/*` route handlers in `mama-music-api`: 14 dead routes, ~600 lines. Confirmed unused by frontend (`grep` returns 0). Deletion ratio is risk-heavy / reward-low; keeping them is free at runtime.
- Theme rendering as a hover tooltip (current inline italic line is enough)
- Remove `.year-pill` CSS — already gone, dead class

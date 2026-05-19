# Edit journal — mama-music frontend

Newest first. One entry per meaningful batch of edits. Format: `## YYYY-MM-DD HH:MM — short title`.

## 2026-05-13 — finalisation pass
Build `2026-05-13T-finalise`. Closed the 4 items previously skipped:
- theme rendering: added `.mood-line` italic caption under artist showing `mood · theme` (filters when keyboard open)
- mm_guest_lock cookie marked HttpOnly; JS-side `getCookie('mm_guest_lock')` redirect removed (server-side 302 is sole consumer)
- Beacon+drain idempotency: D1 migration adds `library_actions_log.client_id` + partial-unique index; `handleLibraryAction` short-circuits if duplicate `_id` arrives; frontend stops stripping `_id` from beacon + drain payloads
- /api/lovers + /api/dj: confirmed 0 frontend callers; hid `#add-btn` + `#all-btn` in `body.guest-mode`; updated misleading 403 comment in `handleLibraryAdd`. Dead routes kept (deletion risk-heavy)

## 2026-05-13 — audit-sweep
Build `2026-05-13T-audit-sweep`. Ran 5 parallel agent audits (architecture, perf-verify, data, security, UX-mobile). Closed:
- Performance: line 6051 still called `localRemoved.add` directly → `localRemovedAdd`; added LRU caps to `colorCache` (200) + `addPreviewCache` (100)
- Data integrity (3 critical): split user-action UPSERT + history + WAL into atomic D1 batch; clear flags applied inside UPSERT (no separate post-WAL UPDATE); WAL now records true post-clear final state
- Data integrity (serious): `untagFromWorkspaces` now uses NOT EXISTS clause in single UPDATE (no TOCTOU); `normCategories` sorts by canonical CAT_ORDER for deterministic serialisation
- Security: `youtube_id` in `/api/library/add` now normalised via `normYouTubeId()`; LLM mood/theme stripped of HTML-meaningful chars before INSERT (XSS defense-in-depth)
- UX: `html { overscroll-behavior-y: none }` blocks Android pull-to-refresh; 42px touch targets bumped to 44px; year-chip forced to `color: #fff` for contrast on light vibes; offline state shown in unsaved-badge
- Architecture: `isOwner`/`isGuest` changed to `let` and recomputed after name-gate (were captured before user identified)

## 2026-05-13 — perf-sweep
Build `2026-05-13T-perf-sweep`. After mama reported player slowdown over 50+ tracks. Fixed:
- YT iframe teardown: stopVideo + about:blank + remove() before mounting new one
- `openOv` pauses YT iframe via postMessage
- `ytTried` Map LRU cap 50; `localRemoved` Set LRU cap 200
- Proactive snapshot sweep every 5 min (was lazy 30-min TTL only)
- `let booted = false` double-boot guard
- `wakeListening` setTimeouts now cancellable via `ytMountGen` + `ytWakeTimers`
- Confetti single-shot guard
- K_DRAFTS soft cap 200
- `loadOthersComments` uses AbortController to cancel stale fetches
- `fetchWithRetry` accepts externalSignal; cancels on caller abort
- `refreshProgress` 4s throttle + inflight guard
- `.rating-btn` backdrop-filter removed (10 compositing layers per card)

## 2026-05-13 — yt-leak-fix (rolled into perf-sweep)
First attempt at fixing YT iframe leak. Discovered the issue is wider — full sweep followed.

## 2026-05-13 — kbd-offset
Android URL-bar autohide was falsely triggering `body.kbd-open`, hiding artist line + player. Fixed: require focused text input + >200px viewport shrink. `--kbd-offset` only contributes to padding when keyboard truly open.

## 2026-05-13 — mobile-fix
Year invisible on phone + desktop: yearPill CSS used `--song-c2` but `<div class="year-pill">` was never emitted. Switched to inline `<span class="year-chip">` in `.by`. Same bug also masked title gradient on Samsung Internet — moved to solid white + text-shadow.

## 2026-05-12 — vibe-brain
Build `2026-05-12T-vibe-brain`. Added lrclib lyrics fetch + Workers AI mood/theme/color analysis. Backend handler `analyzeSongVibe` returns `{mood, theme, c1, c2}`. Frontend `applyBodyVibe` paints them on body.

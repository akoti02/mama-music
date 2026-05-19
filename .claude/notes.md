# Durable knowledge — mama-music frontend

## File layout
- `index.html` (~7300 lines) — entire SPA in one file
- `_worker.js` — Cloudflare asset server (HTTPS headers, guest-lock cookie, CDN cache busting)
- `wrangler.toml` — `name = "akoev-site"`, custom domain `akoev.com` + `www.akoev.com`
- `.claude/` — Claude's persistent workspace (this dir)

## Architecture (frontend)
- Single HTML file → ~3200-line `<style>` + ~4000-line `<script>` (module IIFE)
- No build step, no bundler. Direct deploy via `wrangler deploy`.
- Module-scope state: `userName`, `currentSong`, `seenStack` (cap 30), `ytTried` (LRU 50), `localRemoved` (LRU 200), `colorCache` (LRU 200), `addPreviewCache` (LRU 100), `drafts`, `snapshots` (30-min TTL)
- Action queue (`Q_KEY` in localStorage) + in-memory mirror (`qMirror`) — every user edit is durable
- Client-side idempotency token (`_id` per queued action) round-trips to server which uses `library_actions_log.client_id` partial-unique index

## Key invariants (DON'T BREAK)
- `index.html:12` must have a fresh `<!-- build: ... -->` marker on every visible-change deploy. The periodic build-check polling reloads the SPA when it changes.
- `mountYTIframe` MUST tear down the previous iframe (stopVideo → src=about:blank → remove) before mounting a new one. Mom listens to 50+ tracks per session; iframe leak crashes Android.
- `openOv` MUST pause the YT iframe — otherwise audio plays under overlays.
- `applyBodyVibe` sets `--vibe-c1 / --vibe-c2` inline on `<body>`; the ambient gradient consumes those. Don't move to a child element.
- `recomputeKbdOffset` requires BOTH `rawOff > 200` AND an editable element focused before setting `body.kbd-open` — Android URL-bar autohide is ~80px and falsely triggered the keyboard-open layout before this guard.
- `songPalette` returns `[c1, c2]` triplet strings ("R G B"). Use `validRgbTriplet()` before trusting LLM vibe values.
- `cardHost.innerHTML = ...` replaces children fully. Re-attach listeners after every `renderCard`.
- Build-marker check at `~6900` polls `/` periodically and reloads on mismatch — that's how mom gets fresh deploys without manual refresh.

## State hierarchy (when in doubt about source of truth)
1. **Server (D1 `library_actions`)** — canonical user state
2. **`library_actions_log` (WAL)** — append-only audit, can rebuild server state if it ever desyncs
3. **`snapshots` localStorage** — short-lived (30 min) per-card draft
4. **`Q_KEY` localStorage** — pending writes durable across tab close, drained on online/visible/boot
5. **In-memory** — current card, current cat, ephemeral UI flags

## Performance ceilings (Android Samsung)
- Aggregate `backdrop-filter` count on player stage should stay ≤ 5 (we removed it from `.rating-btn`)
- Body radial-gradient = 5 pools — keep stable; more = repaint cost
- `seenStack` cap 30 keeps memory bounded; don't raise without testing

## Build/deploy commands
- Frontend: `cd C:\dev\mama-music && export CLOUDFLARE_API_TOKEN=$(cat ~/.cloudflare-token | tr -d '\n\r') && npx wrangler deploy`
- Wrangler "Authentication error" on route registration is expected — the upload still succeeded. Ignore.
- Verify: `curl -s https://akoev.com/ -H "Cache-Control: no-cache" | grep "build:"` should show the freshly-deployed marker.

## Common pitfalls
- Don't add CSS `transition: background` to body — radial-gradients don't interpolate.
- Don't gradient-text the title with `-webkit-text-fill-color: transparent` — Samsung Internet may render it invisible. Use solid white + text-shadow.
- Don't put `pointer-events: auto` on `.tc-card::before` decorative stripe — it'll steal clicks.
- Don't put `transform: translate3d` on a `z-index:-3` pseudo-element — creates a new stacking context that lands ABOVE content.

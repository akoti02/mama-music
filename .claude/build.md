# Build state — mama-music

## Current production
- **Build marker:** `2026-05-13T-finalise`
- **Asset hosting:** Cloudflare Workers (`akoev-site`), bound to akoev.com + www.akoev.com
- **Verify live:** `curl -s https://akoev.com/ -H "Cache-Control: no-cache" | grep "build:"`

## Recent deploy chain
1. `2026-05-13T-finalise` — theme rendering + HttpOnly + idempotency + guest-mode hide add-btn
2. `2026-05-13T-audit-sweep` — 5-agent audit fixes
3. `2026-05-13T-perf-sweep` — memory leak + cache caps + Android Chrome URL-bar guard
4. `2026-05-13T-yt-leak-fix` — YT iframe explicit teardown (rolled into perf-sweep)
5. `2026-05-13T-mobile-fix` — year visibility + Samsung gradient text fix
6. `2026-05-13T-kbd-offset` — kbd-open URL-bar autohide
7. `2026-05-13T-progress-v2` — refreshProgress fix
8. `2026-05-13T-hue-fallback` — math-derived per-song palette
9. `2026-05-13T-shimmer` (reverted) — pseudo-element animations broke layout
10. `2026-05-13T-ambient-trio` — per-overlay unique identities

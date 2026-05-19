# Tunable parameters — mama-music frontend

These are values Claude can adjust without rebuilding mental model. Each line documents the current value, the file:line where to find it, and the practical range.

## Player layout
- `yt-wrap max-height` = **32vh** (`index.html:~625`) — range 28-38vh. Below 28vh on tall phones makes the video tiny; above 38vh crowds out controls.
- `card gap` = **9px** (`index.html:~609`) — vertical spacing between meta/comment/rating/cats.
- `meta padding` = **14px 20px 12px** (`index.html:~778`).

## Card sizing
- `card max-width` = **520px** mobile, **560px** tablet (`@media min-width: 720px`), **620px** desktop.
- `title font-size` = **34px** mobile, **46px** tablet.
- `.by font-size` = **18px** mobile, **20px** tablet.

## Swipe / gesture
- Swipe-to-skip threshold — see `setupCardSwipe` for distance + velocity thresholds.
- `setupCardSwipe` ignores swipes on iframe/textarea/button.

## Soft keyboard
- `recomputeKbdOffset` requires viewport-shrink > **200px** AND focused editable to set `body.kbd-open`. Tune up if false positives appear; down if real keyboards on short phones don't trigger.

## Caches (LRU caps)
- `ytTried` = **50** (`YT_TRIED_CAP`)
- `localRemoved` = **200** (`LOCAL_REMOVED_CAP`)
- `colorCache` = **200** (`COLOR_CACHE_CAP`)
- `addPreviewCache` = **100** (`ADD_PREVIEW_CAP`)
- `drafts` soft cap = **200**
- `seenStack` = **30** (hardcoded splice in `loadNext`)
- `drainOutcomes` = **200**

## Timings
- `refreshProgress` throttle = **4000 ms**
- YT watchdog = **7000 ms** before swap to alternate video
- `wakeListening` retries = **4** at 500/1700/2900/4100 ms
- snapshot TTL = **30 min**
- snapshot sweep interval = **5 min**
- `periodicSyncDebounced` interval = **60000 ms**
- Action queue retry backoff = **400 × 2^attempt ms**, max 3 retries

## Vibe colours (math fallback when LLM hasn't analyzed)
- 24-palette curated set (`SONG_PALETTES`)
- HSL-from-hash fallback: hue 0-360, saturation 70-87, lightness 56-67 for c1; saturation 65-86, lightness 50-67 for c2; c2 at hue+35 (analogous)

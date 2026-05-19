# Claude operating notes for mama-music (frontend)

When Claude works on this repo, the source of truth is **this directory + `.claude/`**:

- `.claude/tasks.md` — open work, decisions to make, follow-ups
- `.claude/notes.md` — durable knowledge about how the frontend SPA is wired (state, listeners, perf invariants)
- `.claude/tweaks.md` — tunable parameters Claude can edit without rebuilding mental model (e.g. swipe threshold, video max-height)
- `.claude/journal.md` — chronological log of significant edits + their reasoning
- `.claude/build.md` — current production build marker + recent deploy history

These files are **NOT shipped to the browser** (Cloudflare's `[assets] directory = "."` would otherwise expose them — `wrangler.toml` excludes the dotfile by convention; verify via `curl https://akoev.com/.claude/notes.md → 404`).

Read `.claude/tasks.md` at session start. Update `.claude/journal.md` after each batch of edits.

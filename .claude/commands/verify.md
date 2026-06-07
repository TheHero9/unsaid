---
description: Run typecheck + lint + worker tests against the current branch. Surfaces any issues with file:line refs.
allowed-tools: Bash, Read
---

Verify the current state of the project. Run BOTH sides if both exist:

### Next.js side (skip if `package.json` doesn't exist yet)

1. `npm run typecheck` — capture and display any errors with file:line
2. `npm run lint` — capture and display any warnings/errors with file:line
3. `npm run build` (only if explicitly requested or before a deploy) — production build smoke

### Python worker (skip if `worker/pyproject.toml` doesn't exist yet)

1. `cd worker && uv run ruff check` — Python lint
2. `cd worker && uv run mypy .` — type check (if `mypy` is configured)
3. `cd worker && uv run pytest -q` — run all tests
4. `cd worker && uv run uvicorn main:app --port 8001` (background, only if requested) — smoke

### Dev server (only if requested)

- `npm run dev` in the background, report the URL
- `cd worker && uv run uvicorn main:app --reload --port 8001` in the background

Do NOT modify any files. This is a read-only verification.

End with a confidence rating per `CLAUDE.md` rules (🟢/🟡/🟠/🔴) and a one-line "ready to commit" / "fix first" recommendation. List failures grouped by file with suggested fixes — don't apply them.

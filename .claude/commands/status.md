---
description: Show project status — which setup steps are done, in-progress, pending. Quick orientation at session start.
allowed-tools: Read, Glob, Grep, Bash
---

Show a fast project status report:

1. Read `CLAUDE.md` "What's Done" / "What's NOT Done Yet" / "Next Steps" sections
2. Glob `specs/05-setup/*.md` and grep each for the `Status:` line
3. Render a table:

```
| # | Title | Status | File |
| - | ----- | ------ | ---- |
| S0 | Scaffold (Next.js + Python worker) | ⏳ Pending | 01-S0-scaffold.md |
| S1 | Data model + Supabase migrations    | ⏳ Pending | 02-S1-data-model.md |
...
```

4. Show current branch (`git branch --show-current`)
5. Show uncommitted changes count (`git status --porcelain | wc -l`)
6. Show `NEXT_TIME.md` entry count if the file exists

End with a one-line recommendation: "Next: run `/setup-step S0`" or "Finish current branch first".

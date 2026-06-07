---
description: Code-review the diff of a completed setup step against its acceptance criteria. Delegates to the code-reviewer agent.
argument-hint: <step-id>
allowed-tools: Agent, Bash, Read, Glob, Grep
---

You are about to code-review the diff that implemented setup step $ARGUMENTS.

Steps:

1. Find the step file: `specs/05-setup/*-$ARGUMENTS-*.md` and read its acceptance criteria
2. Determine the branch that implemented the step (`git branch --list "*$ARGUMENTS*"` or ask the user if ambiguous)
3. Run `git diff main...<branch>` (or `git diff` if the user is on the branch) — capture the changed files
4. Spawn the **code-reviewer** subagent and pass it:
   - The list of changed files
   - The step's acceptance criteria (verbatim from the spec)
   - The branch name
   - An instruction: "Review this diff against the acceptance criteria. Report per your standard format."
5. Surface the report to the user verbatim
6. If 🔴 blockers exist, recommend NOT merging until they're addressed

If $ARGUMENTS is missing or not a valid step ID (S0–S7), respond:
"Pass a step id S0–S7, e.g., `/review-step S0`."

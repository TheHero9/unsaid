---
description: Run a numbered setup step from specs/05-setup/. Pass the step identifier (S0–S7) as an argument. Delegates to the setup-step-runner agent.
argument-hint: <step-id>
allowed-tools: Agent, Read, Bash, Glob, Grep
---

You are about to execute setup step $ARGUMENTS for the Feed app.

Steps:

1. Find the step file: `specs/05-setup/*-$ARGUMENTS-*.md` (e.g., for `S0`, the file is `01-S0-scaffold.md`; for `S3`, `04-S3-uploads.md`)
2. Read it. Confirm prerequisites are done (check the Status fields of prior steps)
3. Spawn the **setup-step-runner** subagent and pass it the full path of the step file plus an instruction: "Execute this setup step end-to-end per the file's spec. Do not commit. Report back per your operating loop."
4. When the subagent returns, surface its report verbatim to the user
5. If any acceptance criterion failed, do NOT mark the step Done. Help the user diagnose

If $ARGUMENTS is missing or not a valid step ID (S0–S7), respond:
"Pass a step id S0–S7, e.g., `/setup-step S0`."

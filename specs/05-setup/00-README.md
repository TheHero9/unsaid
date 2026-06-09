# Nondit - Setup Roadmap

One-day build. **Always keep a working slice** - each step ends runnable.
Run a step with `/setup-step S<N>`; check progress with `/status`; verify
with `/verify`; review with `/review-step S<N>`.

| #  | Title                                          | Status     | File                    |
| -- | ---------------------------------------------- | ---------- | ----------------------- |
| S0 | App shell + dark theme + landing + deploy      | âœ… Done (deploy: separate session) | 01-S0-shell.md          |
| S1 | Data model: `u_*` migrations + codes + types   | âœ… Done    | 02-S1-data-model.md     |
| S2 | Organizer: create event, pitches, codes + QR   | âœ… Done    | 03-S2-organizer.md      |
| S3 | Juror: join by event code + pitch list         | âœ… Done    | 04-S3-juror-join.md     |
| S4 | ðŸ¦¸ Capture screen (HERO #1)                    | âœ… Done    | 05-S4-capture.md        |
| S5 | ðŸ¦¸ Founder feedback view (HERO #2)             | âœ… Done    | 06-S5-founder-view.md   |
| S6 | Polish both heroes + seed script + E2E smoke   | âœ… Done (deploy rehearsal: separate session) | 07-S6-polish-seed.md    |
| S7 | (Stretch, only if time) connect flag           | ðŸ§Š Stretch | 08-S7-stretch.md        |

## Sequencing notes

- S2 depends on S1 (needs tables + code generators)
- S3/S4/S5 each depend on the previous - the demo loop is complete after S5
- After S5: **the core loop is demoable end to end** - everything after is
  polish. If time runs short, cut from the bottom, never from S4/S5 quality
- S6 ends with FREEZE: load realistic seed data, rehearse the demo arc
  (`SPECS.md` Â§ Demo arc), stop building

## Per-step file contract

Each step file has: Status field, ðŸŽ¯ Goal, ðŸ“‹ Prerequisites, âœ… Acceptance
criteria, ðŸ“ copy-paste Prompt, ðŸ§ª Verification. Mark `Status: âœ… Done` +
update `AGENTS.md` "Current State" when a step lands.

# Unsaid - Setup Roadmap

One-day build. **Always keep a working slice** - each step ends runnable.
Run a step with `/setup-step S<N>`; check progress with `/status`; verify
with `/verify`; review with `/review-step S<N>`.

| #  | Title                                          | Status     | File                    |
| -- | ---------------------------------------------- | ---------- | ----------------------- |
| S0 | App shell + dark theme + landing + deploy      | ✅ Done (deploy: separate session) | 01-S0-shell.md          |
| S1 | Data model: `u_*` migrations + codes + types   | ✅ Done    | 02-S1-data-model.md     |
| S2 | Organizer: create event, pitches, codes + QR   | ✅ Done    | 03-S2-organizer.md      |
| S3 | Juror: join by event code + pitch list         | ✅ Done    | 04-S3-juror-join.md     |
| S4 | 🦸 Capture screen (HERO #1)                    | ✅ Done    | 05-S4-capture.md        |
| S5 | 🦸 Founder feedback view (HERO #2)             | ✅ Done    | 06-S5-founder-view.md   |
| S6 | Polish both heroes + seed script + E2E smoke   | ✅ Done (deploy rehearsal: separate session) | 07-S6-polish-seed.md    |
| S7 | (Stretch, only if time) connect flag           | 🧊 Stretch | 08-S7-stretch.md        |

## Sequencing notes

- S2 depends on S1 (needs tables + code generators)
- S3/S4/S5 each depend on the previous - the demo loop is complete after S5
- After S5: **the core loop is demoable end to end** - everything after is
  polish. If time runs short, cut from the bottom, never from S4/S5 quality
- S6 ends with FREEZE: load realistic seed data, rehearse the demo arc
  (`SPECS.md` § Demo arc), stop building

## Per-step file contract

Each step file has: Status field, 🎯 Goal, 📋 Prerequisites, ✅ Acceptance
criteria, 📝 copy-paste Prompt, 🧪 Verification. Mark `Status: ✅ Done` +
update `AGENTS.md` "Current State" when a step lands.

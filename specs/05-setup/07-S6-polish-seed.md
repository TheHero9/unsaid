# S6 - Polish both heroes + seed script + E2E smoke + FREEZE

Status: âœ… Done (Vercel deploy + real-phone rehearsal handled by a separate session)

## ðŸŽ¯ Goal

"This is where the product wins or loses" - polish the two hero screens,
load realistic demo data, smoke the whole loop, rehearse, STOP BUILDING.

## ðŸ“‹ Prerequisites

- S5 done (core loop demoable)

## âœ… Acceptance criteria

1. Polish pass on capture + founder screens: spacing, type hierarchy, touch
   feedback (active states), loading/pending states, any jank found in the
   S5 walk-through fixed
2. `scripts/seed-demo.mts` (`npm run seed:demo`): creates one realistic
   event (~6 pitches with plausible names/descriptions), ~5 jurors,
   believable mixed feedback (chips + notes) on at least 3 pitches - prints
   ALL codes (organizer, public, each private) to the console. Idempotent
   enough: each run creates a fresh event
3. Playwright E2E smoke (`tests/e2e/core-loop.spec.ts`): create event â†’ add
   pitch â†’ join as juror â†’ capture chips + note â†’ founder page shows them.
   Runs against the dev server, green on chromium-desktop + chromium-mobile
4. Access-model checks in the same spec: public event surface exposes no
   feedback; a wrong private code 404s
5. `npm run build` green; deployed to Vercel; demo arc rehearsed on real
   phones against prod
6. Anything tempting but new goes to `NEXT_TIME.md`, not into code

## ðŸ“ Prompt

```
Read AGENTS.md, SPECS.md (Demo arc + judging criteria), and the S5 walk-through
notes first.

Execute setup step S6 for Nondit per specs/05-setup/07-S6-polish-seed.md:

1. Polish: review the capture screen and founder view against SPECS.md's
   hero descriptions on a 390px viewport. Fix hierarchy, spacing, tap
   states, pending states. No new features.
2. scripts/seed-demo.mts using the admin client (tsx, service role from
   .env.local): one event, ~6 plausible pitches, ~5 jurors, realistic
   feedback distribution (one pitch heavily reviewed, one with zero
   feedback for the empty state). Print a tidy code sheet. Add
   "seed:demo": "tsx scripts/seed-demo.mts" to package.json.
3. tests/e2e/core-loop.spec.ts per the acceptance criteria - use the real
   UI, not API shortcuts, on both Playwright projects.
4. Run the full gate: typecheck, lint, test, test:e2e, build. Fix what
   breaks.
5. List what you'd polish next WITHOUT doing it -> NEXT_TIME.md.

Do not commit. Report with a confidence assessment.
```

## ðŸ§ª Verification

- `npm run seed:demo` â†’ open the printed founder code on a phone â†’ page sells itself
- Full gate green; prod deploy rehearsed end to end (the demo arc from SPECS.md)

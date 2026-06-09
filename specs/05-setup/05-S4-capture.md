# S4 - ðŸ¦¸ Capture screen (HERO #1)

Status: âœ… Done

## ðŸŽ¯ Goal

The screen the product lives or dies on during the event: chips + optional
note, instant feel, used one-handed on a phone in a ~1-minute gap.

## ðŸ“‹ Prerequisites

- S3 done (juror identity + pitch list)

## âœ… Acceptance criteria

1. `/e/[eventCode]/p/[pitchId]`: gated on a valid juror cookie for this
   event (else redirect to `/e/[eventCode]`); 404 if the pitch isn't in
   this event
2. Chips grid: default chips + THIS juror's custom chips. Sentiment-coloured
   (green/red/neutral tones on the dark theme - distinguishable, not garish),
   min 44px tap targets, instant optimistic toggle, selected state obvious
   (filled + check icon vs outline)
3. "Add your own" chip: inline input + sentiment picker (3-way toggle) â†’
   server action upserts into `u_chips` by (event_id, normalized label) -
   on label collision reuse the existing chip; new chip appears selected
4. One-line note input (single-line, ~200 char cap, counter near the limit)
5. Submit: server action validates juror âˆˆ event, pitch âˆˆ event, â‰¥1 chip or
   non-empty note; inserts `u_feedback` + `u_feedback_chips`; sonner success;
   clears selection + note but STAYS on the pitch (juror may add more);
   back-link to the pitch list is always visible
6. Submitting feels instant (optimistic UI w/ pending state on the button;
   on failure â†’ toast error, state preserved)
7. Vitest for any pure helpers (label normalization). Typecheck + lint green

## ðŸ“ Prompt

```
Read AGENTS.md, SPECS.md (Capture screen section - HERO #1), and
specs/03-architecture/01-architecture.md first. This is the most important
screen in the product - polish interaction details.

Execute setup step S4 for Nondit per specs/05-setup/05-S4-capture.md:

1. /e/[eventCode]/p/[pitchId]/page.tsx - Server Component: resolve event,
   verify juror cookie, fetch pitch (must belong to event, else notFound),
   fetch chips (created_by IS NULL OR created_by = juror_id), pass to a
   client CaptureScreen component.
2. components/capture/: ChipButton (sentiment variants via cva), ChipsGrid,
   AddChipInline, NoteInput, CaptureScreen orchestrating local state.
3. Sentiment colours as CSS-variable tokens in globals.css (chip-positive,
   chip-negative, chip-neutral) - dark-theme friendly.
4. lib/labels.ts - pure normalizeLabel() (lower, trim, collapse spaces) +
   vitest.
5. Server actions: addCustomChip (upsert by normalized label) and
   submitFeedback (validate juror/pitch/event triangle server-side; insert
   feedback + junction rows in one logical operation; reject empty
   submissions). Zod v4 on every input.
6. Header: pitch name + back chevron to the list. Submit = full-width sticky
   bottom button on mobile.
7. NO emojis in UI - lucide icons only. No new state libraries - local
   useState + useTransition is enough.

Do not commit. Typecheck + lint + test, report with confidence assessment.
```

## ðŸ§ª Verification

- Phone viewport: tap 3 chips + note + submit in <10 seconds, feels instant
- Custom chip persists after refresh and across pitches (same juror)
- Two jurors' custom chips don't leak to each other
- Empty submission blocked with a friendly message

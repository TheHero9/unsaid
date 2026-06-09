# S3 + S4 - Decisions Summary (juror join, pitch list, capture screen)

Status: âœ… Done - branch `20260607-s3-s4-juror-capture`

## Cookie convention (juror identity)

- **Per-event cookie**, not a single global one. Name: `Nondit_juror_<event_id>`
  (helper: `jurorCookieName(eventId)` in `lib/cookies.ts`). Value = `u_jurors.id`.
- Attributes: `httpOnly: true`, `path: "/"`, `sameSite: "lax"`,
  `secure` only in production (so it works on `http://localhost`),
  `maxAge: 86400` (24h, `JUROR_COOKIE_MAX_AGE`).
- **Deviation from `specs/03-architecture/01-architecture.md`** which described a
  single `Nondit_juror=<juror_id>` cookie. The S3 step file and data model both
  scope a juror to exactly one event (`u_jurors.event_id`), so a per-event cookie
  lets one browser hold a distinct identity per event without collisions, and
  every read is verified with `.eq("event_id", event.id)`. This is the safer,
  more correct shape and matches the S3 acceptance criteria verbatim.

## Access model (the rule that must not break)

- The entire `/e/[eventCode]` tree NEVER SELECTs from `u_feedback` /
  `u_feedback_chips` for reading. The only references are INSERT/DELETE inside
  the capture submit action. Reading stays exclusively behind `/f/[privateCode]`.
- Every server action re-resolves the capability triangle server-side:
  event (from `public_code`) â†’ juror (from the per-event cookie) â†’ pitch
  (`.eq("event_id", event.id)`). Client-supplied ids are never trusted for authz.
  `resolveContext()` returns null on any failure and does not leak which leg failed.

## Capture chip rules

- Grid loads `created_by IS NULL OR created_by = <jurorId>` via a single
  `.or("created_by.is.null,created_by.eq.<id>")` filter - defaults + this juror's
  own chips only; other jurors' custom chips never leak.
- Custom-chip upsert stores the **normalized** label (`normalizeLabel`:
  lower / trim / collapse-spaces) so the DB unique index on
  `(event_id, lower(trim(label)))` and our app-level dedupe agree. On insert
  unique-violation we re-select and reuse the existing row (keeping its original
  sentiment), then the new/existing chip appears in the grid already selected.
- Submit verifies every submitted `chip_id` belongs to the event AND is default
  or owned by the juror before inserting; requires >= 1 chip OR a non-empty note;
  note trimmed, stored NULL when empty. Junction-insert failure best-effort rolls
  back the orphan `u_feedback` row (no DB transaction wrapper in v1).

## UI / interaction

- `ChipButton` uses `cva` compound variants over the `chip-*` sentiment tokens:
  selected = filled muted bg + coloured border/text + lucide `Check`; unselected =
  outline. 44px+ tap target, `active:scale-[0.97]` press feedback, optimistic
  pure-local toggle (no server round-trip to select).
- Submit = full-width sticky bottom button with `useTransition` pending state.
  On success: sonner toast + clear selection/note, STAY on the pitch. On failure:
  toast error, state preserved.
- Pitch row: full-row overlay `Link` (z-0) for capture navigation; the slides
  `ExternalLink` anchor is a sibling at z-10 (not nested) so it opens a new tab
  without triggering row navigation and without invalid nested-anchor HTML.
- No new state libraries (useState + useTransition only). No emojis - lucide only.

## Files

- `lib/cookies.ts`, `schemas/juror.ts`, `schemas/feedback.ts`
- `app/e/[eventCode]/` - `page.tsx`, `actions.ts`, `JoinCard.tsx`,
  `EventNotFound.tsx`, `PitchRow.tsx`
- `app/e/[eventCode]/p/[pitchId]/` - `page.tsx`, `actions.ts`
- `components/capture/` - `ChipButton.tsx`, `ChipsGrid.tsx`, `AddChipInline.tsx`,
  `NoteInput.tsx`, `CaptureScreen.tsx`

No new pure helper was needed beyond the existing `normalizeLabel` (already
vitest-covered in `lib/labels.test.ts`).

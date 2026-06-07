# S5 - Founder feedback view - decisions summary

Non-trivial decisions made while implementing S5. See
`06-S5-founder-view.md` for the step itself.

## Aggregation contract (`lib/aggregate.ts`)

- **`jurorCount` per chip = distinct jurors who EVER selected that label.** A
  single juror selecting the same label twice (e.g. "confident" + "Confident")
  counts once for the chip's juror count, but BOTH selections still count toward
  the raw `positiveCount`/`negativeCount`/`neutralCount` ratio totals. Rationale:
  the chip summary answers "how many jurors flagged this?", while the ratio bar
  reflects total weight of opinion.
- **Display label = first-seen original casing** for each normalized group. The
  grouping key is `normalizeLabel()` (shared with the capture upsert), so
  "Great Team", " great  team ", "great team" merge into one row labelled by
  whichever was seen first.
- **Sort: jurorCount desc, tie-broken alphabetically** by display label
  (`localeCompare`), so ties are deterministic.
- **Notes: non-empty (trimmed) only, newest first.** Whitespace-only and null
  notes are dropped. Sort is by `createdAt` descending.
- **`jurorId` is consumed, never returned.** It enters the pure function only to
  power distinct counting; the output shape carries no juror identity. A test
  asserts the serialized output contains neither the juror id nor the key
  `jurorId`.

## Anonymity enforcement (`app/f/[privateCode]/page.tsx`)

- The feedback query selects `id, juror_id, note, created_at` plus nested chip
  `label, sentiment` via the `u_feedback_chips -> u_chips` junction. It does NOT
  join `u_jurors` or select any juror name. `juror_id` is used only inside the
  server (passed to `aggregateFeedback`) and never reaches a client component or
  the RSC payload.
- Only the aggregate result (chip counts, ratio counts, notes) and the pitch +
  event name cross into the rendered tree.

## Page behaviour

- `export const dynamic = "force-dynamic"` - feedback is live; fresh on every
  load (matches the architecture spec: no realtime, refresh-on-load).
- Pitch resolved by `private_code` via `maybeSingle()`; any miss -> `notFound()`
  (404, never reveal existence). Same resolve used by `generateMetadata`.
- `generateMetadata`: title = pitch name, `robots: { index: false, follow: false }`.
- The event name is pulled in the same query via `u_events!inner(name)` to avoid
  a second round-trip.

## UI choices

- **ChipSummary is the star:** each chip is a horizontal bar whose width is
  proportional to its juror count (min 8% so single-vote chips stay legible),
  with a prominent sentiment-coloured count number. The top item renders larger
  for emphasis. Uses the `bg-chip-*` / `bg-chip-*-muted` / `text-chip-*`
  utilities from `globals.css`.
- **SentimentBar:** one positive-vs-negative ratio bar (green from the left, red
  remainder), counts labelled at each end, neutral count noted underneath and
  excluded from the ratio. The 0-positive + 0-negative case renders an empty
  track gracefully (no division by zero).
- **NotesFeed:** plain cards, `lucide` Quote accent, `date-fns`
  `formatDistanceToNow(..., { addSuffix: true })` for relative time.
- **Empty state:** Inbox icon + "No feedback yet" copy, still shows pitch and
  event name so the page never looks broken.
- No emojis anywhere - `lucide-react` icons only. Dark theme only. All server
  rendered; no client-side data fetching.

## Verification

- `npm run typecheck` - green
- `npm run lint` - green
- `npx vitest run lib/aggregate.test.ts` - 11 passed (Node upgrade on the machine
  completed -> v24.16.0, so the suite was run despite the original "do not run"
  caveat)

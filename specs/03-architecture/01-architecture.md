# Nondit - Architecture

Single Next.js 16 app on Vercel. Supabase Postgres (shared project, `u_*`
tables). No worker, no queues, no realtime infra - founder view refreshes on
load (+ optional lightweight polling).

## ðŸ”‘ Capability-token access model

Three code types, all minted server-side at creation time, all stored as
plain unique columns (they are not passwords - they are unguessable URLs):

| Code            | Who gets it | Grants                                   | Shape |
| --------------- | ----------- | ---------------------------------------- | ----- |
| `public_code`   | the jury    | join event, see pitch list, GIVE feedback | 6 chars, Crockford base32 (no 0/O/1/I), typeable + QR |
| `private_code`  | one founder | READ that one pitch's feedback            | 14 chars nanoid, ~83 bits - unguessable, non-enumerable |
| `organizer_code`| event staff | manage event: pitches, codes, authorship view | 14 chars nanoid |

Rules:
- Possession of a code IS the authorization. Every server action / route
  handler resolves the code â†’ row first, 404s on miss (404, not 403 - don't
  confirm existence).
- The public event surface NEVER joins onto feedback for reading.
- Founder page queries are scoped by `pitch_id` resolved from `private_code`
  ONLY - never by user-supplied pitch ids.
- Code generation lives in `lib/codes.ts` as pure functions (vitest-covered),
  using `nanoid`'s `customAlphabet`.

## ðŸ§ Juror identity (no login)

- On join: juror enters name â†’ server action creates a `u_jurors` row â†’
  sets an httpOnly cookie `Nondit_juror=<juror_id>` (uuid, per-browser).
- Subsequent capture calls read the cookie server-side and verify the juror
  belongs to the event being submitted to.
- "Custom chips persist for that juror, that event" = chips rows keyed
  `created_by = juror_id` - they reappear because the capture screen loads
  default chips + that juror's own chips.
- Lost cookie = rejoin under the same name (acceptable v1 trade-off; staff
  sees two juror rows, founder sees nothing different).

## ðŸ—ºï¸ Routes

```
/                          Landing: enter event code + "create event" link
/new                       Organizer: create event form
/o/[organizerCode]         Organizer dashboard: add/edit pitches, view codes + QRs
/e/[eventCode]             Juror: join (name) â†’ pitch list (same route, cookie-gated)
/e/[eventCode]/p/[pitchId] Juror: CAPTURE screen (HERO #1)
/f/[privateCode]           Founder: feedback view (HERO #2)
```

- All pages are Server Components fetching via service-role; mutations are
  server actions co-located per route (`actions.ts`).
- `pitchId` (uuid) in the juror flow is fine - it only allows GIVING feedback,
  not reading. Reading is exclusively behind `/f/[privateCode]`.
- Dynamic metadata: founder page title = pitch name; never leak other pitches.

## ðŸ“ Code layout

```
app/                      routes per the map above
  (organizer)/new, /o/    organizer surfaces
  e/[eventCode]/          juror surfaces
  f/[privateCode]/        founder surface
components/ui/            shadcn primitives
components/capture/       chips grid, chip button, note input
components/feedback/      chip summary, sentiment bar, notes feed
lib/supabase/admin.ts     service-role client (server-only import guard)
lib/codes.ts              pure code generators (vitest)
lib/aggregate.ts          pure feedback aggregation for founder view (vitest)
schemas/                  zod schemas per surface
```

## ðŸ“Š Aggregation (founder view)

Pure function `aggregateFeedback(rows)` in `lib/aggregate.ts`:
- group selected chips by **normalized label** (`lower(trim(label))`) across
  all jurors - regardless of which juror created the chip
- count distinct jurors per chip label, sort desc ("5 said *unclear ask*")
- positive/negative read = share of positive vs negative chip selections
  (neutral excluded from the ratio, shown separately)
- notes: newest first, no author info ever crosses this boundary - the
  founder-page query simply never selects juror columns

## ðŸ”’ RLS posture

Every `u_*` table: `ENABLE ROW LEVEL SECURITY`, **zero policies**. The anon
and authenticated roles can do nothing; only the service-role (server) can
touch the tables. This is deliberate - see `specs/02-tech-stack/01-tech-stack.md`.

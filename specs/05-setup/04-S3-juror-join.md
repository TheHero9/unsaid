# S3 - Juror: join by event code + pitch list

Status: ✅ Done

## 🎯 Goal

A juror scans/types the public event code, gives their name once, and lands
on the pitch list - the springboard into the capture screen.

## 📋 Prerequisites

- S2 done (events + pitches exist)

## ✅ Acceptance criteria

1. `/e/[eventCode]`: resolves `public_code` (case-insensitive → store/compare
   uppercase); unknown → branded "event not found" with a retry input
2. No juror cookie for this event → join card: event name + single name
   input → server action creates `u_jurors` row + sets httpOnly cookie
   `unsaid_juror_<event_id>=<juror_id>` (path `/`, maxAge ~24h) → same route
   now shows the pitch list
3. Cookie present + valid → pitch list directly: pitch name, optional
   description (1-2 lines), slides link out (if present, opens new tab),
   ordered by `position`; each row links to `/e/[eventCode]/p/[pitchId]`
4. The juror surface NEVER queries feedback for reading - verify no such
   query exists in this route tree
5. Landing-page code input from S0 now actually lands here correctly
6. Mobile-first: big tap rows; typecheck + lint green

## 📝 Prompt

```
Read AGENTS.md, SPECS.md (Juror capture flow steps 1-2), and
specs/03-architecture/01-architecture.md (juror identity section) first.

Execute setup step S3 for Unsaid per specs/05-setup/04-S3-juror-join.md:

1. /e/[eventCode]/page.tsx - Server Component: resolve event by UPPER(code)
   via admin client; branded not-found state on miss. Read the
   unsaid_juror_<event_id> cookie; verify the juror row exists AND belongs
   to this event; otherwise render the join card.
2. Join: one name input (zod: 1-60 chars, trimmed) → server action inserts
   u_jurors, sets the httpOnly cookie, revalidates the route.
3. Pitch list: tap-friendly rows (min 56px), pitch name prominent,
   description muted, external slides link with lucide ExternalLink icon
   (stopPropagation so the row link still works), ordered by position.
4. Add the event name + a subtle "you're giving feedback as <name>" line.
5. Keep all data access server-side via the admin client. No feedback reads
   anywhere in this tree.

Do not commit. Typecheck + lint, then report with a confidence assessment.
```

## 🧪 Verification

- Join on phone viewport → cookie set → refresh lands on pitch list directly
- Second browser = separate juror identity
- Wrong/garbage event code → friendly not-found, retry works

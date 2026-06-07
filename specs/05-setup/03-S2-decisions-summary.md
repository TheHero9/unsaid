# S2 - Organizer flow: decisions summary

Non-trivial decisions made while implementing S2 (organizer create-event +
dashboard). See `03-S2-organizer.md` for the acceptance criteria.

## Server actions return a result object; success uses `redirect()`

- `createEventAction` returns `{ ok: false, error }` only on failure. On
  success it calls `redirect()` (which throws the Next redirect signal), so it
  never resolves with a success value. The client form treats a falsy result as
  "redirecting" and only surfaces an error when `result.ok === false`.
- `addPitchAction` / `deletePitchAction` return `{ ok, error? }` and rely on
  `revalidatePath("/o/<organizerCode>")` to refresh the dashboard list.

## Authorization = organizer_code, re-resolved on every action

- Every mutation takes the `organizer_code` (never an `event_id`) and resolves
  it to an event id server-side via `resolveEventId()`.
- `deletePitchAction` scopes the delete by BOTH `id = pitch_id` AND
  `event_id = <resolved>`, so a stray pitch id from the client cannot delete
  another event's pitch.
- Unknown organizer code on the dashboard → `notFound()` (404, never 403 - do
  not confirm existence), per the capability-token model.

## Code-collision retries

- `public_code` (6-char, smaller space) and `private_code` (14-char) inserts
  retry up to 8 attempts on a Postgres unique-violation (`23505`), regenerating
  the code each loop. Other DB errors fail fast with a generic message.

## `position` = max existing + 1

- New pitch position = `(max(position) ?? -1) + 1` (first pitch gets 0). No
  reorder UI in v1; list is ordered by `position ASC`.

## QR codes rendered server-side

- `QRCode.toDataURL` runs in the RSC (`app/o/[organizerCode]/page.tsx`),
  producing a data URL rendered via a plain `<img>` (with an
  `eslint-disable-next-line @next/next/no-img-element` since data URLs are not
  served through `next/image`).
- Dark-theme styling: white modules (`dark: "#ffffff"`) on a transparent ground
  (`light: "#00000000"`), placed on a `bg-muted/40` card so it stays scannable.
- `export const dynamic = "force-dynamic"` on the dashboard - codes/pitches are
  always fresh, never statically cached.

## Validation

- zod schemas in `schemas/event.ts` and `schemas/pitch.ts` are shared by the
  react-hook-form resolver (client) AND re-run server-side via `safeParse` in
  the actions.
- Optional text fields accept `""` and are normalised to `null` before insert.
- `slides_url` must match `^https://` when present; `founder_email` validated
  with zod's email check when present.

## Files

- `schemas/event.ts`, `schemas/pitch.ts` - zod v4 schemas
- `app/new/page.tsx` + `app/new/actions.ts` - create-event form + action
- `app/o/[organizerCode]/page.tsx` + `actions.ts` - dashboard + pitch actions
- `components/organizer/CreateEventForm.tsx`, `AddPitchForm.tsx`,
  `DeletePitchDialog.tsx`, `CopyButton.tsx`

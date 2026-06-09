# Flow B - Implementation Plan

> Builds the founder self-serve flow decided in `01-two-flows.md`. The engine
> (capture screen, founder feedback view, all `u_*` tables) is reused untouched.
> Flow B is a new setup surface + a founder management screen.

## 🧱 What gets built

| # | File | What |
| --- | --- | --- |
| 1 | `schemas/founder.ts` | `createFounderPitchSchema` (pitch name + optional one-liner + optional slides) |
| 2 | `app/new/actions.ts` | `createFounderEventAction` - create event + seed chips + insert ONE pitch, redirect to `/p/[manageCode]` |
| 3 | `components/founder/FounderPitchForm.tsx` | founder create form |
| 4 | `components/founder/CreateFlowChooser.tsx` | the fork: "Running an event" vs "Pitching yourself" |
| 5 | `app/new/page.tsx` | render the chooser instead of `CreateEventForm` directly |
| 6 | `app/p/[manageCode]/page.tsx` | founder management/share screen (NOT a dashboard) |
| 7 | `app/o/[organizerCode]/actions.ts` | chip/criteria actions also `revalidatePath('/p/<code>')` so they refresh the founder screen |

## 🔑 Key design choices

- **The event's `organizer_code` IS the founder's manage code.** `/p/[manageCode]`
  resolves the event by `organizer_code` - same authorization model as the
  organizer dashboard, no new column, no new code type.
- **A Flow B event is structurally a normal event with one pitch.** No schema
  change. `event.name` = the pitch/product name.
- **Chip/criteria management is reused** (`ChipManager`, `CriteriaManager`) -
  same server actions, they now revalidate both `/o/<code>` and `/p/<code>`.
- **Three things on the manage screen:** (1) a prominent "save this page" warning
  (no login), (2) the public QR to show the room, (3) a button to view their own
  feedback. Plus chip/criteria managers.

## ✅ Acceptance

- `/new` shows two clear setup choices; founder path asks only for a pitch name.
- Submitting creates an event + 1 pitch + default chips, lands on `/p/[code]`.
- The manage screen shows: save-this-page warning, public share QR/code, a
  "View my feedback" button to `/f/[privateCode]`, and chip/criteria managers.
- Adding/removing a chip or criterion on `/p/[code]` refreshes without a reload.
- Jurors scanning the public QR reach the capture screen for the single pitch.
- The founder's feedback link opens their anonymous page (existing engine).
- `npm run typecheck` + `npm run lint` + `npm run build` green.

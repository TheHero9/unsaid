# Two Flows - Organizer & Founder

> The product has **two entry points into the same engine**. Same tables, same
> capture screen, same founder feedback view - only the *setup* differs. This
> spec documents both, what's built, and the gap to close before the founder
> flow is usable.
>
> Source: `SPECS.md` ("It generalizes: an event is a container of N pitches"),
> landing page `app/page.tsx` ("Two ways to run it - Model A / Model B").

---

## 🧭 The mental model

An **event** is a container of N pitches.

- **N = many** → a competition / demo day / accelerator batch.
- **N = 1** → a single founder pitching (to a VC, at an open mic, anywhere).

Both are the *same data shape* and the *same screens*. What changes is **who
creates the event and how many pitches it holds**. That difference is the whole
distinction between the two flows.

---

## 🅰️ Flow A - The Organizer runs it (BUILT ✅, tested ✅)

**Who:** event staff / competition organizer.
**Shape:** one event, many pitches (one per startup).
**Status:** 🟢 built end-to-end, walked manually, E2E green. **This is the flow
used for the event on the 11th.**

### Steps

1. Organizer opens `/new`, fills **event name + date + location**, submits.
2. `createEventAction` mints a public code + organizer code, seeds default chips,
   redirects to `/o/[organizerCode]` (the dashboard).
3. On the dashboard the organizer:
   - shares the **public event QR / code** with the jury (`/e/[publicCode]`),
   - **adds a pitch per startup** (each gets its own private code),
   - optionally edits event-wide chips + rating criteria,
   - hands each **founder their private link** `/f/[privateCode]` (QR shown).
4. Jurors scan → join → tap chips, rate, leave a note per pitch.
5. Each founder opens their private link → sees their own anonymous page.

### Routes involved

| Route | Role | Purpose |
| --- | --- | --- |
| `/new` | organizer | create event form |
| `/o/[organizerCode]` | organizer | dashboard: codes, pitches, chips, criteria |
| `/e/[eventCode]` | juror | join + pitch list |
| `/e/[eventCode]/p/[pitchId]` | juror | capture screen (HERO #1) |
| `/f/[privateCode]` | founder | feedback view (HERO #2) |

---

## 🅱️ Flow B - The Founder brings it (NOT built ⏳)

**Who:** a single founder, no organizer in the room.
**Shape:** one event, **exactly one pitch (themselves)**.
**Status:** 🔴 **not built as a dedicated experience.** Today a founder *could*
limp through Flow A (create an event, then add themselves as the one pitch, then
dig their own private link out of the organizer dashboard) - but that is clunky,
exposes organizer-only concepts, and was **never tested**.

### Target steps (what it should feel like)

1. Founder opens a founder-specific entry (e.g. `/pitch/new` or a "Pitching
   yourself?" branch on `/new`), enters **just their pitch name** (+ optional
   one-liner / slides).
2. One action creates an event **with a single pitch already inside it** and
   takes the founder to a **combined "share + unlock" screen**, not the full
   organizer dashboard.
3. That screen shows two things, clearly separated:
   - **Share with the room** → the public capture QR/code (`/e/[publicCode]`).
   - **Your private feedback link** → `/f/[privateCode]`, with a strong
     "bookmark this / this is the only way back to your feedback" warning.
4. Audience/judges scan the public QR → capture screen for the one pitch.
5. Founder opens their private link → feedback view.

### Why it's a distinct flow, not just "Flow A with N=1"

- **No organizer concepts.** A founder should never see "add another pitch",
  "manage criteria for everyone", or a list of other people's private links.
- **The private link is theirs and critical.** In Flow A staff delivers it; in
  Flow B the founder *is* the recipient, so the share screen must make the
  private link impossible to lose (it's the only door back - there is no login).
- **One screen, not a dashboard.** The founder wants: "give me the QR to show the
  room, and the link to see my results." Two QR codes, done.

---

## 🔍 Gap analysis - what Flow B needs

Everything below the setup layer **already exists and is reused as-is**: the
capture screen, the founder feedback view, chips, criteria, aggregation, the
access model, the data tables. Flow B is almost entirely a **new setup/onboarding
surface** on top of the existing engine.

| # | Gap | Type | Notes |
| --- | --- | --- | --- |
| 1 | Founder entry point + form (pitch name only) | New route + form | e.g. `/pitch/new`; reuse `CreateEventForm` patterns |
| 2 | One action: create event **+ seed single pitch** atomically | New server action | wraps `createEventAction` logic + one `u_pitches` insert |
| 3 | Founder "share + unlock" screen | New route/view | NOT the organizer dashboard; two QR codes (public + private) |
| 4 | Strong "save your private link" affordance | UX | the only way back; no login |
| 5 | Landing-page CTA wiring | Wiring | Model B card currently points at LinkedIn "early access", not the flow |
| 6 | Decide: default chips/criteria for a solo founder | Decision | seed the same defaults? let founder pick? (see open questions) |

### Reuse map (do NOT rebuild these)

- `lib/codes.ts` - public + private code minting.
- `lib/chips.ts` `DEFAULT_CHIPS` - default chip seed.
- `app/e/[eventCode]/p/[pitchId]` - capture screen.
- `app/f/[privateCode]` - founder feedback view.
- `u_events` / `u_pitches` / `u_chips` / `u_criteria` / `u_feedback*` - same schema, **no migration needed**. A Flow B event is just an event with one pitch.

---

## 🗄️ Data model impact

**None expected.** A Flow B event is structurally identical to a Flow A event
that happens to hold one pitch. If we later want to *remember which flow created
an event* (for analytics or to branch the share screen), the lightest option is a
nullable `created_via` text column on `u_events` (`'organizer' | 'founder'`) -
**deferred until there's a reason**, per the build philosophy.

---

## ✅ Decisions (answered 2026-06-09)

1. **Entry point shape:** **fork on `/new`.** A first step asks "Running an
   event?" vs "Pitching yourself?", then shows the matching form. No separate
   route.
2. **Chips/criteria for solo founders:** **seed the same defaults AND give the
   founder the same management UI the organizer has** (`ChipManager` /
   `CriteriaManager`), so they can tune what the jury reacts to before sharing.
3. **Share-screen warning (private link):** **🟡 Prominent.** A bordered warning
   callout + one-tap "Copy my private link" button, explicitly telling the
   founder to **save / screenshot the link** - because there is **no login** and
   the link is the only way back to their feedback. Not a blocking modal (no
   forced friction), just impossible to miss. See `[[founder-link-recovery]]`
   gap below.
4. **Does the 11th touch this?** No - the 11th uses **Flow A**, which is built.
   Flow B is after / in parallel, not a blocker.

### ⚠️ Known limitation feeding this decision

There is **no account / login / email recovery** in v1. A founder who loses their
private link is locked out of their own feedback permanently. The prominent
"save your link" warning is a **stopgap**, not a fix. A proper recovery path
(email the link, or a lightweight founder account) is tracked in `NEXT_TIME.md`.

---

## 📌 Status summary

| Flow | Setup surface | Engine (capture + feedback) | Tested |
| --- | --- | --- | --- |
| 🅰️ Organizer | ✅ built | ✅ built | ✅ yes |
| 🅱️ Founder | ✅ built (2026-06-09) | ✅ reused | ⏳ awaiting user test |

**Built (Flow B, 2026-06-09):** `/new` now forks (organizer vs founder);
`createFounderEventAction` creates a single-pitch event + default chips;
`/p/[manageCode]` is the founder management/share screen (save-this-page
warning, public QR, "view my feedback" button, chip/criteria managers). Engine
untouched. See `02-implementation-plan.md`. typecheck/lint/build green.

**Next:** user tests **both** flows on the 11th and reports observations (polish
items land here or in `NEXT_TIME.md`).

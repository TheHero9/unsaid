# Unsaid — Product Build Brief

> Hand this to Claude Code as the product definition. **Decide the stack,
> architecture, data model, and routes yourself** — they're not specified here on
> purpose. Preserve every product decision and rule below; refine the rest.
> One-day build, small team. Anything not listed here is OUT of v1.

---

## What we're building

A pitch-feedback tool that captures everything jurors notice during a pitch —
including the critical observations they'd normally soften or leave out — and
delivers it to the founder as one clean, visual page.

**Why it matters:** at pitch events, founders mostly get polite, positive feedback.
The honest, useful, critical stuff gets swallowed for the sake of politeness, or
never delivered at all when there's no mutual interest. Every juror forms real
judgments during every pitch that currently get thrown away. We capture all of it
and route it to the founder.

**It generalizes:** an event is just a container of N pitches. N = many is a
competition. N = 1 is a founder's 1-on-1 pitch to a VC. Same product, same screens.
Build the general "event with pitches" shape; the 1-on-1 case comes for free.

---

## Who uses it (3 roles)

- **Organizer / staff** — creates an event, adds the pitches, gets the codes to share.
- **Juror** — gives feedback on pitches. The primary capture user.
- **Founder** — reads only their own pitch's feedback. The payoff user.

(A peer/attendee role is a later stretch, not v1.)

---

## Access model — the one rule that must not break

There are **two separate ways in**, because they do different jobs:

1. **A public, give-feedback way in (the event).** This is shared openly with the
   jury — shown on a screen, passed around. Anyone who has it can _give_ feedback.
   It must **not** let anyone _read_ a founder's consolidated feedback.

2. **A private, read-your-feedback way in (per pitch).** Each pitch has its own
   private link/code that the staff delivers only to that founder. It opens _only_
   that founder's feedback page.

Hard requirements:

- A founder can only ever see **their own** feedback, never another pitch's.
- A random person must **not** be able to reach any founder's feedback — the private
  link must be **unguessable and non-enumerable** (no "next/previous pitch" by counting).
- The public event entry never exposes feedback for reading.

Delivery of the private link is staff's choice (email to the founder, or handed over
in person). For a live demo, showing the private code/QR on screen and opening it
directly must work without depending on email arriving.

---

## Flows

### Organizer setup

1. Create an event (name, date, location).
2. Add the pitches. Each pitch has: **product name** (required), **description**
   (optional), **slides link** (optional — e.g. a Google Drive link), and optionally
   the **founder's email** for delivering their private link.
3. Get the shareable codes: one public event code for the jury, and one private
   per-pitch code for each founder.
4. Share the event code with the jury; deliver each founder their private code.

### Juror capture

1. Enter via the event code, give your name.
2. See the list of all pitches in the event.
3. Tap whichever pitch is being presented right now — the juror chooses; there's no
   automatic "current pitcher." (If the slides link exists, make it reachable here.)
4. On the capture screen: tap chips and optionally add a one-line note. Submit.
5. Can come back and add more — to the same pitch or others — anytime during the event.

### Founder

1. Enter via their private per-pitch link — no name entry, no login. The link is the key.
2. Land directly on their feedback page (see below).

---

## Capture screen (HERO #1 — give it the most care)

This is used live, under time pressure (~4-min pitches, ~1-min gaps), on a phone.

- **Chips** are the primary input — one tap each, big tap targets, instant feel.
- A chip's selected/unselected state must be obvious and immediate.
- Chips are **sentiment-coloured** (positive / negative / neutral) so capture stays fast.
- The juror can **add their own custom chip on the fly**; once added it stays available
  to that juror for the rest of the event.
- An **optional one-line note** below the chips. Nobody writes paragraphs live.
- Submitting must feel instant and never lose the juror's place in the flow.

## Founder feedback view (HERO #2 — the visible payoff)

This is the "oh, nice" moment: scattered taps from many jurors become one clean page.

- **Top: a chip summary** — how many jurors used each chip, most-used first
  (e.g. "5 said _unclear ask_").
- **A clear positive-vs-negative read** of the overall feedback at a glance.
- **Below: the freeform notes**, newest first.
- Everything here is **anonymous to the founder** — never show who said what.
- A good-looking, confident, mobile-friendly page. This screen is what sells the product.

---

## Chips

- The event starts with a sensible **default set** so it's usable out of the box,
  e.g.: _unclear ask, strong traction, rushed delivery, weak market size, confident,
  great team, good demo._ (Refine the list.)
- Every chip is **positive, negative, or neutral**.
- Jurors can add their own chips during capture (persist for that juror, that event).
- The founder view aggregates by chip **meaning/label**, regardless of who created it.

---

## Behaviour rules (don't violate)

- **Anonymous to the founder.** The founder never sees which juror said what.
- **Visible to the organizer.** Staff _can_ see authorship (no true anonymity needed in v1).
- **Live is fine.** Feedback can appear to the founder as soon as it's submitted — no
  draft/approval/refine step in v1.
- **No moderation, no quality gates** in v1 — trust the professional jury.
- **Mobile-first everywhere.** Everyone arrives by scanning a code on their phone.

---

## Screens (v1)

1. Organizer: create event + add pitches + view the codes to share.
2. Juror: join (enter name).
3. Juror: pitch list.
4. **Juror: capture screen** (chips + note) — HERO.
5. **Founder: feedback view** — HERO.

Founders need no join screen; their private link opens straight to screen 5.

---

## In scope (v1)

Event setup → juror capture (custom + default chips, sentiment, optional note) →
founder consolidated, visual, anonymous feedback view → the two-way access model above.

## Out of scope (do NOT build)

- Any "current pitcher" auto-selection, organizer advance button, or live sync machinery.
- Named-vs-anonymous per-note toggles or a separate refine-and-publish phase.
- AI summarisation of feedback.
- Scoring, ranking, or score normalisation.
- Moderation / quality gates.
- Peer/attendee feedback (→ stretch).
- An "I'd like to connect" founder↔juror flag (→ stretch; strongest one, cheap once the
  core loop works — consider only if time remains).

---

## Build order (always keep a working slice)

1. **Skeleton + setup** — create an event, add pitches, generate the public event code
   and private per-pitch codes. Get it deployed somewhere early.
2. **Capture screen (HERO #1)** — pitch list → pick a pitch → chips (default + add-custom,
   sentiment) → optional note → submit.
3. **Founder feedback view (HERO #2)** — open via private link → aggregated chip summary,
   positive/negative read, notes feed, anonymous, good-looking. Core loop now demoable end to end.
4. **Polish the two hero screens** — this is where the product wins or loses.
5. **Stretch, in order** — peer feedback → connect flag.
6. **Freeze + seed** — load realistic pitch names and plausible feedback, rehearse, stop building.

---

## Demo arc (end on the payoff)

1. Tell the story in ~30s: founders leave with only polite feedback; the useful, honest
   part gets discarded. We recover it.
2. Show a juror on the **capture screen** tapping chips on a pitch, fast.
3. A second juror adds different chips + a note to the same pitch.
4. Open that founder's **private feedback page**: the scattered taps from several jurors
   become one clean, visual, anonymous summary.

The scattered → consolidated transform is the moment. End on the founder screen.

---

## Judging criteria it must hit

- **Usefulness** — recovers feedback founders currently never get.
- **Execution** — capture works at real pitch speed; the founder page genuinely looks good.
- **Clarity** — one loop: capture → deliver. Nothing else on screen.
- **Potential for real use** — built for this competition's exact format, runnable as-is,
  and the same tool works for any 1-on-1 VC pitch. Bigger market than it first looks.

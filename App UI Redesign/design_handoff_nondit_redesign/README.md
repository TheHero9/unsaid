# Handoff: Nondit Redesign (juror capture · founder feedback · organizer dashboard)

## Overview

Nondit captures the honest feedback jurors form during a pitch but never say, and delivers
it to each founder as one clean, anonymous page. An event holds N pitches (N = many =
competition, N = 1 = solo VC pitch — same screens). **There is no login anywhere.** Access
is by code only:

- A **public event code** lets anyone _give_ feedback but never _read_ it.
- Each pitch has a **private, unguessable, non-enumerable code** that opens only that
  founder's results.

This package is a full visual + UX redesign of the three hero surfaces — **juror capture**
(the priority), **founder feedback**, and **organizer dashboard** — all **mobile-first**.

> **North star:** a judge with zero spare attention can land on the live pitch, tap what they
> noticed, and jump to the next startup in seconds, one-handed — while the founder later opens
> a page that feels like a clean, honest gift.

## About the design files

The files in `prototype/` are **design references created in HTML/React-in-Babel** — they
show the intended look, layout, and behavior. **They are not production code to copy
directly.** Your task is to **recreate these designs in the target codebase** using its
established stack and patterns.

The brief specifies the intended stack: **Next.js (App Router) + React + Tailwind CSS v4 +
shadcn/ui + lucide-react icons**, dark theme only. If that app already exists, slot these
screens into it using existing components/tokens. If it doesn't, scaffold it with that stack.
Do **not** ship the prototype's inline-styled JSX as-is — it uses inline styles and a global
`window` module pattern purely so it runs from a single static HTML file. Re-express every
screen as real components with Tailwind classes / shadcn primitives and the tokens below.

The prototype renders inside a simulated iPhone frame (`ios-frame.jsx`) and adds a top
"role navigator" (Juror / Founder / Organizer tabs). **Both the device frame and the role
navigator are prototype scaffolding only — do not build them.** In the real app each surface
is its own route, reached by code, with no role switcher and no device chrome.

The original product owner's brief is included verbatim at `../original-brief.md` — read it; it
is the source of truth for intent, copy voice, and hard constraints.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, sentiment palette, interactions, and
copy are all decided. Recreate pixel-accurately using the codebase's libraries. Where the
prototype uses a serif display face and a specific dark palette, match them exactly (tokens
below).

---

## Routes / Screens

| Screen | Route | Who | Access |
| --- | --- | --- | --- |
| Juror join | `/e/[eventCode]` | Anyone with the public code | public, give-only |
| Juror capture (**hero**) | `/e/[eventCode]/p/[pitchId]` | Juror, mid-pitch | public, give-only |
| Founder feedback | `/f/[privateCode]` | One founder | private, read-only, `noindex`, force-dynamic |
| Organizer dashboard | `/o/[organizerCode]` | Organizer | private |
| Create event/pitch fork | `/new` | Organizer or solo founder | — |

The juror **list** route `/e/[eventCode]` is merged into capture as the join step + the
in-capture pitch switcher; a juror never has to parse a separate list.

---

## Screen 1 — Juror join (`/e/[eventCode]`)

**Purpose:** one-field entry, then drop the juror straight onto the live pitch's capture
screen. Re-entry is frictionless — if a name is already stored, skip this screen entirely and
land on capture.

**Layout:** single column, 22px side padding, vertically centered content block with a pinned
full-width primary button at the bottom (above the home indicator).

**Components (top → bottom):**
- **Live eyebrow:** a 7px pulsing red dot + `LIVE NOW` — Inter 12px/700, letter-spacing
  .08em, color `--neg`.
- **Event eyebrow:** event name uppercased, 13px/600, `--text-3`.
- **H1:** "You're judging **{livePitchName}**." — serif display, 44px, weight 600,
  line-height 1.02, letter-spacing −0.02em, `--text`.
- **Body:** "Tap what you notice as each founder pitches. It's anonymous — they only ever see
  the totals, never who said what." — 15.5px/1.5, `--text-2`, max-width 320px.
- **Field:** label "YOUR NAME" (uppercase 12.5px/700 `--text-3`) + text input, 52px tall,
  radius 13px, `--surface-2` bg, 1px `--border-2`, 16px text. Enter submits.
- **Primary button:** "Start judging" + arrow-right icon, 54px tall, radius 14px. Enabled =
  `--text` bg / `--bg` text; disabled = `--surface-3` bg / `--text-4` text. No login, no other
  fields.

**Behavior:** on submit, store the juror's name (see State) and navigate to the live pitch's
capture route.

---

## Screen 2 — Juror capture (`/e/[eventCode]/p/[pitchId]`) — THE HERO

The #1 success metric is **switching pitches in ≤1 tap without leaving the capture context.**
Three concurrent mechanisms provide this; build all three.

**Overall layout:** a fixed-height column inside the viewport:
1. **Sticky pitch switcher** (top, non-scrolling)
2. **Scrollable capture body** (middle, `flex: 1`, vertical scroll)
3. **Fixed submit bar** (bottom, non-scrolling, above home indicator)

### 2a. Sticky pitch switcher
A row of three controls + a progress strip beneath:
- **Prev / Next arrows:** 44×44px, radius 12px, `--surface-2` bg, 1px `--border`, chevron
  icons. Disabled (40% opacity) at the ends of the list.
- **Center pill (tap target):** 44px tall, radius 12px, `--surface-2` / 1px `--border`,
  full-width. Contents: a leading status — if this pitch is live, a pulsing red dot + `LIVE`
  (10.5px/700, `--neg`); otherwise the order index as mono `03/08` (`--text-3`) — then the
  pitch name in **serif 19px/600** (ellipsis if long), then a chevron-down. Tapping opens the
  Jump sheet (2d).
- **Progress strip:** one thin (3px) segment per pitch. Current = `--text`; already-submitted
  = `--pos`; not-yet = `--border-strong`.

### 2b. Capture body (scrollable)
- **Pitch meta:** one-liner (14.5px/1.45 `--text-2`) + founder name (13px `--text-4`).
- **"Tap what you noticed"** section label (uppercase 12.5px/700 `--text-3`) with a right-side
  hint ("the priority" → switches to "{n} selected" once chips are tapped). Then a wrapped
  flex of **sentiment chips** (see Components: Chip). Chips are grouped/ordered positive →
  neutral → negative. After the org chips comes any juror-added custom chips (each removable)
  then an **"add your own"** dashed chip.
- **"Rate the pitch"** section label, hint "optional · tap again to clear". For each criterion:
  a row with the criterion name (14.5px/600) + the current value as mono `4/5` (or `—`), then a
  **1–5 segmented rating** (see Components: Rating).
- **"Add a one-line note"** section label, hint "optional". Single-line text input, 50px,
  radius 12px, `--surface-2` / 1px `--border`, placeholder "One honest sentence they'd never
  hear otherwise…".

### 2c. Fixed submit bar
- Left status text (12.5px `--text-3`): "Tap a chip to start" → "{noticed} noticed · {rated}
  rated" → "Submitted".
- Primary button "**Submit & next**" (or "Update & next" if already submitted) + send icon,
  52px tall, radius 14px, `--text`/`--bg`, disabled `--surface-3`/`--text-4` until at least one
  chip, rating, or note exists.
- **On submit:** mark this pitch submitted, show a toast, then **auto-advance** to the next
  un-submitted pitch (wrap around). If all pitches are submitted, the toast reads "All caught
  up — every pitch logged." and no advance happens.

### 2d. "Jump to pitch" bottom sheet
Opened from the center pill. A bottom sheet (radius 22px top corners, `--surface`, 1px top
border, dim backdrop). Header "Jump to pitch" (17px/700) + close button. Scrollable list, one
row per pitch:
- A 30px square index badge — shows the order number, OR a green check on `--pos-wash` if the
  juror has already submitted that pitch.
- Pitch name (serif 17px/600) + a `LIVE` pill if it's the live pitch + founder name (12.5px
  `--text-3`).
- Right side: "done" (`--pos`) or "—" (`--text-4`).
- Current pitch row is highlighted (`--surface-3`, 1px `--border-2`).
Tapping a row closes the sheet and switches to that pitch instantly (no page reload feel; in
Next.js use client-side nav / shared layout so the switcher persists).

### 2e. Swipe
Horizontal swipe on the capture body goes prev/next: trigger when horizontal travel > ~64px
and dominates vertical (`|dx| > |dy| * 1.5`), so it never fights vertical scroll. Switching
pitches plays a short horizontal slide (transform only — see Animations).

**Hard rule:** the juror NEVER sees aggregated totals or other jurors' feedback on any juror
surface. Each pitch's capture state is independent and preserved while switching.

---

## Screen 3 — Founder feedback (`/f/[privateCode]`)

**Purpose:** the emotional payoff. Fully anonymous — no juror identity, no ranking, no winner.
Single scrollable column, 22px side padding. Keep the information architecture; elevate the
proportional chip summary into the unmistakable hero.

**Header:**
- Event name eyebrow (12px/700 uppercase `--text-3`).
- Pitch name **H1** — serif 38px/600, line-height 1.02, letter-spacing −0.02em.
- A **share** button top-right (42px, radius 12px, `--surface-2`/1px `--border`) that flips to a
  green check briefly on tap. (Optional per brief — included as a subtle affordance only.)
- "Feedback from {n} jurors" with a users icon (13.5px/500 `--text-3`).

**HERO summary (the "aha"):**
- **Verdict eyebrow:** a colored dot + one of "Mostly positive" / "A mixed read" / "Mostly
  critical" (13px/700). Color = `--pos` / `--neu` / `--neg`. Logic: `posShare = positiveChipCount
  / (positive + critical)`; ≥0.62 positive, ≤0.38 critical, else mixed.
- **Headline read:** serif 27px/1.18, e.g. "Jurors noticed your **{top positive chip}**, and
  flagged the **{top critical chip}**." — the named chips are colored `--pos` / `--neg` inline.
- **Proportional stacked bar:** 12px tall, radius pill, three segments sized by total
  positive / neutral / critical chip counts, colored `--pos` / `--neu` / `--neg`, 2px gaps.
- Beneath it, the counts: "{x} positive" `--pos`, "{y} neutral" `--neu`, "{z} critical"
  `--neg`.

**"What jurors noticed" (chip bars):** ranked by count, one row each (46px, radius 12px,
`--surface` / 1px `--border`). Each row has a proportional fill from the left in the chip's
`--*-wash` with a 2px `--*` right edge (width = count / maxCount). Inside: the count in mono
700 tinted to the sentiment, then the chip label (14.5px/500). Custom juror chips merge in by
label.

**"Scores":** section label, hint "1–5 average". For each criterion: name + mono average like
`4.3/5` (or `—`), and a thin (6px) progress bar (`--text` fill on `--surface-3` track) at
`average/5`.

**"Notes ({n})":** stacked quote cards (radius 13px, `--surface`/1px `--border`), each with a
quote icon, the note text (14.5px/1.45), and a relative timestamp (12px `--text-4`).

**Empty state** (0 jurors): centered users icon in a circle, "No feedback yet", and a calm
explanatory line. No data, no fake numbers.

Footer line: "Anonymous by design. No names, no ranking — just the honest read, handed back to
you."

---

## Screen 4 — Organizer dashboard (`/o/[organizerCode]`)

**Purpose:** set up the event and hand out codes. **Hierarchy is the redesign** — what they
hand out comes first; configuration is demoted into collapsible sections. Single scrollable
column, 18px side padding.

**Header:** "NONDIT" eyebrow, event name **H1** (serif 34px/600), then "📅 {date} · {n}
pitches" (calendar icon, 13px `--text-3`).

**HERO card — the codes** (`--surface` / 1px `--border-2`, radius 18px, 14px padding):
- A segmented toggle: **Event code** | **Founder links** (each 36px, radius 9px; active =
  `--surface-3` + 1px `--border-2`).
- **Event code view:** "Hand this to the room" + give-only explainer ("Anyone with this code
  can give feedback. They can never read it."). Centered: "EVENT CODE" micro-label (11px/700,
  tracking .14em), the code in **mono 38px/700, letter-spacing .18em**, a QR code on a white
  tile (radius 12px). Then a row: the url in mono inside a field + a copy icon button; then a
  full-width "Copy code" button. Copy buttons flip to a green check + "Copied" for ~1.3s.
- **Founder links view:** explainer "Each pitch gets a private link only its founder can
  open…", then one compact row per pitch: small QR tile + pitch name (serif 16px/600) + the
  private url in mono (`nondit.app/f/{code}`, truncated) + a "Copy founder link" icon button.

**Pitches** (collapsible, open by default): count badge; one row per pitch — order badge,
name (serif 16px/600) + `LIVE` pill on the live one, founder name, a delete icon. Below, an
"Add a pitch" dashed button that expands an inline form (Product name, One-liner, Founder
email) with Cancel / Add pitch.

**Configuration** (demoted; small uppercase divider label "CONFIGURATION"):
- **Feedback chips** (collapsible, count badge): the full chip set rendered in their sentiment
  colors (wash bg + tone text + tone border), each with a small delete affordance. Subtitle
  "What every juror taps to react".
- **Rating criteria** (collapsible, count badge): list rows (sliders icon + name + delete).
  Subtitle "1–5 scales founders see averaged".

Each collapsible: 16px radius card, header is a 34px icon tile + title + count pill + subtitle
+ chevron that flips up/down when open.

---

## Interactions & behavior

- **Pitch switching (juror):** arrows, jump sheet, and swipe all call the same `goTo(index)`.
  Switching resets scroll to top and plays a 0.28s horizontal slide. In a real app, keep the
  switcher in a shared layout so it never reloads.
- **Submit → auto-advance:** on submit, mark submitted, toast ~1.7s, then after ~0.48s advance
  to the next un-submitted pitch (modulo length). All-done shows the "all caught up" toast.
- **Chip toggle:** tap toggles selected; selected shows a check + sentiment wash/border/text;
  press feedback scale 0.96. "Add your own" lets the juror pick a sentiment (pos/neu/neg swatch)
  and type a label; it appears as a selected, removable chip.
- **Rating:** cumulative 1–5; tapping value `n` fills 1..n; tapping the current head value
  clears to none.
- **Copy buttons (organizer):** `navigator.clipboard.writeText`, flip to check + "Copied" for
  1.3s.
- **Share (founder):** flips icon to check ~1.4s (wire to Web Share API / copy link in real app).
- **Collapsibles (organizer):** expand/collapse; chevron flips.

## Animations & transitions

Easing `cubic-bezier(.2,.8,.2,1)`. All entrance/position animations are **transform-only**
(never animate opacity from 0 on resting content — the resting state must always be visible):
- Pitch slide: `translateX(±26px) → 0`, 0.28s. Apply the class only during a transition, then
  clear it (don't leave it on at rest).
- Bottom sheet: `translateY(22px) → 0`, 0.32s.
- Toast: small pop, 0.3s.
- Founder chip bars: `translateY(7px) → 0`, 0.4s.
- Live dot: 1.8s pulsing box-shadow ring.
- Hover/press: chip press scale 0.96 / 0.08s; buttons darken, no lift. Honor
  `prefers-reduced-motion`.

## State management

No accounts. Identity is the code in the URL + a locally-stored juror name.

- **Juror (client/local):** `{ name, currentPitchIndex, feedbackByPitch }` where each pitch's
  feedback is `{ chips: string[], custom: {label, sentiment}[], ratings: {criterionId: 1..5},
  note: string, submitted: boolean }`. The prototype persists this to `localStorage`
  (`nondit-juror-v2`); in production this is the juror's submissions for the event. A juror may
  update a previously-submitted pitch.
- **Submission:** persists a juror's chips/ratings/note for one pitch under the public event
  code. Server must enforce **give-only**: this endpoint never returns aggregates.
- **Founder page:** server aggregates all submissions for the pitch behind the private code →
  chip counts (by id, + custom by label), per-criterion score arrays (→ averages), notes with
  timestamps, juror count. Returns **no** identities. `force-dynamic`, `noindex`.
- **Organizer:** event (name, date, public code), pitches (name, founder, one-liner, private
  code), the chip set (label + sentiment), the criteria set.

---

## Design tokens

Dark theme only. Hex/values are exact.

### Color
```
--bg:            #0a0a0c   /* app background (near-black) */
--surface:       #131316   /* cards */
--surface-2:     #18181d   /* inputs, pills, raised */
--surface-3:     #212128   /* selected / strongest raised */
--border:        rgba(255,255,255,0.08)
--border-2:      rgba(255,255,255,0.14)
--border-strong: rgba(255,255,255,0.22)
--text:          #fafafa
--text-2:        #b6b6c0
--text-3:        #84848f
--text-4:        #57575f

/* sentiment — the through-line; identical on juror chips and founder summary */
--pos:   #4ade80   --pos-wash: rgba(74,222,128,0.12)   --pos-bd: rgba(74,222,128,0.42)   --pos-faint: rgba(74,222,128,0.22)
--neg:   #f87171   --neg-wash: rgba(248,113,113,0.12)  --neg-bd: rgba(248,113,113,0.42)  --neg-faint: rgba(248,113,113,0.22)
--neu:   #60a5fa   --neu-wash: rgba(96,165,250,0.12)   --neu-bd: rgba(96,165,250,0.42)   --neu-faint: rgba(96,165,250,0.22)
```
`positive = green`, `negative = red`, `neutral = blue`. On juror chips the sentiment color
appears on the selected state (border + wash + text + check); unselected chips use a faint
sentiment-tinted border.

### Typography
- **Display / headings:** a serif — prototype uses **Newsreader** (Google Fonts), weights 500
  & 600. Use it for H1s, pitch names, and verdict headlines. (Substitute the codebase's
  established serif if it has one.)
- **Body / UI:** **Inter** (400/500/600/700).
- **Codes & numeric:** **JetBrains Mono** (500/700) — event code, private links, `4/5`, order
  indices, averages. Wide letter-spacing on the big event code (.18em).
- Sizes used: hero H1 44, founder H1 38, organizer H1 34, verdict 27, section labels 12.5
  uppercase /700 tracking .05em, body 14.5–16, micro 11–12.

### Spacing (4px base)
4, 8, 12, 16, 22 (screen side padding), 24, 28 (section gaps), 32, 48. Tap targets ≥ 44px.

### Radius
Pills/chips 999px · inputs & buttons 12–14px · cards 16–18px · QR tiles 12px · index badges
8–10px · sheet top corners 22px.

### Shadows
Flat. Borders before shadows. Only the device/sheet/toast use a soft drop shadow
(`0 12px 40px rgba(0,0,0,.5)` for the toast). No glow, no colored shadows.

---

## Assets

- **Icons:** lucide-react — used: chevron-left/right/up/down, check, check-check, plus, x,
  send, users, tag, sliders(-horizontal), quote, share, copy, trash2, pencil, calendar,
  sparkles, badge-check, info, search, arrow-right. (The prototype hand-rolls equivalent SVG
  paths in `nondit-ui.jsx` because it can't import the package; in the app use lucide-react
  directly.)
- **QR codes:** the prototype draws a **decorative placeholder** QR (deterministic pattern with
  finder squares). In production, generate **real** QR codes from the actual URLs (e.g.
  `qrcode` / `qrcode.react`), dark modules on a white tile.
- **Fonts:** Newsreader, Inter, JetBrains Mono — Google Fonts (or `next/font`).
- No photography, no illustration, no emoji anywhere in the UI.

## Files in this bundle

- `prototype/Nondit Redesign.html` — entry; loads the modules below, defines all CSS tokens &
  animations, mounts the role navigator + device frame (both scaffolding).
- `prototype/nondit-data.jsx` — sample event, chips (with sentiment), criteria, 8 pitches, and
  pre-seeded aggregate feedback. Use as a content/shape reference for your data model.
- `prototype/nondit-ui.jsx` — shared primitives: `Icon` (svg paths), `QRCode` (placeholder),
  helpers (`avg`, `sum`).
- `prototype/nondit-juror.jsx` — `Chip`, `Rating`, `Switcher`, `JumpSheet`, `AddChip`,
  sentiment map.
- `prototype/nondit-capture.jsx` — `JoinScreen`, `CaptureBody`, `JurorSurface` (state, swipe,
  submit→auto-advance, persistence).
- `prototype/nondit-founder.jsx` — `FounderSurface`, `aggregate()`, `StackBar`, header/share.
- `prototype/nondit-organizer.jsx` — `OrganizerSurface`, `CopyBtn`, `Collapsible`.
- `prototype/nondit-app.jsx` — prototype shell / role navigator (**do not build**).
- `prototype/ios-frame.jsx` — simulated device bezel (**do not build**).
- `original-brief.md` — the product owner's full brief (intent, voice, hard constraints).

## Hard constraints (do not break)

- Mobile-first, single narrow column (~390px), one-thumb reachable, 44px targets. Desktop is at
  most a centered narrow column.
- Dark theme only; no light mode, no theme flash. Sentiment palette identical on juror + founder.
- Access model: public code = give only; private code = read only. Juror surfaces never render
  aggregates or others' feedback. Founder page never shows juror identity. No login UI anywhere.
- No ranking, no winners, no leaderboard. Nondit hands feedback back to the founder.
- shadcn/ui + Tailwind v4 + lucide-react; no new component library; no emoji in rendered UI.
- Copy is operational and sentence-cased; eyebrows uppercase. Keep the exact strings above.

## How to run the prototype

Open `prototype/Nondit Redesign.html` in a browser (it loads React + Babel from a CDN). Use the
top tabs to view each surface; on Juror, enter a name to reach the capture screen, then use the
arrows / center-pill sheet / swipe to switch pitches and "Submit & next" to advance.

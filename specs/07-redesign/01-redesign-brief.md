# 🎨 Nondit - Unified Redesign Brief

> Status: 🟡 Draft (pre-images). Refine the visual specifics once screenshots land.
> Scope: a holistic visual + UX redesign of the three hero surfaces - juror capture,
> founder feedback, organizer dashboard - with **mobile-first as a hard constraint**.
> This is a polish + restructure, NOT a framework change.

## 0. Context (read first)

**Nondit** captures the honest feedback jurors form during a pitch but never say, and
delivers it to each founder as one clean, anonymous page. An event holds N pitches
(N = many = competition, N = 1 = solo VC pitch - same screens). **No login anywhere** -
access is by code only: a public event code lets anyone _give_ feedback but never _read_
it; each pitch has a private, unguessable, non-enumerable code that opens only that
founder's results.

> 🚨 **Mobile-first is absolute.** ~100% of real usage is on a phone, often one-handed,
> standing in a room while a pitch is happening live. Design for a 390px viewport as the
> primary and only target. Desktop is at most a centered narrow column - never a layout we
> optimize. Every interactive element must be reachable with one thumb and be >= 44px.

## 1. Priorities (in order)

1. **🌟 Juror speed.** Judges have almost no time and must hop between pitches _fast_.
   Switching from one startup to the next must cost no more than a single tap. This is the
   #1 success metric of the whole redesign.
2. **Founder payoff.** The feedback page is the emotional reward - make it feel clean,
   confident, and worth the wait.
3. **Organizer clarity.** Setup should be fast and the codes/QRs they hand out must be the
   most prominent thing.

## 2. Design system (keep + elevate)

- 🌑 **Dark theme only.** Near-black background, slightly lighter cards, near-white text.
  No light mode, no theme flash. (Tokens live in `app/globals.css`.)
- 🟢🔴🔵 **Sentiment is the core visual language.** Positive = green, Negative = red,
  Neutral = blue/slate. Each has a strong tone (text/border) + a low-alpha muted wash
  (fills). This palette must read identically on the juror chips and the founder summary -
  it is the through-line of the product. (`chip-*` tokens.)
- 📐 Generous rounding (`rounded-xl`/`2xl`), 44px+ tap targets, subtle press-scale
  feedback, `lucide-react` icons only (never emoji in UI).
- 🔤 Big bold tracking-tight headings; muted `text-sm` for secondary text; monospace +
  wide letter-spacing for codes.
- 🧩 Keep shadcn/ui + Tailwind v4 tokens.

## 3. Screen-by-screen direction

### 🌟 A. Juror capture - the hero, fix this hardest

**Routes:** `/e/[eventCode]` (join + pitch list) and `/e/[eventCode]/p/[pitchId]` (capture).

**Today:** to change pitches a juror must submit -> back -> scan the list -> tap the next
pitch -> wait for a fresh page load. That round-trip is the core problem.

**Redesign goals:**

- **Always-present pitch switcher.** A juror should jump to any pitch in <= 1 tap without
  leaving the capture context - e.g. a sticky top dropdown/sheet of pitches, prev/next
  arrows, or swipe. Show which pitch is "live now."
- **One-thumb layout.** Primary actions (chips, submit) in the lower 2/3 of the screen.
  Submit stays a fixed bottom bar.
- **Less scrolling per pitch.** Chips are the priority action and must be visible
  immediately; ratings + note should be reachable without a long scroll (compact or
  progressively reveal them).
- **Fast cold-start.** Each pitch opens ready to tap - chips front and center, zero
  ceremony.
- **Keep:** sentiment-colored chip toggles with check state, "add your own" chip, 1-5
  segmented tap ratings (tap-again-clears), single-line note, "Your feedback" history of
  the juror's own submissions, and the give-but-never-read rule (a juror NEVER sees
  aggregated or other jurors' feedback here).
- **Join step:** keep it to one field (name), but make re-entry frictionless - once joined,
  a juror should land straight on the live pitch's capture screen, not a list they must
  parse.

### 🌟 B. Founder feedback - make it a moment

**Route:** `/f/[privateCode]` (private, noindex, force-dynamic).

**Keep the information architecture** (it works): "What jurors noticed" proportional
sentiment bars -> overall positive/negative read -> 1-5 criteria averages (+ jurors' own
criteria) -> anonymous notes feed -> empty state. **Stays fully anonymous** - no juror
identity, no ranking, no winner.

**Elevate:**

- Make the **proportional chip summary the unmistakable hero** of the page - it is the
  "aha."
- Give the page a confident top-of-page summary (the headline read at a glance) before the
  details.
- Mobile-first single column; everything thumb-scrollable.
- (Optional, flag - do not assume) a share/save affordance and a positive/critical toggle.

### C. Organizer dashboard - hierarchy over uniformity

**Routes:** `/new` (create fork), `/o/[organizerCode]` (dashboard).

**Today:** 6 near-identical stacked cards, long scroll, the QR/codes buried among config.

**Redesign goals:**

- **Surface what they hand out first:** the public event code + QR, and per-pitch private
  QR/links, should be the top, most prominent, most scannable elements.
- **Demote configuration** (chips, criteria) into collapsible/secondary sections so it
  does not compete with the codes.
- Keep both entry flows (organizer event vs solo founder) and the per-pitch private links -
  just make the dashboard scannable on a phone instead of an undifferentiated column.

## 4. Hard constraints (do not break)

- 📱 Mobile-first, single narrow column, one-thumb reachable, 44px targets.
- 🌑 Dark-only; sentiment palette consistent across juror + founder.
- 🔒 Access model: public code = give only; private code = read only. Juror surfaces never
  render aggregated or others' feedback. Founder page never shows juror identity. No login
  UI anywhere.
- 🚫 No ranking, no winners, no leaderboard - Nondit hands feedback _back to the founder_,
  it is not judging software.
- 🧩 shadcn/ui + Tailwind v4 + lucide icons; no new component library, no emoji in rendered
  UI.

## 5. The one-sentence north star

> Make it so a judge with zero spare attention can land on the live pitch, tap what they
> noticed, and jump to the next startup - all in seconds, one-handed - while the founder
> later opens a page that feels like a clean, honest gift.

## 6. Current structure reference (as-built, 2026-06-10)

| Screen              | Route                       | Role                          | State today                                    | Biggest opportunity                              |
| ------------------- | --------------------------- | ----------------------------- | ---------------------------------------------- | ------------------------------------------------ |
| Organizer dashboard | `/o/[code]`                 | Set up event, hand out codes  | Works; 6 stacked identical cards, long scroll  | Hierarchy - surface QR/codes first, collapse config |
| **Juror capture** 🌟 | `/e/[code]/p/[id]`          | Tap feedback live, mid-pitch  | Works; **slow to switch pitches**              | **Fast pitch-switching**, one-thumb, less scroll |
| Juror pitch list    | `/e/[code]`                 | Pick the live pitch           | Plain list                                     | Could merge into capture as a switcher           |
| Founder feedback    | `/f/[code]`                 | Read anonymous results        | Clean, polished, static                        | Make it a payoff moment; tabs/export             |

**Key components today:**

- Capture: `components/capture/` - `CaptureScreen`, `ChipsGrid` + `ChipButton`, `RatingRow`,
  `NoteInput`, `AddChipInline`, `AddCriterionInline`, `YourSubmissions`.
- Founder: `components/feedback/` - `ChipSummary` (proportional bars, the star), `SentimentBar`,
  `CriteriaScores`, `NotesFeed`.
- Organizer: `components/organizer/` - `CreateEventForm`, `AddPitchForm`, `ChipManager`,
  `CriteriaManager`, `DeletePitchDialog`, `CopyButton`; `components/founder/CreateFlowChooser` +
  `FounderPitchForm` for the `/new` fork.

## 7. Open questions (resolve with images)

- Pitch-switcher pattern: sticky dropdown vs swipe vs prev/next tabs - recommend after
  reviewing screenshots.
- Whether founder page gets a share/export affordance (out of v1 scope unless decided).

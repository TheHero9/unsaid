# NEXT_TIME.md - Deferred Tasks

Ideas and tasks deferred to a later stage. Grouped by topic.

## Stretch features (from SPECS.md, explicitly gated)

- **Date added:** 2026-06-07
- **Context:** v1 freeze after S6
- **Deferred:**
  - S7 "I'd like to connect" founder-juror flag (specs/05-setup/08-S7-stretch.md) - gated behind a human decision, NOT built
  - Peer/attendee feedback role
- **Reference:** SPECS.md "Out of scope", specs/05-setup/08-S7-stretch.md
- **Dependencies:** core loop shipped (done)

## Founder view polish

- **Date added:** 2026-06-07
- **Context:** S6 polish walk-through
- **Deferred:**
  - Lightweight polling / auto-refresh on the founder page (currently fresh on load only - force-dynamic)
  - Subtle entrance animation for chip bars (count-up / width grow) for the demo "wow"
  - Share/save-as-image button for founders
- **Reference:** specs/03-architecture/01-architecture.md (no realtime infra in v1)
- **Dependencies:** none

## Capture screen polish

- **Date added:** 2026-06-07
- **Context:** S6 polish walk-through
- **Deferred:**
  - Full optimistic submit (fire-and-forget with background retry) - current submit is a fast server action with pending state
  - Haptic feedback (navigator.vibrate) on chip toggle for live use
  - Recently-used chips sorting per juror
- **Dependencies:** none

## Organizer flow

- **Date added:** 2026-06-07
- **Context:** S2 build
- **Deferred:**
  - Email delivery of founder private links (founder_email is stored but unused - delivery is manual by design in v1, per the brief's email-dependency warning)
  - Pitch reordering (position = insertion order in v1)
  - "Copy full code sheet" button (all codes at once)
  - Edit pitch / edit event details
- **Reference:** SPECS.md "Delivery of the private link is staff's choice"
- **Dependencies:** an email provider decision (out of v1)

## Founder flow (Flow B) - link recovery

- **Date added:** 2026-06-09
- **Context:** designing Flow B (founder self-serve), `specs/06-flows/01-two-flows.md`
- **Deferred:**
  - Proper recovery for a founder's private feedback link - there is NO login in
    v1, so a founder who loses their link is locked out forever. v1 stopgap is a
    prominent "save / screenshot this link" warning on the share screen. A real
    fix = email the link on creation, or a lightweight founder account.
- **Reference:** specs/06-flows/01-two-flows.md (decisions 3 + known limitation)
- **Dependencies:** an email provider decision (same blocker as organizer email delivery)

## Engineering hardening

- **Date added:** 2026-06-07
- **Context:** S4/S5 review
- **Deferred:**
  - Wrap u_feedback + u_feedback_chips insert in a single Postgres function (RPC) for true atomicity (v1 does best-effort rollback in the action)
  - Rate limiting on join/submit actions (trusted-jury context in v1)
  - Juror cookie renewal / rejoin UX past the 24h maxAge mid-multi-day-event
  - Playwright trace-based check that the founder RSC flight payload contains no juror ids (currently asserted via rendered-HTML content checks in E2E)

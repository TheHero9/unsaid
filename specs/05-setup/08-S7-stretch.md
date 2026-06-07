# S7 - (Stretch) "I'd like to connect" flag

Status: 🧊 Stretch - only if time remains after S6 freeze

## 🎯 Goal

The strongest stretch from `SPECS.md`: a juror can flag "I'd like to connect"
on a pitch; the founder sees interest exists; the ORGANIZER brokers the
introduction (authorship is staff-visible by design).

## ⚠️ Gate

Do NOT start this unless S6 is fully done, frozen, rehearsed, and there is
genuinely time left. Peer/attendee feedback (the other stretch) stays in
`NEXT_TIME.md` regardless.

## ✅ Acceptance criteria (sketch - refine if actually built)

1. Capture screen: a distinct, separated "I'd like to connect" toggle
   (NOT mixed into the chips) persisted per (juror, pitch)
2. Founder view: "N jurors want to connect - ask the organizers" line when
   N > 0 (still anonymous)
3. Organizer dashboard: per-pitch list of WHO wants to connect (staff sees
   authorship)
4. Migration: `u_connect_flags` (juror_id, pitch_id, PK pair, created_at),
   RLS deny-all like everything else
5. Full gate green; the demo arc still rehearsed and unchanged

## 📝 Prompt

```
Read AGENTS.md and SPECS.md (stretch section) first. Confirm with me that S6
is frozen before touching anything.

Execute stretch step S7 for Unsaid per specs/05-setup/08-S7-stretch.md:
migration u_connect_flags (collision-check first, RLS deny-all), capture
toggle (separate visual zone from chips), founder interest line, organizer
authorship list. Keep it small; the demo must not regress.

Do not commit. Full gate + confidence assessment.
```

# Unsaid - Project Overview

> Source product brief: `SPECS.md` (repo root). That file is the product
> source of truth - this spec adds the build framing. Preserve every product
> decision and rule in `SPECS.md`.

## 🎯 Goal

A pitch-feedback tool that captures everything jurors notice during a pitch -
including the critical observations they'd normally soften or leave out - and
delivers it to the founder as one clean, visual, anonymous page.

**Generalizes:** an event is a container of N pitches. N = many is a
competition; N = 1 is a founder's 1-on-1 pitch to a VC. Same product, same
screens.

## 👥 Roles (3)

- **Organizer / staff** - creates an event, adds pitches, gets the codes to share
- **Juror** - gives feedback on pitches (primary capture user)
- **Founder** - reads only their own pitch's feedback (the payoff user)

## 🔑 Access model (the one rule that must not break)

1. **Public, give-feedback way in (the event)** - shared openly with the jury.
   Anyone with it can GIVE feedback. It must NOT let anyone READ feedback.
2. **Private, read-your-feedback way in (per pitch)** - unguessable,
   non-enumerable link delivered only to that founder. Opens ONLY that
   founder's feedback page.

Hard requirements:
- A founder only ever sees their own feedback
- Private links unguessable + non-enumerable (no next/prev by counting)
- Public event entry never exposes feedback for reading
- Live demo must work without email (show private code/QR on screen)

## 🦸 The two hero screens

1. **Juror capture screen** - chips (sentiment-coloured, one tap, big targets,
   add-custom-on-the-fly) + optional one-line note. Used live on a phone,
   ~4-min pitches, ~1-min gaps. Must feel instant.
2. **Founder feedback view** - chip summary (counts, most-used first), clear
   positive-vs-negative read, notes feed newest-first, fully anonymous,
   good-looking and mobile-friendly. This screen sells the product.

## ✅ In scope (v1)

Event setup → juror capture (default + custom chips, sentiment, optional note)
→ founder consolidated visual anonymous feedback view → the two-way access model.

## ❌ Out of scope (do NOT build)

- "Current pitcher" auto-selection / organizer advance button / live sync machinery
- Named-vs-anonymous toggles or a refine-and-publish phase
- AI summarisation
- Scoring, ranking, normalisation
- Moderation / quality gates
- Peer/attendee feedback (stretch)
- "I'd like to connect" founder↔juror flag (strongest stretch - only if time remains)

## 📋 Behaviour rules (don't violate)

- **Anonymous to the founder** - never show which juror said what
- **Visible to the organizer** - staff CAN see authorship (no true anonymity in v1)
- **Live is fine** - feedback appears to the founder as soon as submitted
- **No moderation, no quality gates** - trust the professional jury
- **Mobile-first everywhere** - everyone arrives by scanning a code on a phone

## 📍 Current State

- ✅ Repo scaffolded (Next.js 16 + TS + Tailwind v4 + shadcn, Vitest + Playwright)
- ✅ Specs written, setup roadmap at `specs/05-setup/00-README.md`
- ⏳ S0 pending

## 🗓️ Constraint

**One-day build.** Always keep a working slice (see build order in
`specs/05-setup/00-README.md`). Anything not in `SPECS.md` is OUT of v1 -
defer to `NEXT_TIME.md`.

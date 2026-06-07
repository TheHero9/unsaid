<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Feed - Project Guidance

This file provides guidance to Claude Code (claude.ai/code) when working with code in this workspace.

> 📖 **Read these first for full context (once they exist):**
>
> - `specs/01-overview/01-project-overview.md` - goal, non-goals, current state
> - `specs/02-tech-stack/01-tech-stack.md` - definitive tech stack decisions
> - `specs/05-setup/00-README.md` - the setup-step roadmap (vibe-coded build order)

## 🎯 Project Overview

**Unsaid** - a pitch-feedback tool that captures everything jurors notice during a pitch (including the critical observations they'd normally soften or leave out) and delivers it to the founder as one clean, visual, anonymous page. An event is a container of N pitches: N = many is a competition, N = 1 is a 1-on-1 VC pitch - same product, same screens.

> 📖 Product source of truth: `SPECS.md` (repo root). Build framing: `specs/01-overview/`. **One-day build** - anything not in `SPECS.md` is OUT of v1.

**The access model that must not break:** a public event code lets anyone GIVE feedback but never READ it; each pitch has a private, unguessable, non-enumerable code that opens ONLY that founder's feedback page. Codes are the only auth - there is NO login anywhere (see `specs/02-tech-stack/`).

**Two hero screens:** the juror capture screen (sentiment-coloured chips + optional one-line note, used live on a phone) and the founder feedback view (aggregated chip counts, positive/negative read, anonymous notes feed).

### 📍 Current State

- **Status:** 🟢 **v1 BUILT + FROZEN (S0-S6 done)** - core loop verified end to end (E2E green, demo loop walked); deploy handled by a separate session; S7 stretch NOT built (gated)

#### What's Done

- ✅ Repo scaffolded - Next.js 16.2.7 + TS strict + Tailwind v4 + shadcn (radix/nova, 14 primitives), Vitest + Playwright configured, deps installed
- ✅ Claude setup copied from remember-me (agents, commands, settings, Supabase MCP)
- ✅ Specs written: `01-overview`, `02-tech-stack`, `03-architecture`, `04-data-model`, `05-setup` roadmap (S0-S7)
- ✅ S0 - App shell: dark theme as base tokens (html class="dark", no light flash), landing with event-code input + /new link, branded not-found/error, sonner Toaster, Unsaid metadata, `chip-*` sentiment tokens in `app/globals.css`
- ✅ S1 - Data model: 6 `u_*` tables live in the shared Supabase project (migration `u_initial_schema`), RLS enabled with zero policies on all, every FK indexed, chips unique-label index, sentiment CHECK. `lib/codes.ts`, `lib/chips.ts`, `lib/labels.ts`, `lib/supabase/admin.ts`, `lib/supabase/database.types.ts` (validated against generated types; sentiment deliberately narrowed to the union). Advisors clean apart from the accepted RLS-no-policy INFO notices
- ✅ S5 - Founder feedback view (HERO #2): `lib/aggregate.ts` (+ vitest), `/f/[privateCode]` server page, `components/feedback/` (ChipSummary, SentimentBar, NotesFeed). Anonymous aggregation, force-dynamic, noindex
- ✅ S2 - Organizer flow: `/new` create-event form + action (codes minted, default chips seeded), `/o/[organizerCode]` dashboard (public code + per-pitch private links, server-rendered QR via `qrcode`), add/delete pitch actions, `schemas/event.ts` + `schemas/pitch.ts`, `components/organizer/` (CreateEventForm, AddPitchForm, DeletePitchDialog, CopyButton). All mutations server-side, authorized by re-resolving `organizer_code`
- ✅ S3 - Juror join + pitch list (`/e/[eventCode]`): per-event httpOnly cookie `unsaid_juror_<event_id>` (`lib/cookies.ts`), `schemas/juror.ts`, branded event-not-found retry, tap-friendly pitch rows with non-nested slides link. Zero feedback reads in this tree
- ✅ S4 - Capture screen HERO #1 (`/e/[eventCode]/p/[pitchId]`): `schemas/feedback.ts`, `components/capture/` (ChipButton, ChipsGrid, AddChipInline, NoteInput, CaptureScreen). Sentiment-coloured chip toggles (cva + `chip-*` tokens), add-custom-chip upsert by normalized label, one-line note, server-verified juror/pitch/event triangle on submit, sticky bottom submit

- ✅ S6 - Polish + seed + E2E: `scripts/seed-demo.mts` (`npm run seed:demo`, prints the full code sheet), `tests/e2e/core-loop.spec.ts` green on chromium-desktop + chromium-mobile (core loop + access-model checks), full gate green (typecheck/lint/test/build), demo loop walked manually on a 390px viewport. Playwright port parameterizable via `E2E_PORT` (e.g. when :3000 is taken)

#### What's NOT Done Yet

- ⏳ Vercel deploy + prod `NEXT_PUBLIC_APP_URL` (handled by a separate session)
- 🧊 S7 stretch (connect flag) - gated behind a human decision, see `NEXT_TIME.md`

#### Next Steps

Deploy to Vercel (separate session), rehearse the demo arc from `SPECS.md` on real phones against prod. BUILD IS FROZEN - new ideas go to `NEXT_TIME.md`, not code.

## 🤖 Development Philosophy: Vibe Coding with Claude Code

**This project is built with Claude Code, one setup step at a time** (same workflow as the remember-me app). Once the implementation plan lands, the build is broken into numbered setup steps in `specs/05-setup/`. Each step has:

- 🎯 A single goal
- 📋 Prerequisites (what must exist from prior steps)
- ✅ Acceptance criteria
- 📝 A copy-pasteable prompt to feed Claude Code
- 🧪 Verification steps

### Planning & Design Principles

| ❌ Avoid                               | ✅ Prefer                                                              |
| -------------------------------------- | ---------------------------------------------------------------------- |
| "Let's simplify for MVP"               | Build it right the first time - small scale, but ship production-grade |
| "That's a lot of boilerplate"          | Claude handles repetitive work; ship the production-ready design       |
| Estimating in human-hours              | Estimate in setup-step count - Claude time is cheap                    |
| Scope creep into v2 features mid-build | Drop into `NEXT_TIME.md`, stay on the current step                     |

### Task Complexity (Claude's perspective, not human-hours)

| Level            | Meaning                       | Examples                                   |
| ---------------- | ----------------------------- | ------------------------------------------ |
| 🟢 **Easy**      | Single file, clear pattern    | Add a field, copy tweak, new toast message |
| 🟡 **Medium**    | Multi-file, existing patterns | New shadcn screen, new query hook          |
| 🟠 **Complex**   | Architectural decisions       | Core domain algorithms, complex layouts    |
| 🔴 **High Risk** | External deps, hard to test   | Third-party integrations, payment flows    |

## 🛠️ Tech Stack (same as remember-me; source of truth moves to `specs/02-tech-stack/` once written)

| Layer              | Technology                                      |
| ------------------ | ----------------------------------------------- |
| Framework          | **Next.js 16 (App Router) + TypeScript strict** |
| Styling            | **Tailwind CSS v4** (CSS variables)             |
| UI components      | **shadcn/ui** (Radix + Tailwind)                |
| Icons              | `lucide-react`                                  |
| State (UI)         | **Zustand**                                     |
| State (server)     | **TanStack Query**                              |
| Backend            | **Supabase** (Postgres, shared project)         |
| Auth               | **NONE** - capability codes (see `specs/02-tech-stack/`) |
| Forms / validation | `react-hook-form` + `zod`                       |
| Date               | `date-fns`                                      |
| Toasts             | `sonner`                                        |
| Unit tests         | **Vitest** (pure logic only)                    |
| E2E tests          | **Playwright**                                  |
| Hosting            | **Vercel**                                      |

> 🚧 App-specific additions (storage, background workers, drag-drop, uploads, etc.) get decided with the implementation plan.

## 🚨 Critical Stack Rules (NON-NEGOTIABLE)

- ❌ **NEVER** install MUI, Ant Design, Chakra, HeroUI, Mantine - shadcn/ui only
- ❌ **NEVER** use Redux - Zustand for UI state, TanStack Query for server state
- ❌ **NEVER** query Supabase from the browser in this app - data access lives in Server Components + server actions via the service-role admin client (`lib/supabase/admin.ts`); TanStack Query only if a client surface genuinely needs it
- ❌ **NEVER** skip RLS on a new Supabase table - in this app: RLS enabled, zero policies (deny-all), service-role only
- ❌ **NEVER** trust client-only validation - Zod-validate on both client and server
- ❌ **NEVER** trust a client-supplied event/pitch id for authorization - re-resolve the capability code server-side on every action
- ✅ **ALWAYS** index every foreign-key column
- ✅ **ALWAYS** validate user input (size, shape, mime) on BOTH server endpoints AND the client

## 📦 Repository Structure (Target)

```
/
├── app/                  ← Next.js App Router pages + route handlers
├── components/
│   ├── ui/               ← shadcn primitives (you own every line)
│   └── shared/           ← Header, nav, toaster
├── lib/                  ← Pure logic + clients (supabase/, utils)
├── queries/              ← TanStack Query hooks
├── stores/               ← Zustand stores
├── schemas/              ← Zod schemas
├── specs/                ← Living spec folder (see rules below)
├── supabase/migrations/  ← SQL migrations if MCP unavailable
├── tests/                ← Vitest + Playwright
└── public/
```

**Rule:** Pure logic lives in `lib/` as pure functions - no React, no DB. Everything else can lean on the framework.

## 📁 Specs & Documentation

Feature specs live in `specs/`. They are a **living artifact** - update them as decisions are made.

### 🚨 Specs Rules (CRITICAL)

When discussing or implementing **new features, functionalities, pipelines, analytics, or any significant new topic**:

1. **Always create a spec folder** in `specs/` following sequential numbering:
   - Check existing folders to determine the next number
   - Format: `specs/XX-feature-name/` (e.g., `specs/06-notifications/`)

2. **Files inside spec folders** must also be numbered sequentially:
   - Format: `01-analysis.md`, `02-implementation-plan.md`, `03-decisions-summary.md`, etc.

3. **When the user asks to create a spec/doc file**, place it in the appropriate spec folder:
   - If a folder for the topic already exists → add the next numbered file there
   - If no folder exists yet → create a new numbered folder first

4. **Common file types in specs:**
   - `XX-analysis.md` - research, comparisons, trade-offs
   - `XX-implementation-plan.md` - step-by-step plan
   - `XX-decisions-summary.md` - key decisions and rationale
   - `XX-testing-checklist.md` - QA verification
   - `XX-known-issues.md` - limitations and tech debt

## 🚨 Git Rules (CRITICAL)

- **NEVER** commit, push, or make any git write operations unless the user **explicitly** says "commit" or "push"
- Do NOT assume "it works" or similar feedback means "commit the changes"
- **NEVER** push or merge to `main` directly without confirming
- When asked to commit, always confirm the target branch first

### Branch Naming Convention

```
YYYYMMDD-feature-name
```

- **YYYYMMDD** = current date (e.g., `20260607`)
- **feature-name** = kebab-case (e.g., `s0-scaffold`, `s2-auth`)

## 🚨 Database Rules (CRITICAL)

- 🚨 **THIS IS A SHARED SUPABASE PROJECT** (`ujuqwwfhoubgzgtmpuis`) with the parking marketplace + calisthenics tracker + remember-me apps
- 🚨 **EVERY Unsaid table MUST be prefixed `u_`** (`u_events`, `u_pitches`, `u_jurors`, `u_chips`, `u_feedback`, `u_feedback_chips`). Indexes, RLS policies, triggers, and helper functions also `u_`-prefixed. No exceptions
- 🚨 **NEVER touch tables that aren't `u_`-prefixed** - they belong to other apps (`r_*` = remember-me, others = parking/workouts)
- **NEVER** write SQL migration files manually if Supabase MCP is available - use `apply_migration`. Otherwise put numbered `.sql` files in `supabase/migrations/`
- **ALWAYS** run a collision check before the first migration: `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'u\_%' ESCAPE '\';` - must be empty
- **ALWAYS** enable RLS on every new table. 🔑 **In THIS app**: RLS is enabled with **zero policies** (deny-all) - there are no authenticated users; ALL access is server-side via the service-role client, authorized by capability codes (see `specs/02-tech-stack/01-tech-stack.md`)
- **NEVER** use the anon-key / browser Supabase client in v1 - the browser never talks to Supabase directly
- **ALWAYS** index every foreign-key column (perf advisor catches missing ones)
- **ALWAYS** regenerate TypeScript types after schema changes - filter to this app's prefix only, write to `lib/supabase/database.types.ts`
- **NEVER** trust client-only uniqueness - enforce at DB level
- **ALWAYS** ask before destructive operations (`TRUNCATE`, `DROP TABLE`) in the shared DB - triple-confirm
- 🚨 **Supabase Auth is shared** across the apps on this project and belongs to them - this app does NOT use Supabase Auth at all; never change Auth settings (Site URL, redirect allowlist, templates)

## 🎨 UI / Component Rules

- **shadcn/ui is the ONLY component library.** Components live in `components/ui/` as plain TypeScript
- **Tailwind CSS v4** for styling. No CSS-in-JS, no styled-components
- **Mobile-first**
- **No emojis in UI code** - always use `lucide-react` icons (per global CLAUDE.md). Data shapes store semantic keys; the component maps to icon components
- **Theme tokens** live in `app/globals.css` (Tailwind v4 uses CSS variables, not a config file)
- **Dark theme by default**

## 🌐 Environment Variables

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=           # server-only
```

🔒 **Never commit `.env*.local`.** Only `NEXT_PUBLIC_*` vars are safe to expose to the browser.

## 📋 Vibe-Coding Workflow (How to Use This Repo)

1. **Open the next setup step** in `specs/05-setup/SX-name.md`
2. **Read** the goal, prerequisites, acceptance criteria
3. **Copy** the prompt block from the file
4. **Paste** into a fresh Claude Code session (so context is clean)
5. **Run** the implementation. Claude builds, you verify
6. **Verify** acceptance criteria - manually click through, run typecheck/lint/tests
7. **Mark the step done** in the file (status field), update the "What's Done" section here
8. **Commit** when explicitly asked
9. **Move to next step**

Commands:
- `/status` - show step status table + current branch + uncommitted count
- `/setup-step <N>` - run setup step `N` end-to-end via the `setup-step-runner` agent
- `/verify` - typecheck + lint + tests against the current branch
- `/review-step <N>` - code-review the diff of a completed step

### Quick Commands

```bash
npm run dev              # Start Next.js dev server (http://localhost:3000)
npm run build            # Production build
npm run typecheck        # Type-check without emit
npm run lint             # ESLint
npm run test             # Vitest (pure-logic suite)
npm run test:e2e         # Playwright
```

## 🔍 Post-Change Verification (IMPORTANT)

After completing any significant feature or bug fix:

1. **Run `npm run typecheck`** - catches type errors before runtime
2. **Run the Next.js dev server** and click through the new flow on a mobile viewport
3. **Check edge cases** - empty states, expired sessions, timezone issues
4. **Verify RLS** - any new table or policy must be checked with both anon and authenticated roles

**Provide a confidence assessment** at the end of each significant change:

- 🟢 **95-100%** - Simple change, fully traced, no side effects possible
- 🟡 **80-94%** - Moderate change, most paths traced, minor edge cases possible
- 🟠 **60-79%** - Complex change, some uncertainty, recommend manual testing
- 🔴 **<60%** - High risk, needs thorough testing before use

## 📝 Keeping Documentation Updated (IMPORTANT)

When making **significant changes** that affect architecture or introduce new concepts:

1. **Update this file** with:
   - New tables added to the data hierarchy
   - New shared modules
   - New conventions / patterns / rules
   - New spec folders
   - New stack rules

2. **Create/update specs** for:
   - Major features (new folder `specs/XX-feature-name/`)
   - Known issues
   - Complex decisions

3. **What counts as "significant":**
   - New DB tables / schema changes
   - New cross-cutting libraries (auth, storage, email)
   - New architectural patterns (queueing, caching)
   - Known limitations or tech debt

## 📋 NEXT_TIME.md - Deferred Tasks Tracking

A root-level file `NEXT_TIME.md` tracks ideas/features/tasks **deferred to a later stage**. Create it on demand.

### 🚨 Rule: When the user says "later" / "next time" / "in a future stage":

1. **Add an entry** with:
   - **Date added** (YYYY-MM-DD)
   - **Context heading** - what topic was being discussed
   - **What was deferred** - clear description
   - **Reference** - link to relevant spec files
   - **Dependencies** - what must come first

2. **Group entries by topic**, not chronologically

3. **At session start**, scan `NEXT_TIME.md` for newly-relevant items

## 📌 Naming Conventions

### TypeScript / React

- **Variables & functions:** `camelCase`
- **Components & types:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Files:**
  - Components: `ComponentName.tsx`
  - Hooks: `useSomething.ts`
  - Utilities/logic: `kebab-case.ts`
  - Routes: Next.js conventions (`page.tsx`, `layout.tsx`, `route.ts`)

### Database

- **Tables:** prefixed `snake_case` plural (e.g., `u_pitches`)
- **Columns:** `snake_case`
- **Enums (text-as-enum):** lowercase string literals (`"photo"`, `"video"`)

### Import organization

```ts
// 1. External
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. Internal (alias @/)
import { Button } from "@/components/ui/button";

// 3. Relative
import { computeThing } from "./compute-thing";
```

## 📊 Quick Reference Emojis

| Emoji | Meaning  | Usage                                 |
| ----- | -------- | ------------------------------------- |
| ✅    | Success  | Operation completed successfully      |
| ❌    | Failure  | Operation failed                      |
| ⚠️    | Warning  | Completed with caveats                |
| 🔒    | Security | Security concern                      |
| 🚨    | Danger   | Requires immediate attention/approval |
| 📝    | Docs     | Comments, READMEs                     |
| 🐛    | Bug      | Bug fix or error                      |
| ⚡    | Perf     | Performance optimization              |
| 🎨    | Styling  | UI/CSS changes                        |
| ♻️    | Refactor | Code refactoring                      |
| 🔧    | Config   | Config or settings change             |
| 💡    | Idea     | Optional improvement                  |
| 🎯    | Feature  | New feature implementation            |
| 🧪    | Testing  | Tests or test-related                 |

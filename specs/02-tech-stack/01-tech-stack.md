# Unsaid - Tech Stack (definitive)

Same base stack as the remember-me app. **No Python worker** - this app has no
media processing. Single Next.js deployable.

## Stack

| Layer              | Technology                                      | Notes |
| ------------------ | ----------------------------------------------- | ----- |
| Framework          | **Next.js 16 (App Router) + TypeScript strict** | scaffolded |
| Styling            | **Tailwind CSS v4** (CSS variables)             | scaffolded |
| UI components      | **shadcn/ui** (radix base, nova preset)         | 14 primitives installed |
| Icons              | `lucide-react` (v1)                             | NO emojis in UI code |
| State (UI)         | **Zustand**                                     | only if needed - capture screen is mostly local state |
| State (server)     | **TanStack Query**                              | only where live-ish reads help (founder view refresh) |
| Database           | **Supabase Postgres** (shared project `ujuqwwfhoubgzgtmpuis`, tables prefixed `u_`) | |
| Auth               | **NONE (no Supabase Auth in v1)** - codes are capability tokens | see 03-architecture |
| Validation         | **Zod v4** (note: v4, not v3 like remember-me)  | validate on server ALWAYS |
| Forms              | `react-hook-form` + `@hookform/resolvers`       | organizer forms |
| IDs / codes        | `nanoid` (custom alphabets)                     | see 03-architecture |
| QR codes           | `qrcode` npm package (add in S2)                | organizer code-sharing screen |
| Date               | `date-fns`                                      | |
| Toasts             | `sonner`                                        | |
| Unit tests         | **Vitest** (pure logic only: code generation, aggregation) | |
| E2E tests          | **Playwright** (chromium desktop + mobile)      | configured |
| Hosting            | **Vercel**                                      | deploy early (S0) |

## 🔑 Decisions & rationale

1. **No Supabase Auth.** Jurors and founders have no login by product design.
   Adding magic-link auth only for organizers would add email dependency -
   which the brief explicitly warns against for the live demo. Instead the
   organizer gets a private **manage code** (same capability-token pattern as
   founders). Consistent, zero-friction, demo-safe.

2. **Service-role-only data access.** Because there are no authenticated
   users, RLS `auth.uid()` policies are useless here. Instead:
   - RLS is ENABLED on every `u_*` table with **no policies** (deny-all for
     `anon` + `authenticated`)
   - ALL reads/writes go through Next.js server actions / route handlers
     using the service-role client
   - Authorization = possession of the right code, checked server-side on
     every call
   - The browser NEVER talks to Supabase directly - no anon key usage in v1

3. **Zod v4** is installed (newer than remember-me's v3). Use v4 APIs
   (`z.string()` etc. are mostly compatible; check error-map / `.issues`
   differences when porting patterns).

4. **No Zustand/TanStack unless a screen needs it.** The capture screen is
   local component state + a server action. Don't add layers for a one-day
   build.

## 🌐 Environment variables

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=            # set but unused by browser in v1
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # set but unused by browser in v1
SUPABASE_SERVICE_ROLE_KEY=           # server-only - the ONLY key actually used
```

# S0 - App shell + dark theme + landing + deploy

Status: âœ… Done (code complete; Vercel deploy handled by a separate session)

## ðŸŽ¯ Goal

A deployable shell: dark theme, app layout, toaster, landing page with the
two entries (join an event / create an event). Deployed to Vercel early so
every later step ships to a real URL.

## ðŸ“‹ Prerequisites

- âœ… Repo scaffolded (Next.js 16 + TS + Tailwind v4 + shadcn) - already done
- Vercel account (user-driven for the actual deploy)

## âœ… Acceptance criteria

1. Dark theme is the default (no flash of light) - tokens in `app/globals.css`
2. Root layout: app name "Nondit", mobile-first viewport, `<Toaster />` (sonner) mounted
3. `/` landing: short tagline, an "I have an event code" input (navigates to
   `/e/<code>`, no validation yet), and a "Create an event" link to `/new` (stub page)
4. Branded `app/not-found.tsx` + `app/error.tsx`
5. `npm run typecheck` + `npm run lint` + `npm run build` green
6. Deployed to Vercel (user assists with login/link); `NEXT_PUBLIC_APP_URL` set

## ðŸ“ Prompt

```
Read AGENTS.md, SPECS.md, specs/01-overview/, specs/02-tech-stack/,
specs/03-architecture/ first.

Execute setup step S0 for Nondit per specs/05-setup/01-S0-shell.md:

1. Make dark theme the default: set the dark token values as the base in
   app/globals.css (no theme toggle in v1 - dark only), html class="dark".
2. Root layout: metadata (title "Nondit", description from the brief),
   mobile viewport, sonner <Toaster richColors position="top-center" />.
3. Landing page at /: app name + one-line pitch ("The feedback founders
   never hear"), a 6-char event-code input that routes to /e/<CODE>
   (uppercase, client-side only), and a quiet "Create an event" link to /new.
   /new can be an empty stub page ("coming in S2").
4. Branded not-found.tsx and error.tsx (lucide icons, NO emojis in UI).
5. Keep it minimal - no extra components, no state libraries.

Do not commit. Run npm run typecheck && npm run lint && npm run build and
report results. Then walk me through the Vercel deploy (I'll authenticate).
```

## ðŸ§ª Verification

- `npm run dev` â†’ `/` renders dark on a phone viewport; code input routes to `/e/ABC123`
- Build green; deployed URL loads

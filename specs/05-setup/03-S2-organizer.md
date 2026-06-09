# S2 - Organizer: create event, pitches, codes + QR

Status: âœ… Done

## ðŸŽ¯ Goal

The organizer flow end to end: create an event â†’ add pitches â†’ see the
shareable codes (public event code + per-pitch private codes + their QRs).

## ðŸ“‹ Prerequisites

- S1 done (tables, codes, admin client)

## âœ… Acceptance criteria

1. `/new`: form (name required; date, location optional) â†’ server action
   creates `u_events` with both codes + seeds `DEFAULT_CHIPS` into `u_chips`
   (created_by NULL) â†’ redirects to `/o/<organizerCode>`
2. `/o/[organizerCode]`: 404 on unknown code. Shows:
   - event header (name, date, location)
   - add-pitch form (name required; description, slides https-URL, founder
     email optional - zod-validated server-side) - list updates after add
   - pitch list with per-pitch private link `/f/<privateCode>` + copy button
     + QR (qrcode package, data-URL `<img>`)
   - the public juror entry: code, full link `/e/<publicCode>`, copy + QR
3. Pitches can be deleted (confirm dialog) and reordered is OUT of v1 -
   `position` = insertion order
4. All mutations are server actions using the admin client; zod on every input
5. Mobile-first; works on a phone; NO emojis in UI (lucide icons)
6. `npm run typecheck` + `npm run lint` green

## ðŸ“ Prompt

```
Read AGENTS.md, SPECS.md (Organizer setup flow), and
specs/03-architecture/01-architecture.md first.

Execute setup step S2 for Nondit per specs/05-setup/03-S2-organizer.md:

1. npm i qrcode and @types/qrcode (dev).
2. /new - create-event form (react-hook-form + zod v4). Server action:
   generate public_code (generatePublicCode, retry on unique collision) +
   organizer_code (generatePrivateCode), insert u_events, bulk-insert
   DEFAULT_CHIPS for the event, redirect to /o/<organizerCode>.
3. /o/[organizerCode] - Server Component resolving the code via the admin
   client; notFound() on miss. Sections: event header; "Share with the jury"
   card (public code large + copyable link + QR); add-pitch form (server
   action, private_code minted per pitch); pitch list with founder link +
   copy + QR + delete (confirm Dialog).
4. QR: qrcode.toDataURL server-side, rendered as <img>. Links use
   NEXT_PUBLIC_APP_URL.
5. Copy buttons: small client component using navigator.clipboard + sonner
   toast.
6. Validate EVERY action input with zod server-side (slides_url must be
   https when present). Authorization on every action = the organizer_code
   itself, re-resolved server-side - never trust an event_id from the client.

Do not commit. Run typecheck + lint and report. End with a confidence
assessment per AGENTS.md.
```

## ðŸ§ª Verification

- Create event on a phone viewport â†’ add 3 pitches â†’ all codes + QRs render
- Wrong organizer code â†’ 404
- `u_chips` has the default set for the new event

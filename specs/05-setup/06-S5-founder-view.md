# S5 - ðŸ¦¸ Founder feedback view (HERO #2)

Status: âœ… Done

## ðŸŽ¯ Goal

The payoff screen: scattered taps from many jurors become one clean, visual,
anonymous page. After this step the core loop is demoable end to end.

## ðŸ“‹ Prerequisites

- S4 done (feedback exists)

## âœ… Acceptance criteria

1. `/f/[privateCode]`: resolves `u_pitches.private_code`; unknown â†’ 404
   (never reveal whether a code exists). NO name entry, NO login - the link
   is the key
2. Top: pitch name + event name, juror count ("Feedback from 5 jurors")
3. **Chip summary**: each used chip with its juror count, most-used first,
   sentiment-coloured, e.g. a bar/pill showing "5 Â· unclear ask". Aggregated
   by normalized label across ALL jurors (default + custom chips merged)
4. **Positive vs negative read**: one glanceable element (e.g. a single
   ratio bar with counts) from positive vs negative chip selections;
   neutral shown separately, excluded from the ratio
5. **Notes feed**: newest first, text + relative time only
6. ðŸš¨ ANONYMITY: no juror name/id ever reaches this page - the query never
   selects juror columns; verify nothing juror-identifying is in the RSC
   payload (search the rendered HTML/flight data)
7. Empty state ("No feedback yet - check back after the pitches") looks
   intentional, not broken
8. Page metadata: title = pitch name; `robots: noindex`
9. `lib/aggregate.ts` pure + vitest-covered (grouping, ordering, ratio,
   neutral handling, empty input). Typecheck + lint + test green

## ðŸ“ Prompt

```
Read AGENTS.md, SPECS.md (Founder feedback view - HERO #2), and
specs/03-architecture/01-architecture.md (aggregation section) first. This
screen is what sells the product - it must look genuinely good, not like an
admin table.

Execute setup step S5 for Nondit per specs/05-setup/06-S5-founder-view.md:

1. lib/aggregate.ts - pure aggregateFeedback(): input = feedback rows with
   chip selections (label, sentiment) and notes; output = { chipCounts
   sorted desc (label, sentiment, jurorCount), positiveCount, negativeCount,
   neutralCount, jurorCount, notes newest-first }. Group by
   normalizeLabel(); count DISTINCT jurors per chip. Full vitest suite.
2. /f/[privateCode]/page.tsx - Server Component: resolve pitch by
   private_code (notFound on miss), fetch feedback + chips + notes WITHOUT
   selecting any juror-identifying columns, aggregate, render.
3. components/feedback/: ChipSummary (sentiment-coloured count pills/bars,
   most-used first, subtle size emphasis on top items), SentimentBar (one
   horizontal positive/negative ratio bar with counts, neutral noted under
   it), NotesFeed (clean cards, date-fns relative time).
4. Visual bar: generous whitespace, strong type hierarchy, the chip summary
   is the star. Dark theme. lucide icons only.
5. Empty state per acceptance criteria. metadata: pitch name title +
   noindex robots.
6. dynamic = "force-dynamic" (feedback is live - fresh on every load).

Do not commit. Typecheck + lint + test, report with confidence assessment.
Then walk the full demo loop yourself (organizer â†’ juror x2 â†’ founder) with
the dev server and report what feels weak.
```

## ðŸ§ª Verification

- Two jurors submit different chips + notes to one pitch â†’ founder page
  shows merged counts, correct ratio, both notes, zero juror identity
- Another pitch's private code shows ONLY that pitch's feedback
- Garbage code â†’ 404

# Nondit â€” Requirements Interview (v1 scoping)

> Answer inline under each `>>`. Skip anything you don't care about.
> Goal: lock what's actually IN the first version before anyone writes code.
> I'll react and turn your answers into a tight v1 spec.

---

## A. Problem & framing â€” is the core bet right?

**A1.** The whole product rests on the Â§3 insight (feedback evaporates when there's no mutual interest). Is that an assumption you _believe_ or one you've _seen_? Have you yourself left a pitch event with no feedback?

> > yea it happens very often usually you would get only the positiive feedback from the mentors and they will void the negative aspects of the pitch/demo so we want to get everything thats noted during the pitch

**A2.** Who feels this pain most acutely â€” the founder who got nothing, or the organizer who looks bad when founders leave unhappy? Whose problem are we actually selling on 11 June?

> > usually the founder might not have enough feedback and be in a position to ask for somehting to reflect on

**A3.** If you could only deliver ONE sentence of value to a founder after the event, what would it be? (This tells us what the founder view must nail.)

> > "Get feedback"

---

## B. Users & roles for v1

**B1.** For the _first version_, do we need all four roles (organizer / juror / founder / peer) working, or is v1 just **juror â†’ founder** and everything else is later?

> > yea we need the two roles and maybe one for the other participants. The idea is to open the app login with your name/role and just start sharing

**B2.** How do jurors and founders get _in_? Magic link emailed by organizer? Pre-seeded accounts? A shared link + name pick? (Pick the laziest thing that works for one real event.)

> > So maybe a QR link only for this event. Soemone from the staff will create an evenet and tnter the different pitches and the jurors can get in and give feedback for a pitch

**B3.** Roughly how many jurors, how many startups, how many peers at the 11 June event? (Scale changes the design â€” 5 jurors is different from 50 peers.)

> > jurors 5-10 pitches again depends 5-20

---

## C. The capture loop (the hero screen)

**C1.** During a live pitch, what's the realistic max a juror will tap/type? 1 chip? 3 chips + one line? Be honest about real behavior under time pressure.

> > depends we need to think what would be nic emaybe each juror should be able to define his chips.

**C2.** The handoff suggests fixed chips (`unclear ask`, `strong traction`, etc.). Do you want a fixed set you define up front, or editable per event? List the chips you'd actually ship with:

> > We want full customizable things

**C3.** Auto-bind to "current pitcher" depends on the organizer advancing the schedule. What happens if the organizer is slow/forgets to advance? Does the juror need a manual override ("actually I'm noting #3")?

> > Not really the juror will decide when to evaluate the pitcher

**C4.** Do chips need to be _positive vs negative_ (sentiment), or just neutral observations? Does the founder benefit from seeing "3 said rushed delivery"?

> > Both maybe

---

## D. Honesty vs. attribution (Â§5a) â€” the philosophical core

**D1.** Per-note visibility (named / anonymous) is elegant but adds a decision to every note. Under time pressure, will jurors actually choose, or will they default to one? What should the _default_ be?

> > Maybe they wilkl be already logged in so they wont have a decision to make to post only for a specific pitch something as anonyme user

**D2.** Is anonymous feedback truly anonymous to the founder only, or also to the organizer? (If an organizer can de-anonymize, it's not really anonymous â€” decide this.)

> > Make it visible for now

**D3.** Risk: anonymity enables cruelty. Do we need any guard (min length, no one-word insults, organizer can hide a note), or do we trust a professional jury for v1?

> > Not needed

---

## E. Founder delivery (Â§4 payoff)

**E1.** When does a founder see feedback â€” after their own slot, or all at the end of the event? (Handoff recommends end-of-event.)

> > Doesnt matter could be live just have a section for his feedback

**E2.** What does the consolidated view look like in your head â€” a list of notes? Grouped by tag? A short summary on top? Describe the screen a founder opens.

> > We want nice visualization

**E3.** Is the Claude AI-synthesis layer ("3 jurors flagged your go-to-market") a v1 feature or a stretch you'll only add if there's time? Be decisive â€” it changes the build.

> > Ni need for AI synthesis

---

## F. Scope â€” what's truly v1 vs cut

**F1.** Of CORE features 1â€“4 in Â§6, if you had to ship only TWO for the demo to land, which two?

> > s

**F2.** Peer feedback: in v1 or out? (It doubles the auth/role surface for arguably the weaker feedback source.)

> >

**F3.** The "I'd like to connect" flag â€” does this stay cut, or is it secretly the most demo-able moment (feedback â†’ real networking)?

> >

**F4.** Anything in the handoff you've already changed your mind about since writing it?

> >

---

## G. Demo & the judging bar

**G1.** The bar is "would they run this on 11 June." What's the single most likely reason an organizer says _no_? (Let's design against that objection now.)

> >

**G2.** The demo ends on the scattered â†’ consolidated transform. Do we have _realistic seed data_ (real-ish startup names, plausible notes) ready, or does someone need to write it?

> >

**G3.** What's the one moment in the demo that has to make the room go "oh, nice"? Everything else is supporting cast.

> >

---

## H. Open decisions from Â§12 (just pick)

**H1.** Final name â€” keep "Nondit" or something else?

> >

**H2.** Can founders reply to named feedback in v1? (yes / no / stretch)

> >

**H3.** One thing you're worried we're missing entirely:

> >

---

_When you've filled this in, send it back and I'll compress it into a v1 spec + a cut list._

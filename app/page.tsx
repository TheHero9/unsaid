import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarPlus,
  EyeOff,
  FileText,
  Layers,
  ListPlus,
  Mic,
  ScanLine,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Unlock,
  UserRound,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CaptureMock,
  ConsolidateMock,
  DeliverMock,
} from "@/components/marketing/ScreenMocks";
import { PhoneFrame } from "@/components/marketing/PhoneFrame";
import { LinkedInIcon } from "@/components/marketing/LinkedInIcon";

const LINKEDIN_URL = "https://www.linkedin.com/in/demetrios-vlassis/";

export const metadata: Metadata = {
  title: "Nondit - the feedback founders never get",
  description:
    "During a pitch, jurors tap quick feedback chips, rate the pitch, and leave a one-line note. Nondit merges it, strips the names, and gives the founder one clean, anonymous feedback page.",
  openGraph: {
    title: "Nondit - the feedback founders never get",
    description:
      "Recover the honest feedback every juror forms and never shares.",
    type: "website",
  },
};

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
      {children}
    </p>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5">
          <span className="text-lg font-semibold tracking-tight">Nondit</span>
          <nav className="flex items-center gap-2 sm:gap-5">
            <Link
              href="#how"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              How it works
            </Link>
            <Link
              href="/join"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Join an event
            </Link>
            <Button asChild size="sm">
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                Get early access
              </a>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5">
        {/* Hero */}
        <section className="flex flex-col items-center py-20 text-center sm:py-28">
          <Kicker>Real-time pitch feedback</Kicker>
          <h1 className="mt-5 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            The feedback founders never get.
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
            Every juror forms a real, honest opinion during a pitch - then
            softens it, or keeps it to themselves. Nondit recovers the feedback
            that usually goes{" "}
            <span className="font-medium text-foreground underline decoration-foreground/30 decoration-2 underline-offset-4">
              unspoken
            </span>
            .
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                <Sparkles className="size-5" aria-hidden />
                Get early access
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-6 text-base"
            >
              <Link href="#how">
                See how it works
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </section>

        {/* Problem */}
        <section className="border-t border-border py-20">
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <Kicker>The problem</Kicker>
            <p className="text-balance text-2xl font-medium leading-snug sm:text-3xl">
              Founders walk away with{" "}
              <span className="text-muted-foreground">
                &ldquo;great pitch, well done.&rdquo;
              </span>{" "}
              The honest, critical notes - the ones that would actually help -
              never reach them.
            </p>
            <p className="text-balance text-muted-foreground">
              Softened to stay polite, or simply discarded. Every room is full
              of useful judgment that evaporates the moment the pitch ends.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-t border-border py-20">
          <div className="mb-12 space-y-3 text-center">
            <Kicker>How it works</Kicker>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Three taps to honest feedback.
            </h2>
          </div>

          <div className="grid gap-12 sm:grid-cols-3 sm:gap-6">
            <Step
              index="01"
              icon={<Mic className="size-4" aria-hidden />}
              title="Capture"
              body="Jurors tap quick feedback chips, rate the pitch, and add one line - live, on their phone."
              mock={<CaptureMock />}
            />
            <Step
              index="02"
              icon={<Layers className="size-4" aria-hidden />}
              title="Consolidate"
              body="Every response is merged and the names are stripped automatically. No one is identifiable."
              mock={<ConsolidateMock />}
            />
            <Step
              index="03"
              icon={<Send className="size-4" aria-hidden />}
              title="Deliver"
              body="The founder gets one clean, anonymous page: the positive read, the critical read, and the notes."
              mock={<DeliverMock />}
            />
          </div>
        </section>

        {/* Why different */}
        <section className="border-t border-border py-20">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <Kicker>Why it&apos;s different</Kicker>
            <h2 className="text-balance text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
              Every other tool in this space is judging software.
            </h2>
            <p className="text-balance text-lg text-muted-foreground">
              Built to rank startups and pick a winner - for the organizer.
              Nondit is the opposite. It ignores ranking and hands the feedback
              back to the founder.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-muted-foreground">
                <EyeOff className="size-4" aria-hidden />
                Anonymous by default
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-muted-foreground">
                <ShieldCheck className="size-4" aria-hidden />
                No ranking, no winners
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-muted-foreground">
                <Users className="size-4" aria-hidden />
                Built for the founder
              </span>
            </div>
          </div>
        </section>

        {/* Two ways to run it */}
        <section className="border-t border-border py-20">
          <div className="mb-12 space-y-3 text-center">
            <Kicker>Two ways to run it</Kicker>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Buy it for everyone, or bring it yourself.
            </h2>
            <p className="mx-auto max-w-xl text-balance text-muted-foreground">
              Same product, two entry points. They can coexist.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FlowCard
              tag="Model A"
              icon={<Building2 className="size-5" aria-hidden />}
              title="The organizer runs it"
              summary="For competitions, accelerators and demo days - one setup for every founder in the room."
              steps={[
                {
                  icon: <CalendarPlus className="size-4" aria-hidden />,
                  text: "Organizer creates the event",
                },
                {
                  icon: <ListPlus className="size-4" aria-hidden />,
                  text: "Adds the startups and shares the link with the judges",
                },
                {
                  icon: <ScanLine className="size-4" aria-hidden />,
                  text: "Judges scan the QR and rate each pitch",
                },
                {
                  icon: <FileText className="size-4" aria-hidden />,
                  text: "Every founder receives their own feedback page",
                },
              ]}
              note="A one-time purchase, priced by the number of projects."
            />
            <FlowCard
              tag="Model B"
              icon={<UserRound className="size-5" aria-hidden />}
              title="The founder brings it"
              summary="No organizer needed. A founder can use Nondit at any pitch, even one where nobody set anything up."
              steps={[
                {
                  icon: <CalendarPlus className="size-4" aria-hidden />,
                  text: "Founder creates their own event - just themselves",
                },
                {
                  icon: <Share2 className="size-4" aria-hidden />,
                  text: "Puts the QR on screen for the room - judges and audience",
                },
                {
                  icon: <ScanLine className="size-4" aria-hidden />,
                  text: "Everyone scans and leaves feedback",
                },
                {
                  icon: <Unlock className="size-4" aria-hidden />,
                  text: "Founder unlocks their anonymous feedback page",
                },
              ]}
              note="Unlock your feedback - no setup, no dependency on anyone."
            />
          </div>
        </section>

        {/* Where it's used */}
        <section className="border-t border-border py-20">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <Kicker>Where it&apos;s used</Kicker>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-4 text-xl font-medium sm:text-2xl">
              <span>Pitch competitions</span>
              <span className="text-muted-foreground/40">·</span>
              <span>Accelerators</span>
              <span className="text-muted-foreground/40">·</span>
              <span>Demo days</span>
              <span className="text-muted-foreground/40">·</span>
              <span>1-on-1 VC meetings</span>
            </div>
            <p className="text-balance text-muted-foreground">
              A 1-on-1 VC meeting is just an event with a single pitch. Same
              product, same screens.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border py-24">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Bring real feedback to your next pitch.
            </h2>
            <p className="text-balance text-lg text-muted-foreground">
              Running an event, or pitching at one? Get early access and we&apos;ll
              set you up.
            </p>
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                <LinkedInIcon className="size-5" />
                Get early access
              </a>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <span className="font-semibold text-foreground">Nondit</span>
          <div className="flex items-center gap-5">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground"
            >
              <LinkedInIcon className="size-4" />
              Contact
            </a>
            <Link href="/join" className="hover:text-foreground">
              Join an event
            </Link>
          </div>
          <span>© 2026 Nondit</span>
        </div>
      </footer>
    </div>
  );
}

function Step({
  index,
  icon,
  title,
  body,
  mock,
}: {
  index: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  mock: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <PhoneFrame className="mb-7">{mock}</PhoneFrame>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">{index}</span>
        <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground">
          {icon}
        </span>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="mt-3 max-w-xs text-balance text-sm text-muted-foreground">
        {body}
      </p>
    </div>
  );
}

function FlowCard({
  tag,
  icon,
  title,
  summary,
  steps,
  note,
}: {
  tag: string;
  icon: React.ReactNode;
  title: string;
  summary: string;
  steps: { icon: React.ReactNode; text: string }[];
  note: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-7">
      <div className="flex items-center justify-between">
        <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
          {icon}
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {tag}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {summary}
      </p>

      <ol className="mt-6 flex-1 space-y-0">
        {steps.map((step, i) => (
          <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
            {/* connecting line */}
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute left-[15px] top-9 h-[calc(100%-1.5rem)] w-px bg-border"
              />
            )}
            <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground">
              {step.icon}
            </span>
            <div className="flex flex-col pt-0.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Step {i + 1}
              </span>
              <span className="mt-0.5 text-sm leading-snug text-foreground">
                {step.text}
              </span>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-2 border-t border-border pt-4 text-sm font-medium text-foreground">
        {note}
      </p>
    </div>
  );
}

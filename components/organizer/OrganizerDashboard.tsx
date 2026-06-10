"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  ChevronDown,
  ExternalLink,
  Inbox,
  MapPin,
  Plus,
  SlidersHorizontal,
  Tags,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/organizer/CopyButton";
import { AddPitchForm } from "@/components/organizer/AddPitchForm";
import { DeletePitchDialog } from "@/components/organizer/DeletePitchDialog";
import { ChipManager, type ManagedChip } from "@/components/organizer/ChipManager";
import {
  CriteriaManager,
  type ManagedCriterion,
} from "@/components/organizer/CriteriaManager";

export interface FounderLink {
  id: string;
  name: string;
  description: string | null;
  slidesUrl: string | null;
  link: string;
  qr: string;
}

interface OrganizerDashboardProps {
  organizerCode: string;
  eventName: string;
  dateLabel: string | null;
  location: string | null;
  publicCode: string;
  publicLink: string;
  publicQr: string;
  founderLinks: FounderLink[];
  chips: ManagedChip[];
  criteria: ManagedCriterion[];
}

export function OrganizerDashboard({
  organizerCode,
  eventName,
  dateLabel,
  location,
  publicCode,
  publicLink,
  publicQr,
  founderLinks,
  chips,
  criteria,
}: OrganizerDashboardProps) {
  const [tab, setTab] = useState<"public" | "private">("public");
  const [openAdd, setOpenAdd] = useState(false);

  return (
    <main className="mx-auto w-full max-w-md px-[18px] pb-12 pt-12">
      {/* Header */}
      <header className="mb-[18px]">
        <p className="text-[12.5px] font-bold uppercase tracking-[0.06em] text-text-3">
          Nondit
        </p>
        <h1 className="mb-2 mt-1.5 font-serif text-[34px] font-semibold leading-[1.04] tracking-[-0.02em] text-text">
          {eventName}
        </h1>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-text-3">
          {dateLabel && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden />
              {dateLabel}
            </span>
          )}
          {dateLabel && (location || founderLinks.length >= 0) && (
            <span className="size-[3px] rounded-full bg-text-4" aria-hidden />
          )}
          {location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden />
              {location}
            </span>
          ) : (
            <span>
              {founderLinks.length} pitch{founderLinks.length === 1 ? "" : "es"}
            </span>
          )}
        </div>
      </header>

      {/* HERO: the codes */}
      <div className="mb-3.5 rounded-[18px] border border-border-2 bg-surface p-3.5">
        <div className="mb-3.5 flex gap-1 rounded-xl bg-background p-[3px]">
          {(
            [
              ["public", "Event code"],
              ["private", "Founder links"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "h-9 flex-1 rounded-[9px] text-[13.5px] font-semibold transition-colors",
                tab === key
                  ? "border border-border-2 bg-surface-3 text-text"
                  : "border border-transparent text-text-3"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "public" ? (
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-text-3">
              <Users className="size-[15px]" aria-hidden />
              <span className="text-[12.5px] font-semibold">
                Hand this to the room
              </span>
            </div>
            <p className="mb-4 text-[13px] leading-[1.45] text-text-3">
              Anyone with this code can give feedback. They can never read it.
            </p>

            <div className="flex flex-col items-center pb-2 pt-[18px]">
              <div className="mb-3 text-[11px] font-bold tracking-[0.14em] text-text-3">
                EVENT CODE
              </div>
              <div className="mb-[18px] pl-[0.18em] font-mono text-[38px] font-bold tracking-[0.18em] text-text">
                {publicCode}
              </div>
              <div className="rounded-xl bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                <Image
                  src={publicQr}
                  alt={`QR code linking to ${publicLink}`}
                  width={170}
                  height={170}
                  unoptimized
                  className="size-[170px]"
                />
              </div>
            </div>

            <div className="my-2.5 flex gap-2">
              <div className="flex h-11 min-w-0 flex-1 items-center rounded-[11px] border border-border bg-surface-2 px-[13px]">
                <span className="truncate font-mono text-[13px] text-text-2">
                  {publicLink}
                </span>
              </div>
              <CopyButton
                value={publicLink}
                what="Event link"
                size="default"
                className="h-11 w-11 border-border bg-surface-2"
              />
            </div>
            <CopyButton
              value={publicCode}
              what="Event code"
              label="Copy code"
              variant="secondary"
              size="default"
              className="h-[46px] w-full text-[14.5px]"
            />
          </div>
        ) : (
          <div>
            <p className="mb-3.5 mt-0.5 text-[13px] leading-[1.45] text-text-3">
              Each pitch gets a private link only its founder can open to read
              their results.
            </p>
            {founderLinks.length === 0 ? (
              <p className="text-[13px] text-text-4">
                Add a pitch below to generate its founder link.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {founderLinks.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-[11px] rounded-[13px] border border-border bg-surface-2 p-[11px]"
                  >
                    <div className="shrink-0 rounded-lg bg-white p-[5px]">
                      <Image
                        src={p.qr}
                        alt={`QR code for ${p.name}'s private link`}
                        width={46}
                        height={46}
                        unoptimized
                        className="size-[46px]"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-serif text-[16px] font-semibold text-text">
                        {p.name}
                      </div>
                      <div className="truncate font-mono text-[11.5px] text-text-4">
                        {p.link.replace(/^https?:\/\//, "")}
                      </div>
                    </div>
                    <CopyButton
                      value={p.link}
                      what="Founder link"
                      size="default"
                      className="h-11 w-11 border-border bg-surface"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Pitches */}
      <div className="mb-3.5">
        <Collapsible
          icon={Users}
          title="Pitches"
          sub="The running order"
          count={founderLinks.length}
          defaultOpen
        >
          {founderLinks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center text-text-3">
              <Inbox className="size-6" aria-hidden />
              <p className="text-[13px]">No pitches yet. Add your first below.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {founderLinks.map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center gap-[11px] rounded-xl border border-border bg-surface-2 px-3 py-[11px]"
                >
                  <span className="flex size-[26px] shrink-0 items-center justify-center rounded-lg bg-surface-3 font-mono text-[12.5px] font-bold text-text-3">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-serif text-[16px] font-semibold text-text">
                      {p.name}
                    </div>
                    {p.description && (
                      <div className="truncate text-[12px] text-text-4">
                        {p.description}
                      </div>
                    )}
                  </div>
                  {p.slidesUrl && (
                    <a
                      href={p.slidesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open slides for ${p.name}`}
                      className="flex size-8 items-center justify-center rounded-lg text-text-4 transition-colors hover:text-text"
                    >
                      <ExternalLink className="size-4" aria-hidden />
                    </a>
                  )}
                  <DeletePitchDialog
                    organizerCode={organizerCode}
                    pitchId={p.id}
                    pitchName={p.name}
                  />
                </li>
              ))}
            </ul>
          )}

          {openAdd ? (
            <div className="mt-2.5 rounded-[13px] border border-border bg-surface-2 p-3.5">
              <AddPitchForm organizerCode={organizerCode} />
              <button
                type="button"
                onClick={() => setOpenAdd(false)}
                className="mt-3 w-full text-center text-[13px] text-text-3 hover:text-text"
              >
                Close
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setOpenAdd(true)}
              className="mt-2.5 flex h-[46px] w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-strong text-[14.5px] font-semibold text-text-2 transition-colors active:scale-[0.99]"
            >
              <Plus className="size-[17px]" aria-hidden />
              Add a pitch
            </button>
          )}
        </Collapsible>
      </div>

      {/* Demoted configuration */}
      <div className="mb-2.5">
        <p className="mx-1 mb-2.5 mt-1 text-[11.5px] font-bold uppercase tracking-[0.06em] text-text-4">
          Configuration
        </p>
        <div className="flex flex-col gap-2.5">
          <Collapsible
            icon={Tags}
            title="Feedback chips"
            sub="What every juror taps to react"
            count={chips.length}
          >
            <ChipManager organizerCode={organizerCode} chips={chips} />
          </Collapsible>
          <Collapsible
            icon={SlidersHorizontal}
            title="Rating criteria"
            sub="1-5 scales founders see averaged"
            count={criteria.length}
          >
            <CriteriaManager organizerCode={organizerCode} criteria={criteria} />
          </Collapsible>
        </div>
      </div>
    </main>
  );
}

function Collapsible({
  icon: Icon,
  title,
  sub,
  count,
  defaultOpen = false,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  sub?: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-surface-3 text-text-2">
          <Icon className="size-[18px]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-[15.5px] font-semibold text-text">{title}</span>
            {count != null && (
              <span className="rounded-full bg-surface-3 px-[7px] py-px font-mono text-[11.5px] font-bold text-text-3">
                {count}
              </span>
            )}
          </span>
          {sub && (
            <span className="mt-0.5 block text-[12.5px] text-text-3">{sub}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-[18px] shrink-0 text-text-3 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      {open && <div className="px-4 pb-[18px]">{children}</div>}
    </div>
  );
}

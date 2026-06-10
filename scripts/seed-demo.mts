/**
 * Demo seed script - creates one realistic event with pitches, jurors and
 * believable mixed feedback, then prints the full code sheet.
 *
 * Run: npm run seed:demo
 * Each run creates a FRESH event (idempotent enough for rehearsals).
 *
 * Uses the service-role key from .env.local directly - this script runs
 * outside Next.js, so it builds its own client instead of importing
 * lib/supabase/admin.ts (which is guarded by "server-only").
 */
import { createClient } from "@supabase/supabase-js";

import { DEFAULT_CHIPS } from "../lib/chips";
import { DEFAULT_CRITERIA } from "../lib/criteria";
import { generatePrivateCode, generatePublicCode } from "../lib/codes";
import type { Database } from "../lib/supabase/database.types";

process.loadEnvFile(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const db = createClient<Database>(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface SeedPitch {
  name: string;
  description: string;
  slides_url?: string;
}

const PITCHES: SeedPitch[] = [
  {
    name: "Loopwell",
    description:
      "Subscription analytics that finds silent churn before it happens.",
    slides_url: "https://drive.google.com/loopwell-deck",
  },
  {
    name: "FieldNote",
    description: "Voice-first CRM for sales reps who live in their car.",
  },
  {
    name: "Brizo Energy",
    description:
      "Plug-and-play home battery balancing for southern European grids.",
    slides_url: "https://drive.google.com/brizo-deck",
  },
  {
    name: "Cartello",
    description: "Wholesale marketplace connecting island groceries to mainland suppliers.",
  },
  {
    name: "Mendix Health",
    description: "Pre-op patient prep over WhatsApp - fewer cancelled surgeries.",
  },
  {
    name: "Atlas Crew",
    description: "Crew scheduling for small shipping fleets, replacing Excel.",
  },
];

const JURORS = ["Maria K.", "Stefan B.", "Elena P.", "Nikos T.", "Priya S."];

/** chip label -> note pairs that read like real juror shorthand */
const NOTE_POOL = [
  "The ask slide went by too fast - I still do not know the amount.",
  "Strong opening story, lost me at the pricing model.",
  "Best demo of the day so far.",
  "Founder knows the market cold. Impressive Q&A.",
  "Numbers on slide 7 contradict what was said out loud.",
  "Would have liked one concrete customer example.",
  "Team slide is stacked - why are they all part-time?",
  "Clear problem, fuzzy solution.",
  "This could work in Germany too, bigger than they pitch it.",
  "Speak slower. Half the room missed the traction point.",
];

async function main() {
  console.log("Seeding demo event...\n");

  // 1. Event
  const publicCode = generatePublicCode();
  const organizerCode = generatePrivateCode();
  const { data: event, error: eventErr } = await db
    .from("u_events")
    .insert({
      name: "Athens Demo Day 2026",
      event_date: "2026-06-12",
      location: "Stavros Niarchos Foundation, Athens",
      public_code: publicCode,
      organizer_code: organizerCode,
    })
    .select()
    .single();
  if (eventErr || !event) throw eventErr ?? new Error("event insert failed");

  // 2. Default chips
  const { data: chips, error: chipsErr } = await db
    .from("u_chips")
    .insert(
      DEFAULT_CHIPS.map((c) => ({
        event_id: event.id,
        label: c.label,
        sentiment: c.sentiment,
      }))
    )
    .select();
  if (chipsErr || !chips) throw chipsErr ?? new Error("chips insert failed");

  // 2b. Default rating criteria (event-wide)
  const { error: criteriaErr } = await db.from("u_criteria").insert(
    DEFAULT_CRITERIA.map((c) => ({
      event_id: event.id,
      label: c.label,
    }))
  );
  if (criteriaErr) throw criteriaErr;

  // 3. Pitches
  const { data: pitches, error: pitchErr } = await db
    .from("u_pitches")
    .insert(
      PITCHES.map((p, i) => ({
        event_id: event.id,
        name: p.name,
        description: p.description,
        slides_url: p.slides_url ?? null,
        private_code: generatePrivateCode(),
        position: i,
      }))
    )
    .select();
  if (pitchErr || !pitches) throw pitchErr ?? new Error("pitch insert failed");
  pitches.sort((a, b) => a.position - b.position);

  // 4. Jurors
  const { data: jurors, error: jurorErr } = await db
    .from("u_jurors")
    .insert(JURORS.map((name) => ({ event_id: event.id, name })))
    .select();
  if (jurorErr || !jurors) throw jurorErr ?? new Error("juror insert failed");

  // 5. One custom chip from a juror (shows merging of custom + default)
  const { data: customChip, error: customErr } = await db
    .from("u_chips")
    .insert({
      event_id: event.id,
      label: "pricing unclear",
      sentiment: "negative",
      created_by: jurors[0].id,
    })
    .select()
    .single();
  if (customErr || !customChip) throw customErr ?? new Error("custom chip failed");
  const allChips = [...chips, customChip];

  // 6. Feedback distribution:
  //    pitch[0] heavily reviewed (all 5 jurors), pitch[1] + pitch[2] medium,
  //    pitch[3] light, pitch[4] light, pitch[5] ZERO (empty state demo).
  const plan: { pitchIdx: number; jurorIdx: number; chipLabels: string[]; note?: string }[] = [
    // Loopwell - the star pitch, mixed signal
    { pitchIdx: 0, jurorIdx: 0, chipLabels: ["unclear ask", "strong traction", "pricing unclear"], note: NOTE_POOL[0] },
    { pitchIdx: 0, jurorIdx: 1, chipLabels: ["unclear ask", "great team"], note: NOTE_POOL[1] },
    { pitchIdx: 0, jurorIdx: 2, chipLabels: ["strong traction", "good demo", "confident"], note: NOTE_POOL[2] },
    { pitchIdx: 0, jurorIdx: 3, chipLabels: ["unclear ask", "memorable"], note: NOTE_POOL[4] },
    { pitchIdx: 0, jurorIdx: 4, chipLabels: ["strong traction", "clear problem"], note: NOTE_POOL[3] },
    // second visit from juror 0 - more chips later in the event
    { pitchIdx: 0, jurorIdx: 0, chipLabels: ["good demo"] },
    // FieldNote
    { pitchIdx: 1, jurorIdx: 0, chipLabels: ["clear problem", "rushed delivery"], note: NOTE_POOL[9] },
    { pitchIdx: 1, jurorIdx: 2, chipLabels: ["clear problem", "weak market size"], note: NOTE_POOL[7] },
    { pitchIdx: 1, jurorIdx: 3, chipLabels: ["bold claim"] },
    // Brizo Energy
    { pitchIdx: 2, jurorIdx: 1, chipLabels: ["great team", "confident"], note: NOTE_POOL[6] },
    { pitchIdx: 2, jurorIdx: 4, chipLabels: ["great team", "memorable"], note: NOTE_POOL[8] },
    // Cartello
    { pitchIdx: 3, jurorIdx: 2, chipLabels: ["too much jargon"], note: NOTE_POOL[5] },
    // Mendix Health
    { pitchIdx: 4, jurorIdx: 3, chipLabels: ["clear problem", "good demo"] },
    // Atlas Crew - intentionally NO feedback (empty state)
  ];

  const chipByLabel = new Map(allChips.map((c) => [c.label, c.id]));

  for (const f of plan) {
    const { data: fb, error: fbErr } = await db
      .from("u_feedback")
      .insert({
        pitch_id: pitches[f.pitchIdx].id,
        juror_id: jurors[f.jurorIdx].id,
        note: f.note ?? null,
      })
      .select()
      .single();
    if (fbErr || !fb) throw fbErr ?? new Error("feedback insert failed");

    const junction = f.chipLabels.map((label) => {
      const chipId = chipByLabel.get(label);
      if (!chipId) throw new Error(`unknown chip label in seed plan: ${label}`);
      return { feedback_id: fb.id, chip_id: chipId };
    });
    if (junction.length > 0) {
      const { error: jErr } = await db.from("u_feedback_chips").insert(junction);
      if (jErr) throw jErr;
    }
  }

  // 7. Code sheet
  const line = "-".repeat(64);
  console.log(line);
  console.log(`  EVENT     ${event.name}`);
  console.log(`  WHEN      ${event.event_date}  ·  ${event.location}`);
  console.log(line);
  console.log(`  ORGANIZER ${appUrl}/o/${event.organizer_code}`);
  console.log(`  JURY CODE ${event.public_code}   →  ${appUrl}/e/${event.public_code}`);
  console.log(line);
  console.log("  FOUNDER LINKS (private - one per pitch)");
  for (const p of pitches) {
    console.log(`    ${p.name.padEnd(14)} ${appUrl}/f/${p.private_code}`);
  }
  console.log(line);
  console.log(
    `\nSeeded: ${pitches.length} pitches, ${jurors.length} jurors, ${plan.length} feedback submissions.`
  );
  console.log(`Tip: ${pitches[0].name} is the heavily-reviewed pitch; ${pitches[5].name} shows the empty state.`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

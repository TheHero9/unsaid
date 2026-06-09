-- Nondit - initial schema (u_* prefix, shared Supabase project)
-- RLS: ENABLED on every table with ZERO policies (deny-all) - deliberate.
-- All access is server-side via the service-role client; authorization is
-- capability codes. See specs/02-tech-stack/01-tech-stack.md.

-- u_events ------------------------------------------------------------------
create table public.u_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date,
  location text,
  public_code text not null unique,
  organizer_code text not null unique,
  created_at timestamptz not null default now()
);

alter table public.u_events enable row level security;

-- u_pitches -----------------------------------------------------------------
create table public.u_pitches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.u_events (id) on delete cascade,
  name text not null,
  description text,
  slides_url text,
  founder_email text,
  private_code text not null unique,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index u_pitches_event_id_idx on public.u_pitches (event_id);

alter table public.u_pitches enable row level security;

-- u_jurors ------------------------------------------------------------------
create table public.u_jurors (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.u_events (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index u_jurors_event_id_idx on public.u_jurors (event_id);

alter table public.u_jurors enable row level security;

-- u_chips -------------------------------------------------------------------
create table public.u_chips (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.u_events (id) on delete cascade,
  label text not null,
  sentiment text not null check (sentiment in ('positive', 'negative', 'neutral')),
  created_by uuid references public.u_jurors (id) on delete set null,
  created_at timestamptz not null default now()
);

create index u_chips_event_id_idx on public.u_chips (event_id);
create index u_chips_created_by_idx on public.u_chips (created_by);
-- upsert-by-label: a juror "creating" an existing label reuses the row
create unique index u_chips_event_label_uniq
  on public.u_chips (event_id, lower(trim(label)));

alter table public.u_chips enable row level security;

-- u_feedback ----------------------------------------------------------------
create table public.u_feedback (
  id uuid primary key default gen_random_uuid(),
  pitch_id uuid not null references public.u_pitches (id) on delete cascade,
  juror_id uuid not null references public.u_jurors (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

create index u_feedback_pitch_id_idx on public.u_feedback (pitch_id);
create index u_feedback_juror_id_idx on public.u_feedback (juror_id);

alter table public.u_feedback enable row level security;

-- u_feedback_chips ----------------------------------------------------------
create table public.u_feedback_chips (
  feedback_id uuid not null references public.u_feedback (id) on delete cascade,
  chip_id uuid not null references public.u_chips (id) on delete cascade,
  primary key (feedback_id, chip_id)
);

create index u_feedback_chips_chip_id_idx on public.u_feedback_chips (chip_id);

alter table public.u_feedback_chips enable row level security;

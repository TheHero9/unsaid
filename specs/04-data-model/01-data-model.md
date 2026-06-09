# Nondit - Data Model

ðŸš¨ Shared Supabase project `ujuqwwfhoubgzgtmpuis` (with parking + workouts +
remember-me). **Every object prefixed `u_`** - tables, indexes, triggers,
functions. Collision check before the first migration:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema='public' AND table_name LIKE 'u\_%' ESCAPE '\';
-- must be empty
```

## Tables (5)

### `u_events`
| column          | type        | notes |
| --------------- | ----------- | ----- |
| id              | uuid PK     | `gen_random_uuid()` |
| name            | text NOT NULL | |
| event_date      | date        | nullable |
| location        | text        | nullable |
| public_code     | text NOT NULL UNIQUE | 6-char Crockford base32 |
| organizer_code  | text NOT NULL UNIQUE | 14-char nanoid |
| created_at      | timestamptz NOT NULL default now() | |

### `u_pitches`
| column        | type        | notes |
| ------------- | ----------- | ----- |
| id            | uuid PK     | |
| event_id      | uuid NOT NULL FK â†’ u_events ON DELETE CASCADE | indexed |
| name          | text NOT NULL | product name (required per brief) |
| description   | text        | optional |
| slides_url    | text        | optional, validate https on input |
| founder_email | text        | optional - delivery is staff's choice |
| private_code  | text NOT NULL UNIQUE | 14-char nanoid - the founder's key |
| position      | int NOT NULL default 0 | pitch-list order |
| created_at    | timestamptz NOT NULL default now() | |

### `u_jurors`
| column     | type | notes |
| ---------- | ---- | ----- |
| id         | uuid PK | doubles as the cookie token |
| event_id   | uuid NOT NULL FK â†’ u_events ON DELETE CASCADE | indexed |
| name       | text NOT NULL | |
| created_at | timestamptz NOT NULL default now() | |

### `u_chips`
| column     | type | notes |
| ---------- | ---- | ----- |
| id         | uuid PK | |
| event_id   | uuid NOT NULL FK â†’ u_events ON DELETE CASCADE | indexed |
| label      | text NOT NULL | |
| sentiment  | text NOT NULL CHECK (sentiment IN ('positive','negative','neutral')) | |
| created_by | uuid FK â†’ u_jurors ON DELETE SET NULL | NULL = event default chip; indexed |
| created_at | timestamptz NOT NULL default now() | |

- UNIQUE index on `(event_id, lower(trim(label)))` - a juror "creating" an
  existing label reuses the row (upsert-by-label, keep original sentiment).

### `u_feedback`
| column     | type | notes |
| ---------- | ---- | ----- |
| id         | uuid PK | |
| pitch_id   | uuid NOT NULL FK â†’ u_pitches ON DELETE CASCADE | indexed |
| juror_id   | uuid NOT NULL FK â†’ u_jurors ON DELETE CASCADE | indexed |
| note       | text | optional one-liner; trim; NULL when empty |
| created_at | timestamptz NOT NULL default now() | |

### `u_feedback_chips`
| column      | type | notes |
| ----------- | ---- | ----- |
| feedback_id | uuid NOT NULL FK â†’ u_feedback ON DELETE CASCADE | |
| chip_id     | uuid NOT NULL FK â†’ u_chips ON DELETE CASCADE | indexed |
| PK          | (feedback_id, chip_id) | |

## Default chips (seeded per event on creation)

| label            | sentiment |
| ---------------- | --------- |
| unclear ask      | negative  |
| weak market size | negative  |
| rushed delivery  | negative  |
| too much jargon  | negative  |
| strong traction  | positive  |
| great team       | positive  |
| good demo        | positive  |
| confident        | positive  |
| clear problem    | positive  |
| memorable        | neutral   |
| bold claim       | neutral   |

(Refine copy freely at build time; keep ~8-12, balanced.)

## Integrity rules

- A feedback submission must have â‰¥1 chip OR a non-empty note (enforce in the
  server action - not a DB constraint, keep v1 simple)
- Juror must belong to the pitch's event - verify server-side on submit
- RLS: ENABLE on all 5 tables, zero policies (service-role only)
- Regenerate types after migrations â†’ `lib/supabase/database.types.ts`,
  filtered to `u_*`

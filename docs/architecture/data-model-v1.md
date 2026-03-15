# Vet Clinic Platform — Data Model v1

Status: Draft
Owner: John (Backend)
Scope: Core entities to support demo auth, multi‑animal owners, appointment scheduling, and message logging. Optimized for v1 simplicity with room to extend.

## ERD (text)

Owners (1) ──< Animals (N)
Owners (1) ──< Appointments (N) >── (1) Doctors
Animals (1) ──< Appointments (N)
Appointments (1) ──< Messages (N)
Owners (1) ──< Messages (N)
Doctors (1) ──< Messages (N)

Optional/Later: Doctor availability, schedule exceptions, Viber webhook events archive, integrations.

```
+---------+              +---------+
| owners  |1           N | animals |
+---------+--------------+---------+
| id (PK) |              | id (PK) |
| name    |              | owner_id|
| email U |              | name    |
| phone   |              | species |
| viberIdU|              | breed   |
| ...     |              | sex     |
+---------+              | dob     |
                         | chipIdU |
                         | notes   |
                         +---------+
                              |
                              | N
                              v
                         +-----------+
                         |appointments|
                         +-----------+
                         | id (PK)   |
    +---------+ 1      N | owner_id  |
    | doctors |----------| animal_id |
    +---------+          | doctor_id |
    | id (PK) |          | status    |
    | name    |          | reason    |
    | email U |          | start_at  |
    | phone   |          | end_at    |
    | spec    |          | ics_uid   |
    +---------+          | invite_st |
                         | created_by|
                         +-----------+
                              |
                              | 1
                              v
                          +---------+
                          | messages|
                          +---------+
                          | id (PK) |
                          | channel |
                          | dir     |
                          | owner_id|
                          | doctor_id
                          | appt_id |
                          | content |
                          | payload |
                          | sent_at |
                          | recv_at |
                          +---------+
```

Legend: U = unique, PK = primary key. dir=direction (inbound/outbound).

## Postgres DDL (initial draft)

Note: timestamps stored in UTC; app enforces Europe/Sofia for display. Naming: snake_case; plural table names.

```sql
create extension if not exists "uuid-ossp";

-- owners
create table if not exists owners (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email citext not null unique,
  phone text,
  viber_id text unique,
  created_at timestamptz not null default now()
);

-- animals
create table if not exists animals (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references owners(id) on delete cascade,
  name text not null,
  species text not null,
  breed text,
  sex text check (sex in ('male','female','unknown')) default 'unknown',
  dob date,
  microchip_id text unique,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_animals_owner on animals(owner_id);

-- doctors
create table if not exists doctors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email citext not null unique,
  phone text,
  specialization text,
  created_at timestamptz not null default now()
);

-- appointments
create type appt_status as enum ('scheduled','confirmed','completed','canceled');
create type created_by as enum ('owner','doctor','system');

create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references owners(id) on delete restrict,
  animal_id uuid not null references animals(id) on delete restrict,
  doctor_id uuid not null references doctors(id) on delete restrict,
  status appt_status not null default 'scheduled',
  reason text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  location text,
  ics_uid text,
  invite_status text check (invite_status in ('pending','sent','failed')) default 'pending',
  -- invite_email will be derived at the app layer (typically owner.email for owner bookings
  -- and/or doctor.email for internal confirmations); persisted only if needed later
  created_by created_by not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_appt_doctor_time on appointments(doctor_id, start_at);
create index if not exists idx_appt_animal_time on appointments(animal_id, start_at);
create index if not exists idx_appt_owner on appointments(owner_id);

-- messages
create type msg_channel as enum ('viber','app');
create type msg_direction as enum ('inbound','outbound');

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  channel msg_channel not null,
  direction msg_direction not null,
  owner_id uuid references owners(id) on delete set null,
  doctor_id uuid references doctors(id) on delete set null,
  appointment_id uuid references appointments(id) on delete set null,
  content text,
  payload_json jsonb,
  sent_at timestamptz,
  received_at timestamptz
);
create index if not exists idx_messages_owner on messages(owner_id);
create index if not exists idx_messages_doctor on messages(doctor_id);
create index if not exists idx_messages_appt on messages(appointment_id);
create index if not exists idx_messages_sent_at on messages(sent_at);

-- audit_events (minimal v1)
create table if not exists audit_events (
  id uuid primary key default uuid_generate_v4(),
  actor_type text check (actor_type in ('owner','doctor','system')) not null,
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  meta_json jsonb,
  occurred_at timestamptz not null default now()
);
create index if not exists idx_audit_entity on audit_events(entity_type, entity_id);
create index if not exists idx_audit_time on audit_events(occurred_at);
```

## Notes
- Demo auth: seed one doctor and one owner (role mapping can be layered later via a users table if needed).
- Calendar invites: ics_uid + invite_status support SMTP + .ics in v1; can extend for provider-specific IDs later.
- Data retention/backups: daily backups; minimal PII in logs; messages.payload_json stores raw webhook payloads (Viber) when needed.
- Messages content: cap stored content length (e.g., 4–8 KB) and avoid sensitive PII in logs; prefer IDs/refs over raw payloads in application logs.
- Invite email: derived at the app layer from owner.email and/or doctor.email depending on flow; not stored as a separate column in v1.
- Future tables (out of v1): doctor_availability, schedule_exceptions, conversations, integration_credentials.

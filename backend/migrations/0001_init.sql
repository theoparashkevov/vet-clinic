-- 0001_init.sql
-- Purpose: Initialize core schema for Vet Clinic v1
-- Idempotency: CREATE IF NOT EXISTS used where possible; custom types checked via DO blocks
-- Rollback: DROP statements provided for dev; in prod, prefer forward-only with corrective migrations

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists citext;

-- Types (guarded creation)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appt_status') THEN
    CREATE TYPE appt_status AS ENUM ('scheduled','confirmed','completed','canceled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'created_by') THEN
    CREATE TYPE created_by AS ENUM ('owner','doctor','system');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'msg_channel') THEN
    CREATE TYPE msg_channel AS ENUM ('viber','app');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'msg_direction') THEN
    CREATE TYPE msg_direction AS ENUM ('inbound','outbound');
  END IF;
END $$;

-- Tables
create table if not exists owners (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email citext not null unique,
  phone text,
  viber_id text unique,
  created_at timestamptz not null default now()
);

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

create table if not exists doctors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email citext not null unique,
  phone text,
  specialization text,
  created_at timestamptz not null default now()
);

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
  created_by created_by not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_appt_doctor_time on appointments(doctor_id, start_at);
create index if not exists idx_appt_animal_time on appointments(animal_id, start_at);
create index if not exists idx_appt_owner on appointments(owner_id);

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

-- Seed demo data (idempotent)
INSERT INTO owners (id, name, email, phone)
VALUES (
  '00000000-0000-0000-0000-0000000000a1', 'Demo Owner', 'owner.demo@example.com', '+35980000001'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO doctors (id, name, email, phone, specialization)
VALUES (
  '00000000-0000-0000-0000-0000000000d1', 'Demo Doctor', 'doctor.demo@example.com', '+35980000002', 'General'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO animals (id, owner_id, name, species, breed, sex)
VALUES (
  '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000a1', 'Rex', 'dog', 'mixed', 'male'
) ON CONFLICT DO NOTHING;

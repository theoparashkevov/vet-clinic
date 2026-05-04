# Architecture – Veterinary Clinic Web System (Initial Draft)

Status: v0.1 (draft) – optimized for small, iterative 15‑min cycles

## Tech Stack
- Frontend: Vite + React + TypeScript + TanStack Router + TanStack Query + shadcn/ui (Radix UI + Tailwind CSS)
- Backend: Node.js (NestJS) + TypeScript
- Database: PostgreSQL (Prisma ORM)
- Messaging: Viber Bot API integration (planned — not yet implemented)
- AI Layer: Tool-enabled LLM endpoints (planned)
- Auth: JWT (doctors/staff); `_authenticated` layout guard on frontend
- Infra/Dev: Docker Compose for local + production, GitHub Actions for CI

## High-Level Components
- web-new/ (Vite + React):
  - Doctor dashboard (patients, visits, appointments, billing, tasks)
  - File-based routing via TanStack Router; data fetching via TanStack Query
- api/ (NestJS):
  - Modules: auth, patients, owners, appointments, medical-records, billing, tasks, analytics
  - Tool endpoints for AI assistant (planned)
- db/ (Prisma):
  - Schema: patients, owners, appointments, medical_records, users, roles, clinics
- docs/:
  - PROJECT_PLAN.md, ORCHESTRATION.md, ARCHITECTURE.md, BACKLOG.md, ADRs/, tech-specs/

## Folder Structure (monorepo)
```
vet-clinic/
  api/
    src/
      modules/
        appointments/
        patients/
        owners/
        medical-records/
        auth/
        analytics/
    prisma/
      schema.prisma
    Dockerfile
  web-new/
    src/
      routes/
        _authenticated/
      components/
      lib/
    Dockerfile
  docs/
    PROJECT_PLAN.md
    ORCHESTRATION.md
    ARCHITECTURE.md
    BACKLOG.md
    DEPLOY.md
    adr/
    tech-specs/
  scripts/
    kill_process.sh
  .docker/
    docker-compose.yml
    docker-compose.prod.yml
  .github/workflows/
  README.md
```

## Core Domain Models (initial)
- Owner: id, name, phone, email?, createdAt
- Patient: id, ownerId, name, species, breed, birthdate, microchipId?, notes, allergies?, chronicConditions?, createdAt
- Appointment: id, patientId, ownerId, doctorId?, startsAt, endsAt, reason, status (scheduled/cancelled/completed), createdAt
- MedicalRecord: id, patientId, visitDate, summary, diagnoses[], treatments[], prescriptions[], attachments[]
- User: id, name, email, role (doctor, staff, admin)

## APIs (initial, REST)
- GET /patients?query=…
- POST /patients (owner attach or create)
- GET /patients/:id (includes timeline)
- POST /appointments (create)
- GET /appointments/slots?date=YYYY-MM-DD
  - Returns: { date: 'YYYY-MM-DD', slots: ISODateTime[] }
  - Notes: currently mocked in api (fixed 20-min slots 09:00–10:40); will move to service with configurable clinic hours
- POST /owners
- POST /tools/create-appointment (LLM tool)
- POST /tools/register-client (LLM tool)
- POST /tools/register-patient (LLM tool)

## Security
- JWT for staff; role-based guards in NestJS
- Transport: HTTPS only in production
- PII: limit exposure in logs; per-tenant/clinic isolation later

## Observability
- Request logging (pino), basic metrics (Prometheus-ready), healthchecks

## Iteration Strategy
- Start with schema + appointments flow (guest booking + doctor view)
- Add Viber bot adapter → tool endpoints → booking via chat
- Expand patient/owner management + timeline

## Open Questions
- Final UI kit choice (MUI vs Mantine)
- Hosting targets for first demo
- Multiclinic/tenancy model timing

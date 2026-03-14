# Architecture – Veterinary Clinic Web System (Initial Draft)

Status: v0.1 (draft) – optimized for small, iterative 15‑min cycles

## Tech Stack (proposed)
- Frontend: Next.js (App Router) + TypeScript + Material UI (or Mantine)
- Backend: Node.js (NestJS) + TypeScript
- Database: PostgreSQL (Prisma ORM)
- Messaging: Viber Bot API integration service (Node.js)
- AI Layer: Tool-enabled LLM endpoints (OpenAI-compatible client)
- Auth: JWT (doctors/staff), session cookies for web; API keys/tokens for bot service
- Infra/Dev: Docker Compose for local, GitHub Actions for CI, Fly.io/Render/Heroku for quick staging

## High-Level Components
- web/ (Next.js):
  - Doctor dashboard (patients, visits, appointments)
  - Client booking (guest-first), optional account portal
- api/ (NestJS):
  - Modules: auth, patients, owners, appointments, medical-records, inventory (later), billing (later)
  - Tool endpoints for AI assistant (e.g., POST /tools/create-appointment)
- bot/ (Viber service):
  - Webhook receiver, message parser, stateful prompt flow, calls api/tools
- db/ (Prisma):
  - Schema: patients, owners, appointments, medical_records, users, roles, clinics
- docs/:
  - PROJECT_PLAN.md, ORCHESTRATION.md, ARCHITECTURE.md, BACKLOG.md, ADRs/

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
        tools/
    prisma/
      schema.prisma
    Dockerfile
  web/
    app/
    components/
    lib/
    Dockerfile
  bot/
    src/
    Dockerfile
  docs/
    PROJECT_PLAN.md
    ORCHESTRATION.md
    ARCHITECTURE.md
    BACKLOG.md
    adr/
  .github/workflows/
  docker-compose.yml
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

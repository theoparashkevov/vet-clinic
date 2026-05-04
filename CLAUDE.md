# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Monorepo (npm workspaces) for a veterinary clinic platform with two packages:
- `api/` — NestJS + Prisma + PostgreSQL REST API
- `web-new/` — Vite + React + TanStack Router + shadcn/ui frontend

## Commands

### Local development

```bash
# Start the database
docker compose -f .docker/docker-compose.yml up -d db

# API (port 3000)
cd api && npm run start:dev

# Web (port 3001)
cd web-new && npm run dev
```

### Docker

```bash
docker compose -f .docker/docker-compose.yml up -d db   # PostgreSQL only
docker compose -f .docker/docker-compose.yml up api      # API + DB
docker compose -f .docker/docker-compose.prod.yml up     # Production stack
```

### Database (run from repo root or api/)

```bash
npm run api:prisma:generate    # Regenerate Prisma client after schema changes
npm run api:prisma:migrate     # Run pending migrations (dev)

# From api/ directly:
npm run prisma:migrate
npm run prisma:create-migration   # Create a new migration without applying it
```

### Build

```bash
cd api && npm run build       # tsc → dist/
cd web-new && npm run build   # vite build
```

### Tests

No test suite is set up yet (`npm test` prints "test TBD").

## Architecture

### API (`api/`)

NestJS app with:
- **Global prefix `/v1`** on all routes except `GET /health`
- **Global `ValidationPipe`** with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- **`PrismaModule`** is global — inject `PrismaService` anywhere without re-importing
- Port from `PORT` env var, defaults to `3000`

Module layout follows NestJS conventions: each domain (`owners/`, `appointments/`, etc.) has its own module, controller, service, and `dto.ts`.

**Implemented endpoints:**
- `GET /health` → `{ ok: true }`
- `GET/POST/PUT/DELETE /v1/owners/:id` (full CRUD via `OwnersModule`)
- `GET /v1/appointments/slots?date=YYYY-MM-DD` (mocked response)

**Not yet implemented (referenced by frontend):**
- `GET /v1/patients`

### Web (`web-new/`)

Vite + React SPA. Routes live in `web-new/src/routes/` and are file-based via TanStack Router. All data fetching uses TanStack Query (`useQuery`/`useMutation`) through `fetchWithAuth` from `src/lib/api.ts`.

- API calls proxied through Vite dev server (`/v1` → `http://localhost:3000`); env var `VITE_API_URL` used for production builds
- UI library: shadcn/ui (Radix UI primitives + Tailwind CSS)
- Auth: JWT stored in `localStorage`, `_authenticated` layout guard wraps all protected routes
- Nav: Dashboard, Patients, Appointments, Tasks, Billing, Medical Records, Lab Results, Prescriptions, Admin

### Database

PostgreSQL 16 via Prisma 5. Schema at `api/prisma/schema.prisma`.

**Core models:** `Owner` → `Patient` → `Appointment`, `MedicalRecord`, `User`

Foreign key deletes use `RESTRICT` (cannot delete a parent while children exist).

Connection string: `DATABASE_URL=postgresql://vet:vet@localhost:5432/vet?schema=public` (localhost for local dev, `db` hostname inside Docker).

## Environment variables

| Variable | Where | Default |
|---|---|---|
| `DATABASE_URL` | `api/` | see `api/.env.example` |
| `PORT` | `api/` | `3000` |
| `NODE_ENV` | `api/` | — |
| `VITE_API_URL` | `web-new/` | `http://localhost:3000` |

Copy `api/.env.example` → `api/.env` before running locally.

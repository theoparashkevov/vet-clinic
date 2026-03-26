# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Monorepo (npm workspaces) for a veterinary clinic platform with three packages:
- `api/` — NestJS + Prisma + PostgreSQL REST API
- `web/` — Next.js 14 (App Router) + MUI frontend
- `bot/` — Viber chatbot adapter (placeholder)

## Commands

### Local development

```bash
# Start the database
docker compose up -d db

# API (port 3000)
cd api && npm run start:dev

# Web (port 3001 or 3000 if api isn't running)
cd web && npm run dev
```

### Docker

```bash
docker compose up -d db        # PostgreSQL only
docker compose up api          # API + DB
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
cd api && npm run build   # tsc → dist/
cd web && npm run build   # next build
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

### Web (`web/`)

Next.js 14 App Router. Pages live in `web/app/`. All data fetching is client-side via `useEffect` + `fetch`.

- API base URL: `NEXT_PUBLIC_API_URL` env var (defaults to `http://localhost:3000`)
- UI library: MUI v5 with Emotion
- Nav: Home (`/`), Patients (`/patients`), Appointments (`/appointments`)

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
| `NEXT_PUBLIC_API_URL` | `web/` | `http://localhost:3000` |

Copy `api/.env.example` → `api/.env` before running locally.

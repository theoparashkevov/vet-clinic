# Vet Clinic

A web system for veterinary clinics — appointment booking, patient management, and medical history.

## Quick start (demo)

Requires **Node.js 20+**. No Docker needed — uses SQLite by default.

```bash
git clone https://github.com/theoparashkevov/vet-clinic.git
cd vet-clinic
./start.sh
```

| Service | URL |
|---------|-----|
| Web app | http://localhost:3001 |
| API     | http://localhost:3000 |

The script installs dependencies, creates a local SQLite database, seeds demo data, and starts both services.

**Reset demo data at any time:**

```bash
./start.sh --reset
```

## Demo data included

- **3 doctors** — Dr. Ivanova, Dr. Dimitrov, Dr. Georgieva
- **4 owners** with **6 patients** (dogs, cats, a rabbit)
- **5 appointments today** spread across doctors
- **6 past completed appointments** with full medical records
- **1 appointment tomorrow**

## What's in the app

| Feature | Description |
|---------|-------------|
| Dashboard | Today's appointments at a glance |
| Patients | Search, create, and view patient profiles |
| Patient detail | Medical history timeline + past appointments |
| Appointments | Filter by doctor and date, status tracking |
| Booking | 3-step flow: pick doctor → available slot → patient + reason |
| Medical records | Add visit summaries, diagnoses, treatments, prescriptions |

## Packages

| Package | Stack |
|---------|-------|
| `api/` | NestJS · Prisma · SQLite (demo) / PostgreSQL (prod) |
| `web/` | Next.js 14 App Router · MUI v5 |
| `bot/` | Viber adapter (scaffold) |

## Production setup (PostgreSQL)

1. In `api/prisma/schema.prisma` change `provider = "sqlite"` → `"postgresql"`
2. Set `DATABASE_URL` in `api/.env` to a PostgreSQL connection string
3. Run `npm run api:prisma:migrate` to apply migrations
4. Start with Docker: `docker compose up -d db && docker compose up api`

## Development

```bash
# Run API + web together
npm run dev

# Individual services
cd api && npm run start:dev
cd web && npm run dev

# Database (demo/SQLite)
npm run api:prisma:push    # sync schema → dev.db
npm run api:prisma:seed    # seed demo data

# Database (production/PostgreSQL)
npm run api:prisma:migrate
```

API prefix: all routes are under `/v1` except `GET /health`.

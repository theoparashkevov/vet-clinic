---
name: Vet Clinic Tech Stack & Architecture
description: POC vet clinic monorepo - NestJS API with Prisma/Postgres, Next.js 14 frontend with MUI v5
type: project
---

Monorepo with two packages:
- **api/**: NestJS 10, Prisma 5, PostgreSQL. Global prefix `/v1` (except GET /health). Global ValidationPipe with whitelist+forbidNonWhitelisted+transform. PrismaModule is global.
- **web/**: Next.js 14 App Router, MUI v5, client-side data fetching with useEffect+fetch.

**Why:** POC for veterinary clinic management — patient management, appointment booking with doctor availability, medical history tracking.

**How to apply:** Follow existing NestJS patterns (controller+service+module+dto.ts). Frontend uses `process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'` for API base. No auth for this POC.

Database: PostgreSQL on local Docker (postgres:15-alpine, user=postgres, password=postgres, port=5432, db=vet). The .env file is gitignored; .env.example has the template.

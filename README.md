# Vet Clinic Monorepo

Packages:
- api/ (NestJS + Prisma)
- web/ (Next.js + MUI)
- bot/ (Viber adapter)

Runbook:
- docker compose up -d db
- docker compose up api  # serves API on http://localhost:3000 (GET /health)
- (later) docker compose up web

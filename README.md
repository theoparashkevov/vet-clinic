# Vet Clinic Monorepo

Packages
- api/ (NestJS + Prisma + PostgreSQL)
- web/ (Next.js + MUI)
- bot/ (Viber adapter)

Quick start (main branch)
1) Start Postgres (Docker):
   - docker compose up -d db
2) API (host-run):
   - cd api
   - cp .env.example .env
   - Ensure .env has: DATABASE_URL=postgresql://vet:vet@localhost:5432/vet?schema=public
   - npm install
   - npx prisma generate
   - npx prisma migrate deploy
   - npm run build && node dist/main.js
   - Check: curl http://localhost:3000/health -> { ok: true }
3) Web (optional):
   - cd web
   - cp .env.local.example .env.local
   - npm install
   - npm run dev
   - Open the printed local URL (NEXT_PUBLIC_API_URL defaults to http://localhost:3000)

Endpoints
- Health: GET /health
- API v1 prefix: /v1
  - Owners: /v1/owners (list/get/create/update/delete)
  - Patients: /v1/patients (when merged)
  - Appointments: /v1/appointments (when merged)
- Slots demo: GET /appointments/slots?date=YYYY-MM-DD

Notes
- Keep main always runnable: feature work lands behind separate branches/PRs, migrations are deployed via `prisma migrate deploy`.
- For Dockerized API instead of host-run, ensure nothing else binds :3000 locally, then: docker compose up -d --build api
- CI smoke workflow is prepared (pending workflow scope) to validate: Postgres service + prisma migrate deploy + build + GET /health.

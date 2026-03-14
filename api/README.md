# api (NestJS)

- Tech: NestJS + Prisma + PostgreSQL

## Current status
- Minimal NestJS app boots and serves GET /health -> { status: 'ok' }
- Prisma schema present (prisma/schema.prisma)

## Local dev
- npm install (in repo root or here)
- npm run start:dev (in api/) — listens on :3000
- Or via Docker: `docker compose up api`

## Next steps
- Add NestJS modules: auth, patients, owners, appointments (stubs)
- Wire PrismaService and run initial migration
- Expose basic REST stubs with DTO validation

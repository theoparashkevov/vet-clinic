# Draft: App Rewrite Plan

## Git / Branching Decisions
- **Source branch**: `main`
- **Archive main as**: `main_2026-04-30` (current date — TBC with user)
- **Work branch**: Separate branch for rewrite (name TBD)
- **Uncommitted changes noted**: `api/prisma/seed.ts`, `package-lock.json`, `business/`

## What We Know About Current Stack
- Monorepo (npm workspaces)
- `api/`: NestJS + Prisma + PostgreSQL REST API
- `web/`: Next.js 14 (App Router) + MUI v5 + Emotion
- `bot/`: Viber chatbot adapter (placeholder)
- Endpoints: Owners CRUD, appointments slots stub, patients (referenced by frontend but not implemented)
- No test suite yet (`npm test` prints "test TBD")

## Open Questions
- What stays? What goes? What's new?
- Is this a full rewrite of everything, or targeted areas?
- Tech stack changes?
- Features and scope?

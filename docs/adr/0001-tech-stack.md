# ADR 0001: Tech Stack and Monorepo

Decision: Use a Node/TypeScript monorepo with NestJS (api), Prisma (Postgres), and a Vite + React SPA (web-new).

Status: Accepted (amended 2026-05-04)
Date: 2026-03-14

Original decision: Next.js (App Router) + MUI for the frontend.
Amendment (2026-05-04): Frontend migrated to Vite + React + TanStack Router + shadcn/ui (`web-new/`). The `web/` (Next.js) and `bot/` (Viber) packages were removed; bot integration remains a planned feature, not an active package.

Rationale:
- Strong TS ecosystem across web/api
- Rapid iteration with shared types
- Good DX with Prisma and Vite
- Clear separation of concerns across packages
- Vite + TanStack Router preferred over Next.js for this SPA use case (no SSR needed)

Consequences:
- Single repo CI with per-package workflows
- Shared lint/build tooling
- Docker Compose configs live in `.docker/` subdirectory

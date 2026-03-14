# ADR 0001: Tech Stack and Monorepo

Decision: Use a Node/TypeScript monorepo with Next.js (web), NestJS (api), Prisma (Postgres), and a Node-based Viber bot service.

Status: Accepted
Date: 2026-03-14

Rationale:
- Strong TS ecosystem across web/api/bot
- Rapid iteration with shared types
- Good DX with Prisma and Next.js
- Clear separation of concerns across packages

Consequences:
- Single repo CI with per-package workflows
- Shared lint/build tooling

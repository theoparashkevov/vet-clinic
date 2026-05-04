# Backlog (v0.1) – 15‑Minute Cycle Tasks

Legend: [A]=Architect/Orchestrator, [B]=Backend Agent, [F]=Frontend Agent, [D]=DevOps/DB Agent

## Highest Priority (Cycle 1–3)
1. [A] Create monorepo scaffolding (folders, minimal READMEs)
   - Accept: api/, web-new/, docs/, .docker/ placeholders committed
   - Status: DONE (C1)
2. [D] Initialize Prisma schema (owners, patients, appointments, medical_records, users)
   - Accept: schema.prisma + migration, docker-compose with Postgres
   - Status: PARTIAL — schema present; migration pending
3. [B] NestJS bootstrap with modules: auth, patients, owners, appointments
   - Accept: compiles, healthcheck endpoint, basic REST stubs
   - Status: PARTIAL — app compiles; GET /health live; appointments controller added; other modules + stubs pending
4. [B] Tool endpoints: create_appointment, get_available_slots, create_client_profile (mocked)
   - Accept: validated payloads, returns mocked data, unit tests for DTO validation
5. [F] Vite + React app bootstrap with doctor dashboard shell (web-new/)
   - Accept: layout, nav, placeholder pages (Patients, Appointments)
   - Status: DONE

## Next (Cycle 4–6)
6. [B] Implement appointments slots logic (configurable clinic hours)
   - Accept: GET /appointments/slots returns slots for a date
   - Status: PARTIAL — endpoint stub returns mocked slots; move to service + config next
7. [F] Appointment create form (doctor UI)
   - Accept: form posts to API, shows success/error
8. [B] Patient CRUD (attach to owner)
   - Accept: POST /patients creates patient + owner attach
9. [F] Patient list + detail view (timeline placeholder)
   - Accept: list with search, detail shows basic info and timeline stub

## Messaging Integration
10. [B] Viber bot service scaffold (webhook, message router)
    - Accept: receives webhook, logs messages
11. [B] Bot-to-API bridge for tools endpoints
    - Accept: minimal flow: question → collect fields → call create_appointment (mock)

## Quality/Infra
12. [D] Dockerfiles for api/web-new + docker-compose (api+db up)
    - Accept: `docker compose -f .docker/docker-compose.yml up` serves API + Postgres; web builds
    - Status: PARTIAL — api Dockerfile added; compose runs db+api; prod compose in .docker/
13. [D] GitHub Actions: lint/test/build on PR
    - Accept: basic CI passing

## Documentation
14. [A] ADR-0001: Tech stack + monorepo decision
15. [A] Update ARCHITECTURE.md with endpoint contracts/examples

## Notes (today)
- Cleaned NestJS bootstrap to use AppModule; removed duplicate inline controller in main.ts
- Added appointments controller with GET /appointments/slots returning mocked slots (next: service + config)


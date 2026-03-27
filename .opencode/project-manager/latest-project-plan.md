---
title: "Latest Project Plan"
project: "Vet Clinic Platform"
version: "1.1"
status: "In Progress"
owner: "teo"
stakeholders:
  - "teo"
last_updated: "2026-03-27T12:35:00Z"
---

# Executive Summary

The Vet Clinic Platform is a monorepo (npm workspaces) veterinary clinic management system with three packages: a NestJS REST API (`api/`), a Next.js 14 frontend (`web/`), and a Viber chatbot adapter (`bot/`). The project aims to streamline daily clinic operations for veterinary doctors while providing pet owners with easy appointment booking and communication.

**Current status**: A minimal MVP is live end-to-end (API + Web) with **SQLite demo mode**, **PostgreSQL via Docker**, and **JWT authentication with role-based access** (staff/admin/doctor). The next focus is **UI modernization** (industry-standard design system + consistent layout/components) and 2–3 core features that build on the MVP: **calendar scheduling**, **patient timeline**, and **admin user management**.

# Goals & Success Criteria

- **Goal 1**: Provide veterinary doctors with a modern web interface to manage patients, appointments, and medical records with minimal clicks
- **Goal 2**: Allow pet owners to easily book appointments via web or Viber chatbot
- **Goal 3**: Integrate an LLM-powered chatbot for conversational appointment booking via Viber
- **Success metric**: Full CRUD for all core entities with validation, auth, and role-based access
- **Success metric**: End-to-end appointment booking flow (web + chatbot)
- **Success metric**: CI/CD pipeline with tests, lint, and automated deployment
- **Success metric**: Docker-based production deployment with PostgreSQL

# Scope

## In Scope (MVP)
- Doctor dashboard with patient management, appointment scheduling, medical records
- Owner/patient CRUD with search
- Appointment booking with time slot management
- Medical records per patient with visit history
- Authentication (JWT) and role-based access (doctor, staff, client)
- Viber bot with LLM-powered appointment booking
- PostgreSQL production database
- Docker deployment
- CI/CD pipeline (lint, test, build)

## Out of Scope (Future)
- Inventory management
- Billing & invoicing
- Lab results integration
- Telemedicine / video visits
- Mobile app
- SMS reminders
- Multi-clinic / tenancy
- AI diagnostic assistant

# Current State Assessment

## What's Done ✅

| Area | Status | Details |
|---|---|---|
| Monorepo scaffolding | ✅ Complete | npm workspaces with api/, web/, bot/ |
| Prisma schema | ✅ Complete | Owner, Patient, Appointment, MedicalRecord, User (+ `passwordHash`) |
| Seed data | ✅ Complete | Doctors + admin/staff/client demo users; owners/patients/appointments/records |
| Owners CRUD (API) | ✅ Complete | GET/POST/PUT/DELETE /v1/owners |
| Patients CRUD (API) | ✅ Complete | GET/POST/PUT/DELETE /v1/patients |
| Appointments (API) | ✅ Complete | GET/POST/PUT/DELETE /v1/appointments + GET by id + patientId filter + slots |
| Medical Records (API) | ✅ Complete | GET/POST/PUT for patient medical records |
| Doctors listing (API) | ✅ Complete | GET /v1/doctors |
| Auth (API) | ✅ Complete | POST /v1/auth/login, GET /v1/auth/me, JWT + roles guards |
| Dashboard (Web) | ✅ Complete | Today's appointments + patient count |
| Patients list+detail (Web) | ✅ Complete | Search, create dialog, detail with medical history |
| Appointments view (Web) | ✅ Complete | Date/doctor filters, booking dialog |
| Booking dialog (Web) | ✅ Complete | 3-step stepper: doctor+date → slot → patient+reason |
| Medical record dialog (Web) | ✅ Complete | Create medical record form |
| SQLite dev mode | ✅ Complete | start.sh bootstraps with SQLite + seeds demo users |
| PostgreSQL Docker mode | ✅ Complete | docker-compose runs Postgres + API (+ optional web) |
| Dual Prisma schemas | ✅ Complete | Switchable sqlite/postgres Prisma schemas |
| Jest scaffolding | ✅ Complete | Jest configs + scripts for api/ and web/ |
| ADR-0001 | ✅ Complete | Tech stack decision documented |

## What's Missing / Broken ❌

| Area | Priority | Details |
|---|---|---|
| UI consistency / modern design system | P0 | Phase 1 complete (theme + shell + standard states). Phase 2 pending (tables/forms/dialog patterns + toasts). |
| CI/CD pipeline | P0 | No workflow for build/test/lint on PRs |
| Linting / formatting | P1 | No ESLint/Prettier baseline enforced |
| Real tests | P1 | Jest exists but coverage is near-zero; no guard/role tests |
| No pagination | P1 | All list endpoints return all records |
| Bot package | P2 | Placeholder only — no package.json or code |
| Scheduling rules enforcement | P1 | API does not prevent overlapping appointments; slots are advisory |
| Shared types | P2 | Types duplicated between API and web |
| Error handling (Web) | P1 | Needs global error UX + consistent empty/loading states |
| Calendar view | P1 | Appointments shown as table only |
| Stale backend/ directory | P3 | Orphaned SQL migration from earlier approach |
| Weight history tracking | P3 | In project plan but not in schema |
| Attachments for medical records | P3 | Field exists in schema but not used |

# Timeline & Milestones

| Milestone | Target Date | Owner | Status |
|---|---|---|---|
| M1: MVP hardening complete (auth + docker + dual DB) | 2026-03-27 | teo | Done |
| M2: UI Modernization (design system + layout + UX patterns) | 2026-04-10 | TBD | Proposed |
| M3: Scheduling v1 (calendar + overlap prevention + clinic hours) | 2026-04-24 | TBD | Proposed |
| M4: Patient timeline v1 (appointments + medical records timeline) | 2026-05-08 | TBD | Proposed |
| M5: Admin user management v1 (users CRUD + reset password) | 2026-05-22 | TBD | Proposed |
| M6: Quality gates (CI + lint + tests) | 2026-06-05 | TBD | Proposed |

# Backlog & Priorities

## P0 — Next Up (UI + 2–3 features)

| # | Task | Estimate | Owner | Status |
|---|---|---|---|---|
| 33 | **UI design system decision** (MUI refresh) + style guide | 4h | teo | Done |
| 34 | UI modernization Phase 1: app shell, typography, spacing, empty/loading/error states | 12h | frontend-developer | Done |
| 35 | UI modernization Phase 2: tables/forms patterns, consistent dialogs, toasts | 12h | frontend-developer | Done |
| 37 | Scheduling rules: prevent overlaps on create/update | 10h | backend-developer | Done |
| 36 | Scheduling v1: calendar view (day/week) + filter + status updates | 16h | frontend-developer | Done |
| 38 | Patient timeline v1: unified timeline (appointments + medical records) on patient page | 12h | frontend-developer | Done |
| 39 | Admin user management v1: list users | 14h | frontend-developer | Done |

## P1 — High Priority

| # | Task | Estimate | Owner | Status |
|---|---|---|---|---|
| 9 | Add pagination to all list endpoints (API + Web) | 4h | TBD | Pending |
| 14 | GitHub Actions CI workflow (lint, test, build on PR) | 4h | TBD | Pending |
| 40 | ESLint + Prettier baseline across api/web | 3h | TBD | Pending |
| 41 | Auth UX: better 401/403 handling, session expiry, user menu | 4h | TBD | Pending |
| 42 | Add basic API guard tests (auth required + role checks) | 6h | TBD | Pending |
| 16 | Add request logging (pino or similar) | 2h | TBD | Pending |
| 17 | Error boundaries and global error handling in Web app | 2h | TBD | Pending |

## P2 — Medium Priority

| # | Task | Estimate | Owner | Status |
|---|---|---|---|---|
| 18 | Bot package: initialize package.json, scaffold webhook receiver | 4h | TBD | Pending |
| 19 | Bot: message router and minimal flow | 4h | TBD | Pending |
| 20 | Bot: LLM integration with tool-calling for appointment booking | 8h | TBD | Pending |
| 21 | Tool endpoints for LLM (`/tools/create-appointment`, etc.) | 4h | TBD | Pending |
| 22 | Calendar view v2 (drag/drop reschedule, multi-day, virtualization) | 12h | TBD | Pending |
| 23 | Shared types package between API and Web | 3h | TBD | Pending |
| 24 | Guest booking flow (book without existing patient/owner) | 4h | TBD | Pending |
| 25 | Medical record attachments (file upload) | 6h | TBD | Pending |
| 26 | Patient detail page: timeline view for medical history | 3h | TBD | Pending |

## P3 — Nice to Have

| # | Task | Estimate | Owner | Status |
|---|---|---|---|---|
| 27 | Weight history tracking (schema + API + UI) | 4h | TBD | Pending |
| 28 | Vaccination records (separate from medical records) | 6h | TBD | Pending |
| 29 | Appointment reminders (email/notification) | 6h | TBD | Pending |
| 30 | Remove stale backend/ directory | 0.5h | TBD | Pending |
| 31 | Responsive design polish (mobile/tablet) | 4h | TBD | Pending |
| 32 | Configurable clinic hours for slot generation | 2h | TBD | Pending |

# Sprints / Iterations

## Sprint A: UI Modernization (2 weeks)
**Goal**: Make the MVP feel modern, consistent, and faster to use.

### Design system decision (Task #33)

**Confirmed**: **MUI-first refresh** (stay on MUI v5).

UI modernization acceptance criteria (Sprint A):
- Single MUI theme with tokens (color, typography, spacing, shape) applied globally
- App shell with responsive header/nav, user menu, and consistent page containers
- Standard UI states: loading skeleton/spinner, empty states, error states (incl. 401/403)
- Consistent table + form layouts, dialog styles, and button hierarchy
- Toast notifications for create/update/delete flows

Committed backlog:
- [x] #33 — Decide design system + write UI style guide (MUI refresh)
- [x] #34 — Phase 1: shell/layout + typography/spacing + empty/loading/error states
- [x] #35 — Phase 2: tables/forms/dialog patterns + toast notifications

## Sprint B: Scheduling v1 (2 weeks)
**Goal**: Make appointments feel like a real clinic scheduler.

- [x] #36 — Calendar view v1 (day/week) + status updates
- [x] #37 — Enforce scheduling rules (overlap prevention + clinic hours for slots)

## Sprint C: Patient Timeline v1 (1 week)
**Goal**: Faster clinical workflow on patient detail.

- [ ] #38 — Unified timeline (appointments + medical records)

## Sprint D: Admin User Management v1 (1 week)
**Goal**: Manage staff access without touching the DB.

- [ ] #39 — Users CRUD + role assignment + password reset

## Sprint E: Quality Gates (1–2 weeks)
**Goal**: Make changes safe to ship.

- [ ] #40 — ESLint + Prettier
- [ ] #14 — CI workflow
- [ ] #42 — Guard/role tests
- [ ] #9 — Pagination

## Sprint 5–6: Bot & LLM (Weeks of Apr 28 – May 9)
**Goal**: Viber chatbot with LLM-powered appointment booking

- [ ] #18 — Bot scaffold
- [ ] #19 — Message router
- [ ] #20 — LLM integration
- [ ] #21 — Tool endpoints

## Sprint 7: Polish (Week of May 12 – May 16)
**Goal**: UX improvements and remaining features

- [ ] #22 — Calendar view
- [ ] #23 — Shared types
- [ ] #24 — Guest booking
- [ ] #26 — Timeline view

# Team & Roles

| Role | Person | Responsibilities |
|---|---|---|
| Project Owner / Manager | teo | Overall direction, priorities, approvals |
| Full-Stack Developer | AI Agent (fullstack-developer) | API + Web implementation |
| DevOps / DB Engineer | AI Agent (devops-db-engineer) | Docker, CI/CD, database, infrastructure |

# Dependencies

| Dependency | Details | Risk |
|---|---|---|
| PostgreSQL 16 | Required for production; SQLite used for dev | Low — well-supported |
| Viber Bot API | Required for chatbot milestone | Medium — external API dependency |
| LLM Provider | Required for AI chatbot (OpenAI/Anthropic) | Medium — requires API key + cost |
| Docker | Required for deployment | Low |

# Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| UI churn/regressions during refresh | Medium | Medium | Do Sprint A in phases; ship behind small PRs; keep UI patterns documented |
| Calendar scheduling scope creep | Medium | High | Implement v1 as read-only calendar + create/edit via existing dialogs; iterate to drag/drop in v2 |
| Authorization gaps as we add admin features | Medium | High | Add guard/role tests (Task #42) before shipping admin screens |
| No CI quality gates | High | High | Sprint E adds CI workflow + lint + minimal tests |

# Communication Plan

- Project plan maintained in `.opencode/project-manager/latest-project-plan.md`
- Changes tracked via Git commits and PRs
- Sprint reviews at each milestone completion
- Backlog refinement as new requirements emerge

# Metrics & KPIs

- **Endpoint coverage**: X/Y planned endpoints implemented
- **Test coverage**: Target 80%+ for API services
- **Build success rate**: CI should pass on every merge to main
- **Sprint velocity**: Tasks completed per sprint vs. planned

# Decisions Log

| Date | Decision | Rationale | Owner |
|---|---|---|---|
| 2026-03-21 | Use SQLite for demo mode, PostgreSQL for production | Simplify onboarding; switch DB via env var | teo |
| 2026-03-21 | ADR-0001: Node/TS monorepo with NestJS + Next.js + Prisma | Unified language, good DX, Prisma type safety | teo |
| 2026-03-27 | Establish canonical project plan | Need single source of truth for priorities | teo |
| 2026-03-27 | Add JWT auth + staff-only API access | Protect clinic data; enable future owner/client portal | teo |
| 2026-03-27 | Support demo SQLite + Docker Postgres | Keep frictionless demo while enabling production-like deploy | teo |
| 2026-03-27 | UI modernization will use MUI refresh | Fastest path to modern UI without migration churn | teo |
| 2026-03-27 | Next feature order: Scheduling → Patient timeline → User admin | Matches clinic workflow priority and reduces support load | teo |

# Change Log

| Date | Author | Summary |
|---|---|---|
| 2026-03-27 | PM Agent | Initial project plan created from codebase analysis. Cataloged all implemented features, identified gaps, created prioritized backlog with 32 tasks, defined 7 sprints. |
| 2026-03-27 | PM Agent | Updated plan after MVP hardening: marked auth/roles + dual DB + docker fixes as done; added UI modernization plan (MUI vs shadcn decision) and next 3 features (calendar scheduling, patient timeline, admin user management). |
| 2026-03-27 | PM Agent | Confirmed MUI-first UI refresh and locked next feature order (Scheduling → Timeline → User Admin). Updated Sprint A acceptance criteria and backlog statuses. |
| 2026-03-27 | PM Agent | Completed Sprint A Phase 1: centralized MUI theme, responsive app shell, standard UI states (loading/empty/error), consistent layouts. Task #34 done. |
| 2026-03-27 | PM Agent | Updated backlog/statuses to reflect Sprint A Phase 1 completion (Tasks #33–34). Clarified remaining UI work as Phase 2. |
| 2026-03-27 | PM Agent | Completed Sprint A Phase 2 (Task #35): reusable AppDialog, FormLayout, AppTable components with tests. Completed Task #37: API overlap prevention with tests. |
| 2026-03-27 | PM Agent | Completed Sprint B Task #36: Calendar view v1 with day/week toggle, appointment detail modal, and status updates. 40 tests passing, both packages build. |
| 2026-03-27 | PM Agent | Completed Task #38: PatientTimeline component on patient page showing unified appointments + medical records chronologically. Completed Task #39: Users list page with API integration and navigation. |

# Action Items

- [x] 2026-03-27 — teo — Confirm design system direction for Sprint A (MUI refresh)
- [x] 2026-03-27 — teo — Confirm next features order (Scheduling → Timeline → User Admin)
- [x] 2026-03-27 — frontend-developer — Completed Sprint A Phase 1 (Task #34): MUI theme + app shell + standard UI states
- [x] 2026-03-27 — frontend-developer — Completed Sprint A Phase 2 (Task #35): tables/forms/dialog patterns + toast standardization
- [x] 2026-03-27 — backend-developer — Completed Task #37: Scheduling overlap prevention in API
- [x] 2026-03-27 — frontend-developer — Completed Sprint B Task #36: Calendar view v1 (day/week views + appointment detail + status updates)
- [x] 2026-03-27 — frontend-developer — Completed Task #38: Patient timeline v1 (unified appointments + medical records)
- [x] 2026-03-27 — frontend-developer — Completed Task #39: User management v1 (list users with role badges)
- [ ] 2026-03-27 — teo — Decide target: "clinic internal only" vs start carving "client portal" endpoints
- [ ] 2026-03-28 — teo — Inspect the app with start.sh and plan next iteration (full user CRUD dialog, pagination, or CI/CD)

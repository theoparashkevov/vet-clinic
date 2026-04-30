# Vet Clinic Platform Rewrite

## TL;DR

> **Quick Summary**: Rewrite the veterinary clinic platform from a clean state on a new branch, keeping the separated NestJS API + Vite React frontend architecture. Redesign the Prisma schema with flexible roles, superadmin, invoices, AI config, audit logs, and bot conversations. Build a generic webhook bot (Viber first), a multi-provider AI bubble (text-only with extensible architecture), and a complete new frontend in `web-new/`.
>
> **Deliverables**:
> - New `web-new/` frontend (React 19 + Tailwind v4 + TanStack)
> - Redesigned Prisma schema with 12 new/updated models
> - Flexible role/permission system
> - Superadmin panel for platform-level config
> - Invoice/billing system
> - AI bubble (multi-provider, text-only, extensible architecture)
> - Generic webhook bot (Viber adapter + extensible architecture)
> - Audit log system
> - Demo data seeding
> - Docker deployment (unchanged)
>
> **Estimated Effort**: Large (~30 tasks across 5 waves)
> **Parallel Execution**: YES — 6-8 tasks per wave
> **Critical Path**: Schema (T1) → Auth+Roles (T9) → Core Features (T10-T19) → Frontend Integration (T22-T26) → Final Review

---

## Context

### Original Request
The user wants to rewrite a vet clinic platform that's become complex and difficult to work with. The same features should be rebuilt simpler and better-organized.

### Interview Summary
**Key Decisions**:
- **Architecture**: Keep NestJS API + Vite React frontend (separate). Do NOT move to a unified full-stack framework.
- **Frontend**: New `web-new/` directory, cherry-picking from existing `web-modern/`
- **Backend**: Refactor `api/` — keep NestJS but redesign modules and schema
- **Database**: Keep Prisma, REDESIGN schema with new models
- **AI**: Multi-provider via API key, TEXT-ONLY. Architecture must be extensible for future medical features (image analysis, diagnosis) without breaking changes. No medical diagnosis in MVP.
- **AI Disclaimer**: UI must show "This is an assistant, not a veterinarian" disclaimer
- **Bot**: Generic webhook bot using Adapter Pattern inside NestJS. Viber first, extensible to Telegram, Twilio SMS, WhatsApp.
- **Roles**: Flexible — one user can have multiple roles (doctor + nurse + registrar)
- **Superadmin**: Can configure ANYTHING (clinic name, AI prompts, API keys, bot settings, user management)
- **Multi-tenancy**: NO. Each clinic gets its own container. Nginx Proxy Manager handles domain routing.
- **Data**: Fresh start (new schema, new seeded demo data)

### Research Findings
**Full-Stack Frameworks**: Keeping NestJS + Vite is the best choice for heavy CRUD + file uploads + medical data relationships. Full-stack frameworks don't fit this use case.

**Bot Architecture**: Adapter pattern with normalized messages. NestJS module inside `api/src/bot/`. Single webhook endpoint `POST /v1/bot/webhooks/:provider`. Conversation state in Prisma.

**Database Audit**: 12+ models missing or need changes. Key additions: Role, Permission, ClinicSettings, AIProviderConfig, AuditLog, Invoice, InvoiceItem, Payment, BotConversation, BotMessage, VitalSigns, ServiceCatalog, CommunicationLog.

### Metis Review
**Identified Gaps** (addressed):
- Multi-tenancy: Confirmed NO — single clinic per deployment
- AI scope: Confirmed text-only, no medical diagnosis. Architecture extensible for future features
- Superadmin scope: Can configure ANYTHING
- Data migration: Fresh start, no migration needed
- Testing: Will set up Jest + agent-executed QA
- Bot priority: Viber first (extensible)

---

## Work Objectives

### Core Objective
Rebuild the vet clinic platform from a clean state with a redesigned schema, flexible role system, extensible AI integration, superadmin configuration panel, and generic webhook bot — while keeping the proven NestJS + Vite architecture.

### Concrete Deliverables
1. `web-new/` — Complete React 19 frontend with Tailwind v4, TanStack Router, TanStack Query, Zustand
2. Redesigned Prisma schema with 15+ new/updated models + migrations
3. Flexible role/permission system (UserRole, RolePermission)
4. Superadmin panel (platform settings, AI config, bot config, user management)
5. Invoice/Billing system (Invoice, InvoiceItem, Payment)
6. AI integration module (multi-provider, text-only, extensible architecture)
7. Generic bot module (Viber adapter, normalized messages, conversation state)
8. Audit log system (who, what, when, old_value, new_value)
9. Demo data seeding
10. Test infrastructure (Jest for API)

### Definition of Done
- [ ] `npm run dev` in `api/` → NestJS boots with all modules
- [ ] `npm run dev` in `web-new/` → Vite dev server loads login page
- [ ] Demo doctor can log in, view patients, book appointments, create invoices
- [ ] Superadmin can access settings panel and change AI prompts
- [ ] Viber bot responds to webhook messages
- [ ] AI bubble appears on every page and responds with text
- [ ] Audit logs capture superadmin changes
- [ ] All tests pass

### Must Have (Non-Negotiable)
- [ ] Flexible role system (multi-role per user)
- [ ] Superadmin panel with ALL configuration
- [ ] Invoice system (Invoice, InvoiceItem, Payment)
- [ ] AI bubble (multi-provider via API key)
- [ ] Generic bot (Viber adapter, extensible architecture)
- [ ] Audit log (who, what, old_value, new_value)
- [ ] Fresh schema with all new models
- [ ] `web-new/` frontend with Tailwind v4 + TanStack

### Must NOT Have (Guardrails)
- [ ] Multi-tenancy (single clinic per deployment)
- [ ] Medical AI diagnosis (no diagnosis/image analysis in MVP) — but architecture supports future addition
- [ ] Speech/voice integration
- [ ] Native mobile apps
- [ ] Patient-facing portal
- [ ] Inventory/pharmacy management
- [ ] Telemedicine/video calls
- [ ] Real-time sync via WebSockets (polling sufficient)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: Partial — Jest configured in `api/` but no actual tests written. `web-modern/` has no tests.
- **Automated tests**: YES (TDD for critical paths: auth, roles, invoicing, bot webhooks)
- **Framework**: Jest for API (already configured), Vitest for `web-new/`
- **If TDD**: Each critical backend task follows RED (failing test) → GREEN (minimal impl) → REFACTOR

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.
- **Frontend/UI**: Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Bash (curl) — Send requests, assert status + response fields
- **CLI/TUI**: interactive_bash (tmux) — Run command, validate output, check exit code
- **Bot**: Bash (curl) — Simulate webhook payloads, verify normalized message + response

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — 8 tasks, start immediately):
├── T1: Redesign Prisma schema (all models)
├── T2: NestJS test infrastructure (Jest config, test utils)
├── T3: FlexRole system (Role, Permission, UserRole, RolePermission)
├── T4: Bot module scaffolding (interfaces, registry, controller, ConversationService)
├── T5: ClinicSettings / PlatformSettings module
├── T6: AI module scaffolding (interfaces, provider service, config controller)
├── T7: AuditLog module (models, service, interceptor)
├── T8: web-new project scaffolding (Vite + React + Tailwind + TanStack + Zustand)

Wave 2 (Core Backend — requires Wave 1, 8 tasks parallel):
├── T9: Auth module (login, JWT, flexible role guards, superadmin flag)
├── T10: Owners module (CRUD)
├── T11: Patients module (CRUD + search + photos)
├── T12: Appointments module (CRUD + calendar slots)
├── T13: MedicalRecords module
├── T14: LabResults module (panels, tests, values, reference ranges)
├── T15: Prescriptions module (with medications + note templates)
├── T16: Vaccinations + Weight + Reminders + Tasks module

Wave 3 (Business Features — requires Wave 1, 6 tasks parallel):
├── T17: Invoice/Billing module (Invoice, InvoiceItem, Payment)
├── T18: Viber bot adapter + identity handler + menu handler
├── T19: AI chat backend (chat endpoints, context injection, provider switching)
├── T20: Superadmin panel (frontend) — settings, AI config, user management
├── T21: web-new core pages (dashboard, layout, sidebar, navigation)
├── T22: web-new auth (login, protected routes, role-based navigation)

Wave 4 (Integration — requires Waves 2+3, 6 tasks):
├── T23: AI bubble frontend component (floating widget, per-page context)
├── T24: Bot business handlers (appointments, reminders, patient info, follow-ups)
├── T25: web-new patient management pages (list, detail, create)
├── T26: web-new appointment/calendar pages (list, calendar view, booking flow)
├── T27: web-new medical records, lab results, prescriptions pages
├── T28: web-new billing invoices + payments pages

Wave 5 (Polish — requires all previous, 4 tasks):
├── T29: Demo data seeding (3 doctors, 4 owners, 6 patients, appointments, invoices)
├── T30: Docker + deployment config (PostgreSQL, health checks)
├── T31: Error handling + notifications (toast, global error boundary)
└── T32: Final integration tests (end-to-end happy paths)

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA (unspecified-high + playwright skill)
└── F4: Scope fidelity check (deep)
-> Present results -> Get explicit user "okay"

Critical Path: T1 → T3 → T9 → T10-T16 → T23-T28 → T29 → T32 → F1-F4 → user okay
Parallel Speedup: ~70% faster than sequential
Max Concurrent: 8 (Wave 1, after T1 completes)
Note: Within Wave 1, T1 MUST complete before T3-T7 can start (they use the schema).
```

---

## TODOs

- [x] **T1. Redesign Prisma Schema**

  **What to do**:
  - Create new `schema.prisma` with ALL models: Owner, Patient, Appointment, MedicalRecord, User (updated), Role, UserRole, Permission, RolePermission, ClinicSettings, AIProviderConfig, AuditLog, Invoice, InvoiceItem, Payment, BotConversation, BotMessage, FollowUpReminder, Task, Prescription, MedicationTemplate, NoteTemplate, PatientPhoto, Vaccination, WeightRecord, PatientAlert, LabPanel, LabTest, LabResult, LabResultValue, VitalSigns, ServiceCatalog, CommunicationLog
  - Update existing models with missing fields (User.isActive, User.phone, User.avatarUrl, Patient.sex, Patient.isNeutered, Appointment.checkedInAt, Appointment.room, MedicalRecord.createdBy, etc.)
  - Add Prisma enums for status fields (AppointmentStatus, InvoiceStatus, PaymentMethod, ServiceType)
  - Configure Prisma with SQLite (dev) / PostgreSQL (prod) dual-mode via env
  - Run `prisma generate` and `prisma migrate dev`
  - Fix `schema.postgres.prisma` to match (currently severely outdated)

  **Must NOT do**:
  - Add multi-tenancy fields (no `clinicId`, `tenantId`)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `db-migration-plan` (for schema design best practices)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (T1 should complete before T3-T7 start)
  - **Blocks**: All other backend tasks
  - **Blocked By**: None

  **References**:
  - `api/prisma/schema.prisma` — existing schema
  - `api/prisma/schema.postgres.prisma` — outdated, needs sync
  - Database audit results from research (Role, Permission, Invoice, PlatformSetting, AiProviderConfig, AuditLog, VitalSigns, ServiceCatalog, CommunicationLog models)

  **Acceptance Criteria**:
  - [ ] Schema file exists with all models
  - [ ] `npx prisma generate` succeeds
  - [ ] `npx prisma migrate dev` succeeds
  - [ ] All new models present and related

  **QA Scenario**:
  ```
  Scenario: Schema generates and migrates
    Tool: Bash
    Steps:
      1. cd api && npx prisma generate
      2. cd api && npx prisma migrate dev --name init
    Expected Result: Both commands succeed with exit code 0
    Evidence: .sisyphus/evidence/task-1-schema-generation.log
  ```

  **Commit**: YES
  - Message: `feat(api): Redesign Prisma schema with roles, invoices, bot, audit log, AI config`
  - Files: `api/prisma/schema.prisma`, `api/prisma/schema.postgres.prisma`, migrations

---

- [x] **T2. NestJS Test Infrastructure**

  **What to do**:
  - Verify existing Jest config at `api/jest.config.js`
  - Create test utilities: `api/test/` with test DB setup, factories for common entities
  - Create `api/test/setup.ts` for test database configuration
  - Add at least one passing sample test

  **Must NOT do**:
  - Add complex e2e infrastructure yet

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Blocks**: T9 (Auth tests need this)

  **References**:
  - `api/jest.config.js`
  - `api/package.json`

  **Acceptance Criteria**:
  - [ ] `cd api && npm test` exits with code 0

  **QA Scenario**:
  ```
  Scenario: Jest runs successfully
    Tool: Bash
    Steps:
      1. cd api && npm test
    Expected Result: Exit code 0, tests pass
    Evidence: .sisyphus/evidence/task-2-jest-run.log
  ```

  **Commit**: YES (group with T1)

---

- [x] **T3. Flexible Role/Permission System**

  **What to do**:
  - Create `Role` model (id, name, description, isSystem, createdAt)
  - Create `Permission` model (id, resource, action, description, createdAt)
  - Create `UserRole` junction (userId + roleId + timestamps)
  - Create `RolePermission` junction (roleId + permissionId + timestamps)
  - Update `User` model: remove `role: String`, add relation to `roles` via `UserRole`, add `isSuperAdmin: Boolean @default(false)`
  - Create `RolesModule` with service + controller (CRUD)
  - Create `RolesGuard` — check if user has required role(s) for endpoint
  - Create `Roles` decorator for controllers
  - Seed default roles: `superadmin`, `doctor`, `nurse`, `registrar`, `admin`

  **Must NOT do**:
  - Build dynamic permission builder UI
  - Add attribute-based access control (ABAC) or time-based permissions

  **Recommended Agent Profile**:
  - **Category**: `deep`

  **Parallelization**:
  - **Can Run In Parallel**: YES (after T1 schema is ready)
  - **Blocks**: T9 (Auth module needs Guards)
  - **Blocked By**: T1 (schema)

  **References**:
  - `api/src/auth/` — existing auth module
  - NestJS Guards docs

  **Acceptance Criteria**:
  - [ ] `POST /v1/roles` creates a role
  - [ ] `POST /v1/users/:id/roles` assigns role(s)
  - [ ] Guard rejects access when user lacks role

  **QA Scenarios**:
  ```
  Scenario: Assign multiple roles
    Tool: Bash (curl)
    Preconditions: User and roles exist
    Steps:
      1. POST /v1/users/{id}/roles { roleIds: ["doctor", "nurse"] }
      2. GET /v1/users/{id}
    Expected Result: roles: ["doctor", "nurse"]
    Evidence: .sisyphus/evidence/task-3-roles-assign.json

  Scenario: Guard rejects unauthorized
    Tool: Bash (curl)
    Steps:
      1. Login as registrar
      2. GET /v1/admin/settings
    Expected Result: HTTP 403
    Evidence: .sisyphus/evidence/task-3-guard-reject.json
  ```

  **Commit**: YES

---

- [x] **T4. Bot Module Scaffolding**

  **What to do**:
  - Create `BotModule` in `api/src/bot/`
  - Define interfaces: `BotAdapter`, `NormalizedMessage`, `BotResponse`, `ConversationState`
  - Create `AdapterRegistryService` — register adapters by provider ID
  - Create `BotEngineService` — route normalized messages to handlers
  - Create `ConversationService` — load/save conversation state from Prisma
  - Create `BotWebhookController` — endpoint `POST /v1/bot/webhooks/:provider`
  - Register `BotModule` in `AppModule`

  **Must NOT do**:
  - Implement Viber/Telegram parsing yet (T18 does that)
  - Build conversation flows yet (T24 does that)

  **Recommended Agent Profile**:
  - **Category**: `deep`

  **Parallelization**:
  - **Can Run In Parallel**: YES (after T1)
  - **Blocks**: T18, T24
  - **Blocked By**: T1

  **References**:
  - `api/src/sms/` — existing provider pattern
  - Bot architecture research results

  **Acceptance Criteria**:
  - [ ] `POST /v1/bot/webhooks/test` returns 200
  - [ ] `npm run build` succeeds with BotModule

  **QA Scenario**:
  ```
  Scenario: Webhook endpoint returns 200
    Tool: Bash (curl)
    Steps:
      1. POST /v1/bot/webhooks/test {"event": "message", "text": "hi"}
    Expected Result: HTTP 200 { ok: true }
    Evidence: .sisyphus/evidence/task-4-webhook-test.json
  ```

  **Commit**: YES

---


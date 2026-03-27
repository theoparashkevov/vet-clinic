# Vet Clinic Platform - Improvement Roadmap

> **Living Document** - Last updated: 2026-03-27  
> This roadmap maps out the path from current MVP to a production-ready veterinary clinic system based on Dr. Mitchell's clinical requirements and technical debt.

---

## 🎯 Executive Summary

**Current State:** Solid MVP with full CRUD, modern UI, auth, and calendar. Three key clinical components exist but are **disconnected** from the patient workflow.

**Immediate Opportunity:** Wire up existing components (alerts, vaccination status, weight chart) to unlock clinical value Dr. Mitchell can use today.

**Strategic Direction:** Prioritize **safety-critical features** (patient alerts, workflow status) over convenience features (templates, reminders).

---

## ✅ Current State: What's Done

### Foundation (100% Complete)
| Area | Implementation | Status |
|------|----------------|--------|
| Monorepo scaffolding | npm workspaces (api/web/bot) | ✅ |
| Database | Prisma + SQLite (dev) / PostgreSQL (prod) | ✅ |
| Authentication | JWT + role guards (doctor/staff/admin) | ✅ |
| API Framework | NestJS with validation, global pipes | ✅ |
| Frontend Framework | Next.js 14 + MUI v5 + theme system | ✅ |

### Core Features (100% Complete)
| Feature | API | Web UI | Notes |
|---------|-----|--------|-------|
| Owners CRUD | ✅ | ✅ | Full management |
| Patients CRUD | ✅ | ✅ | With owner linkage |
| Appointments | ✅ | ✅ | Calendar view, status updates |
| Medical Records | ✅ | ✅ | Linked to appointments |
| User Management | ✅ | ✅ | Full CRUD + password reset |
| Scheduling Rules | ✅ | N/A | Overlap prevention in API |

### UI/UX Modernization (100% Complete)
| Component | Status | Location |
|-----------|--------|----------|
| MUI Theme system | ✅ | `web/app/theme.ts` |
| AppShell with nav | ✅ | `web/components/AppShell.tsx` |
| PageHeader | ✅ | `web/components/PageHeader.tsx` |
| Reusable dialogs (AppDialog) | ✅ | `web/components/AppDialog.tsx` |
| Form layouts (FormLayout) | ✅ | `web/components/FormLayout.tsx` |
| Table patterns (AppTable) | ✅ | `web/components/AppTable.tsx` |
| Loading states | ✅ | InlineLoading, TableSkeleton, FullPageLoading |
| Error states | ✅ | ErrorState component |
| Toast notifications | ✅ | ToastProvider |
| Patient Timeline | ✅ | `web/components/PatientTimeline.tsx` |

### Orphaned Components (Built but Not Integrated)
| Component | Status | What's Missing |
|-----------|--------|----------------|
| PatientAlertBanner | 🟡 Built | Not rendered on patient page |
| VaccinationStatus | 🟡 Built | No data source (needs schema) |
| WeightHistoryChart | 🟡 Built | No data source (needs schema) |

---

## 🗺️ Improvement Roadmap

### Phase 1: Safety & Workflow (Weeks 1-2)
**Theme:** Connect orphaned components, add safety-critical workflow status

| # | Task | Owner | Effort | Dependencies |
|---|------|-------|--------|--------------|
| 1.1 | **Integrate PatientAlertBanner** into patient detail page | frontend-developer | 4h | None |
| 1.2 | **Add "In Progress" appointment status** - API + UI | backend-developer + frontend-developer | 6h | None |
| 1.3 | **CI/CD Pipeline** - GitHub Actions (build, test, lint) | devops-engineer | 6h | None |
| 1.4 | **ESLint + Prettier** baseline configuration | devops-engineer | 3h | None |

**Deliverables:**
- Patient page shows allergy/chronic condition alerts
- Appointments can be marked "In Progress" for workflow tracking
- All PRs run automated checks
- Code style enforced automatically

---

### Phase 2: Clinical Data Foundation (Weeks 3-5)
**Theme:** Give Dr. Mitchell the clinical data she needs at her fingertips

| # | Task | Owner | Effort | Dependencies |
|---|------|-------|--------|--------------|
| 2.1 | **Weight Tracking Schema** - migration + API endpoints | backend-developer | 4h | None |
| 2.2 | **Integrate WeightHistoryChart** on patient page | frontend-developer | 4h | 2.1 |
| 2.3 | **Vaccination Schema** - migration + API endpoints | backend-developer | 6h | None |
| 2.4 | **Integrate VaccinationStatus** on patient list + detail | frontend-developer | 4h | 2.3 |
| 2.5 | **Pagination** - add to patients and appointments endpoints | backend-developer + frontend-developer | 6h | None |

**Schema Additions:**
```prisma
model WeightRecord {
  id        String   @id @default(cuid())
  patient   Patient  @relation(fields: [patientId], references: [id])
  patientId String
  weight    Float    // in kg
  date      DateTime
  notes     String?
  createdAt DateTime @default(now())
}

model Vaccination {
  id            String   @id @default(cuid())
  patient       Patient  @relation(fields: [patientId], references: [id])
  patientId     String
  name          String   // "Rabies", "DA2PP", etc.
  administeredAt DateTime
  dueDate       DateTime
  notes         String?
  createdAt     DateTime @default(now())
}
```

**Deliverables:**
- Weight history visible on patient page with trend alerts
- Vaccination status indicator (green/yellow/red) on patient list
- Patient and appointment lists paginated

---

### Phase 3: Quality & Safety (Weeks 6-7)
**Theme:** Make the system safe to operate and maintain

| # | Task | Owner | Effort | Dependencies |
|---|------|-------|--------|--------------|
| 3.1 | **API Guard Tests** - auth + role-based access tests | qa-engineer | 8h | None |
| 3.2 | **Error Boundaries** - React error boundaries in web app | frontend-developer | 4h | None |
| 3.3 | **Request Logging** - Add pino logging to API | backend-developer | 2h | None |
| 3.4 | **Auth UX Improvements** - 401/403 handling, session expiry | frontend-developer | 4h | None |

**Deliverables:**
- Test coverage for all guarded endpoints
- Graceful error handling throughout web app
- Audit logging for all API operations
- Better auth error messaging

---

### Phase 4: Clinical Efficiency (Weeks 8-10)
**Theme:** Reduce clicks and typing for Dr. Mitchell's daily workflow

| # | Task | Owner | Effort | Dependencies |
|---|------|-------|--------|--------------|
| 4.1 | **Quick Note Templates** - schema + UI for common findings | backend-developer + frontend-developer | 8h | None |
| 4.2 | **Prescription Management** - templates + printing | backend-developer + frontend-developer | 12h | None |
| 4.3 | **Photo Upload** - S3/file storage + medical record attachments | devops-engineer + backend-developer | 10h | None |
| 4.4 | **Follow-up Reminders** - schema + notification system | backend-developer | 8h | None |

**Deliverables:**
- One-click insertion of common exam notes
- Printable prescriptions with clinic letterhead
- Attach photos to medical records
- System tracks and reminds about follow-ups

---

### Phase 5: Client-Facing Features (Weeks 11-14)
**Theme:** Enable pet owner self-service

| # | Task | Owner | Effort | Dependencies |
|---|------|-------|--------|--------------|
| 5.1 | **Bot Package Scaffolding** - initialize bot/ with package.json | backend-developer | 2h | None |
| 5.2 | **Viber Webhook Handler** - message receiver + router | backend-developer | 4h | 5.1 |
| 5.3 | **LLM Integration** - tool-calling for appointment booking | backend-developer | 8h | 5.2 |
| 5.4 | **Tool Endpoints** - `/tools/create-appointment`, etc. | backend-developer | 4h | 5.3 |
| 5.5 | **Client Portal Foundation** - separate auth for pet owners | backend-developer + frontend-developer | 12h | None |

**Deliverables:**
- Viber chatbot can book appointments conversationally
- Pet owners can view vaccine history and request refills
- Reduced front desk phone calls

---

## 📊 Progress Tracker

### Phase 1: Safety & Workflow
- [ ] 1.1 Integrate PatientAlertBanner
- [ ] 1.2 Add "In Progress" appointment status
- [ ] 1.3 CI/CD Pipeline
- [ ] 1.4 ESLint + Prettier

### Phase 2: Clinical Data Foundation
- [ ] 2.1 Weight Tracking Schema
- [ ] 2.2 Integrate WeightHistoryChart
- [ ] 2.3 Vaccination Schema
- [ ] 2.4 Integrate VaccinationStatus
- [ ] 2.5 Pagination

### Phase 3: Quality & Safety
- [ ] 3.1 API Guard Tests
- [ ] 3.2 Error Boundaries
- [ ] 3.3 Request Logging
- [ ] 3.4 Auth UX Improvements

### Phase 4: Clinical Efficiency
- [ ] 4.1 Quick Note Templates
- [ ] 4.2 Prescription Management
- [ ] 4.3 Photo Upload
- [ ] 4.4 Follow-up Reminders

### Phase 5: Client-Facing Features
- [ ] 5.1 Bot Package Scaffolding
- [ ] 5.2 Viber Webhook Handler
- [ ] 5.3 LLM Integration
- [ ] 5.4 Tool Endpoints
- [ ] 5.5 Client Portal Foundation

---

## 🎯 Immediate Action Items (Next 48 Hours)

1. **Decision:** Confirm Phase 1 priority - integrate PatientAlertBanner first?
2. **Backend:** Add "in-progress" to appointment statuses
3. **DevOps:** Create initial GitHub Actions workflow (build + lint)
4. **Frontend:** Wire PatientAlertBanner into patient detail page

---

## 🧠 Key Insights

### What's Working Well
- Component architecture is solid and reusable
- API patterns are consistent
- UI modernization provides good foundation
- Auth system is robust

### Technical Debt to Watch
- No CI/CD = risky deployments
- No pagination = will break with scale
- Duplicated types between API and Web
- No request logging = hard to debug issues

### Clinical Priorities (Dr. Mitchell's Voice)
> "I can't afford to miss that a patient is allergic to penicillin"

Safety-critical features (alerts, drug interactions) trump convenience features (templates, reminders).

---

## 📁 Related Documents

- [Project Plan](./latest-project-plan.md) - Detailed task breakdown and timelines
- [Dr. Mitchell's Feedback](../veterinary-doctor/improvements.md) - Clinical requirements from user
- [API Documentation](../../api/README.md) - API endpoints and schemas

---

*This roadmap is a living document. Update it as priorities shift or work completes.*

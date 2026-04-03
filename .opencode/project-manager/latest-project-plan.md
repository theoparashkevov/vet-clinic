---
title: "Vet Clinic Platform - Next Phase Project Plan"
project: "Vet Clinic Platform"
version: "2.0"
status: "In Progress"
owner: "teo"
stakeholders:
  - "teo"
  - "veterinary-doctor"
last_updated: "2026-03-30T14:00:00Z"
---

# Goal

Transform the feature-complete vet clinic MVP into a production-ready, maintainable system with proper CI/CD, testing, documentation, and critical missing features.

**Current Reality Check:**
- ✅ Features are complete (15+ models, 20 controllers, 16 pages)
- ❌ Documentation is outdated (says features are "not implemented")
- ❌ No CI/CD pipeline (risky deployments)
- ❌ No automated testing (Playwright just added, needs verification)
- ❌ No production deployment config
- ❌ Client portal incomplete
- ❌ No inventory tracking

---

# Now / Next / Later

## Now (This Week)
- [ ] **P0:** Update documentation to reflect reality (features are DONE)
- [ ] **P0:** Set up CI/CD pipeline with GitHub Actions
- [ ] **P0:** Verify Playwright E2E tests pass and add to CI
- [ ] **P0:** Create production Docker Compose setup

## Next (Weeks 2-4)
- [ ] **P1:** Complete Client Portal (pet owner access)
- [ ] **P1:** Add Inventory Management module
- [ ] **P1:** Implement error boundaries and request logging
- [ ] **P1:** Add API pagination where missing

## Later (Month 2+)
- [ ] **P2:** Mobile/tablet responsiveness improvements
- [ ] **P2:** Performance optimization (React Query, API consolidation)
- [ ] **P2:** Business intelligence & reporting dashboard
- [ ] **P2:** Multi-location support foundation

---

# Backlog

## P0 - Critical (Safety & Operations)

### 1. Update Documentation Drift
**Priority:** P0 | **Estimate:** 4h | **Owner:** PM Agent  
**Acceptance Criteria:**
- [ ] Update `.opencode/veterinary-doctor/improvements.md` - mark features as complete
- [ ] Update `.opencode/project-manager/improvement-roadmap.md` - remove completed items
- [ ] Create feature documentation for staff training
- [ ] Document what IS working vs what roadmap says

**Why:** Team thinks features don't exist. Risk of duplicate work.

---

### 2. CI/CD Pipeline Setup
**Priority:** P0 | **Estimate:** 6h | **Owner:** devops-engineer  
**Acceptance Criteria:**
- [ ] GitHub Actions workflow for API build + type check
- [ ] GitHub Actions workflow for Web build + type check
- [ ] ESLint + Prettier checks in CI
- [ ] Block PRs that fail checks
- [ ] Status badges in README

**Why:** Cannot safely deploy patient-facing software without automated checks.

---

### 3. Verify & Stabilize E2E Tests
**Priority:** P0 | **Estimate:** 6h | **Owner:** qa-engineer  
**Acceptance Criteria:**
- [ ] Run `npm run test:e2e` - verify all tests pass
- [ ] Fix any failing tests
- [ ] Add E2E tests to CI pipeline
- [ ] Generate HTML report artifact
- [ ] Document test strategy

**Files:**
- `web/e2e/home.spec.ts`
- `web/e2e/patients.spec.ts`
- `web/e2e/navigation.spec.ts`
- `web/e2e/auth.spec.ts`
- `web/playwright.config.ts`

---

### 4. Production Deployment Configuration
**Priority:** P0 | **Estimate:** 8h | **Owner:** devops-engineer  
**Acceptance Criteria:**
- [ ] Production-ready `docker-compose.prod.yml`
- [ ] Environment-specific config (dev/staging/prod)
- [ ] Database migration strategy for production
- [ ] SSL/HTTPS configuration
- [ ] Health checks and monitoring endpoints
- [ ] Secrets management (.env.example complete)

**Files:**
- `docker-compose.prod.yml` (new)
- `docker-compose.yml` (update for dev)
- `api/.env.example` (verify complete)
- `web/.env.example` (create)

---

## P1 - High Priority (Clinical Impact)

### 5. Complete Client Portal
**Priority:** P1 | **Estimate:** 3 days | **Owner:** frontend-developer + backend-developer  
**Acceptance Criteria:**
- [ ] Pet owners can view their pets' vaccine history
- [ ] Pet owners can download vaccine certificates
- [ ] Pet owners can request prescription refills
- [ ] Pet owners can view upcoming appointments
- [ ] Separate auth flow for pet owners (not staff login)
- [ ] Mobile-friendly design

**Files:**
- `web/app/client/page.tsx` (enhance)
- `api/src/client/` (create endpoints)
- New: Client auth middleware

**API Endpoints Needed:**
- `GET /v1/client/pets` - List my pets
- `GET /v1/client/pets/:id/vaccinations` - Vaccine history
- `GET /v1/client/pets/:id/vaccine-certificate` - PDF certificate
- `POST /v1/client/refill-requests` - Request refill
- `GET /v1/client/appointments` - Upcoming appointments

---

### 6. Inventory Management Module
**Priority:** P1 | **Estimate:** 4 days | **Owner:** backend-developer + frontend-developer  
**Acceptance Criteria:**
- [ ] Database schema for medications inventory
- [ ] Track stock levels for all medications/vaccines
- [ ] Low stock alerts (< 10 units)
- [ ] Expiration date tracking with warnings (30 days before expiry)
- [ ] Link dispensed prescriptions to inventory
- [ ] Admin panel for inventory management
- [ ] Usage reports

**Files:**
- `api/prisma/schema.prisma` (add Inventory model)
- `api/src/inventory/` (new module)
- `web/app/admin/inventory/page.tsx` (new)

**Database Schema:**
```prisma
model InventoryItem {
  id              String   @id @default(cuid())
  name            String
  category        String   // vaccine, medication, supply
  sku             String?  @unique
  quantity        Int      @default(0)
  minQuantity     Int      @default(10)
  unit            String   // vial, tablet, bottle
  expirationDate  DateTime?
  lotNumber       String?
  supplier        String?
  costPerUnit     Float?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

### 7. Error Boundaries & Graceful Degradation
**Priority:** P1 | **Estimate:** 1 day | **Owner:** frontend-developer  
**Acceptance Criteria:**
- [ ] React Error Boundaries around major page sections
- [ ] Fallback UI when patient data fails to load
- [ ] Graceful handling of API 500 errors
- [ ] Retry mechanisms for failed requests
- [ ] User-friendly error messages (not raw JSON)

**Files:**
- `web/components/ErrorBoundary.tsx` (new)
- Update `web/app/layout.tsx` to wrap with ErrorBoundary
- Update data fetching hooks with error handling

---

### 8. API Request Logging
**Priority:** P1 | **Estimate:** 4h | **Owner:** backend-developer  
**Acceptance Criteria:**
- [ ] Add Pino logger to API
- [ ] Log all requests (method, path, user, timestamp)
- [ ] Log errors with stack traces
- [ ] Rotating log files
- [ ] Exclude sensitive data from logs

**Files:**
- `api/src/logger/` (new module)
- Update `api/src/main.ts` to use logging middleware

---

### 9. API Pagination Audit
**Priority:** P1 | **Estimate:** 1 day | **Owner:** backend-developer + frontend-developer  
**Acceptance Criteria:**
- [ ] Audit all list endpoints for pagination
- [ ] Add pagination to endpoints missing it
- [ ] Frontend uses pagination consistently
- [ ] Test with large datasets (1000+ records)

**Files to Check:**
- `api/src/owners/owners.controller.ts`
- `api/src/patients/patients.controller.ts`
- `api/src/appointments/appointments.controller.ts`
- `api/src/medical-records/`
- `api/src/prescriptions/`

---

## P2 - Medium Priority (Quality of Life)

### 10. Mobile/Tablet Responsiveness
**Priority:** P2 | **Estimate:** 2 days | **Owner:** frontend-developer  
**Acceptance Criteria:**
- [ ] Appointment calendar usable on 10" tablets
- [ ] Medical record dialog responsive
- [ ] Weight chart resizes properly
- [ ] Touch-friendly targets (min 44px)
- [ ] Test on iPad and Android tablet

**Files:**
- `web/app/appointments/page.tsx` (calendar)
- `web/components/MedicalRecordDialog.tsx`
- `web/components/WeightHistoryChart.tsx`

---

### 11. Performance Optimization
**Priority:** P2 | **Estimate:** 3 days | **Owner:** frontend-developer  
**Acceptance Criteria:**
- [ ] Implement React Query for caching
- [ ] Consolidate patient detail API calls (currently 6+)
- [ ] Add image thumbnails for faster loading
- [ ] Lazy load heavy components
- [ ] Lighthouse score > 90

**Files:**
- `web/lib/api.ts` (add React Query)
- `api/src/patients/patients.controller.ts` (add `GET /v1/patients/:id/full`)
- `web/components/PhotoGalleryDialog.tsx` (thumbnails)

---

### 12. Business Intelligence Dashboard
**Priority:** P2 | **Estimate:** 3 days | **Owner:** frontend-developer + backend-developer  
**Acceptance Criteria:**
- [ ] Monthly appointment stats
- [ ] Revenue tracking (if billing added)
- [ ] Vaccination compliance reports
- [ ] Patient demographics charts
- [ ] Export reports to PDF/CSV

**Files:**
- `web/app/admin/reports/page.tsx` (new)
- `api/src/reports/` (new module)

---

### 13. Multi-Location Foundation
**Priority:** P2 | **Estimate:** 5 days | **Owner:** software-architect + backend-developer  
**Acceptance Criteria:**
- [ ] Database schema supports multiple clinics
- [ ] Location filter on all queries
- [ ] User-location association
- [ ] Location switcher in UI
- [ ] Data isolation between locations

**Files:**
- `api/prisma/schema.prisma` (add Location model)
- Update all queries with location filter

---

# Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Documentation remains outdated | High | High | PM Agent task P0 #1, daily check-ins |
| CI/CD delays deployment | High | Medium | DevOps starts immediately, use GitHub Actions templates |
| E2E tests flaky | Medium | Medium | QA Engineer to stabilize before CI integration |
| Client Portal security issues | High | Medium | Security review, proper auth separation |
| Inventory feature creep | Medium | Medium | Strict MVP scope (stock tracking only) |

---

# Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-30 | Prioritize documentation update over new features | Team unaware of existing capabilities |
| 2026-03-30 | CI/CD before Client Portal | Safety first - can't deploy portal without tests |
| 2026-03-30 | SQLite for dev, PostgreSQL for prod | Keep dev simple, prod robust |
| 2026-03-30 | Inventory starts with medications only | Scope control - expand later |

---

# Change Log

| Date | Author | Summary |
|------|--------|---------|
| 2026-03-30 | PM Agent | Created v2.0 project plan - addressing documentation drift, CI/CD, testing, and production readiness |

---

# Delegation Summary

## Ready to Assign Now

1. **devops-engineer**: CI/CD Pipeline (Task #2) + Production Docker (Task #4)
2. **qa-engineer**: E2E Test Verification (Task #3)
3. **PM Agent**: Documentation Update (Task #1) - I'll do this

## Next Wave (After P0 Complete)

4. **frontend-developer + backend-developer**: Client Portal (Task #5) + Inventory (Task #6)
5. **frontend-developer**: Error Boundaries (Task #7) + Mobile (Task #10)
6. **backend-developer**: Request Logging (Task #8) + Pagination (Task #9)

## Future (P2)

7. **software-architect**: Multi-location design (Task #13)
8. **frontend-developer**: Performance optimization (Task #11)
9. **frontend-developer + backend-developer**: BI Dashboard (Task #12)

---

# Immediate Action Items

**Today:**
1. ✅ Project plan created (this document)
2. ⏳ Delegate CI/CD task to devops-engineer
3. ⏳ Delegate E2E verification to qa-engineer
4. ⏳ Start documentation update

**This Week:**
- Complete P0 tasks (documentation, CI/CD, testing, production config)
- Verify all Playwright tests pass
- Merge PRs with passing CI

**Next Week:**
- Start Client Portal (P1)
- Begin Inventory Management (P1)

---

**Status:** P0 Tasks Ready for Delegation | **Next Review:** Daily standups

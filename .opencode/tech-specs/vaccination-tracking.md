# Technical Spec: Vaccination Tracking

> **Status**: Ready for implementation  
> **Owner**: backend-developer + frontend-developer  
> **Estimated Effort**: 10 hours  
> **Target**: End-to-end vaccination tracking with status indicators

---

## Context

Dr. Mitchell needs to instantly know vaccination status during wellness exams. Currently, this information is scattered across medical records or not tracked at all. This feature adds structured vaccination tracking with automated status calculation (current/due-soon/overdue) based on species-specific protocols.

**Reference**: [Dr. Mitchell's requirements](../veterinary-doctor/improvements.md#2-quick-view-vaccination-status)

---

## Goals

1. **Track vaccinations** in a structured way (vaccine name, administered date, due date)
2. **Calculate status automatically** - current, due-soon (within 30 days), overdue
3. **Show visual indicators** - green/yellow/red status on patient list and detail pages
4. **Support species-specific protocols** - different vaccines for dogs vs cats
5. **Integrate seamlessly** - use existing VaccinationStatus component already built
6. **Enable CRUD operations** - staff can add/edit vaccination records

---

## Non-Goals

- Automated vaccine reminders (email/SMS) - out of scope for this phase
- Vaccine inventory management - track supplies separately
- Multi-dose vaccine series tracking - simple single-record model for now
- Breed-specific protocols - start with species-level, add breed later

---

## Proposed Approach

### Option A: Separate Vaccination Model (Selected)
Create a dedicated `Vaccination` table linked to patients. Status calculated on-the-fly based on `dueDate`.

**Why:**
- Clean separation from medical records
- Easy to query "all overdue vaccines"
- Can add species protocols later without migration
- Enables future features (reminders, reporting)

**Why not Option B (Medical Record extension):**
- Medical records are free-text summaries, hard to query
- Would require parsing text to calculate status
- No way to track due dates separately

---

## Data Model

### Schema Addition (`api/prisma/schema.prisma`)

```prisma
model Vaccination {
  id             String   @id @default(cuid())
  patient        Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  patientId      String
  name           String   // e.g., "Rabies", "DA2PP", "FVRCP"
  administeredAt DateTime
  dueDate        DateTime
  notes          String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([patientId])
  @@index([dueDate])
}
```

### Migration
```bash
cd api && npm run prisma:migrate
cd api && npm run api:prisma:migrate
cd api && npm run api:prisma:generate
```

---

## API Contract

### Endpoints

#### 1. List Vaccinations for Patient
```
GET /v1/patients/:id/vaccinations
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "vac_123",
      "name": "Rabies",
      "administeredAt": "2023-03-15T10:00:00Z",
      "dueDate": "2024-03-15T10:00:00Z",
      "notes": "1-year vaccine",
      "status": "current" // calculated: current | due-soon | overdue
    }
  ]
}
```

#### 2. Get Vaccination Status Summary
```
GET /v1/patients/:id/vaccination-status
```

**Response 200:**
```json
{
  "status": "current", // overall status: current | due-soon | overdue
  "summary": {
    "current": 3,
    "dueSoon": 0,
    "overdue": 0,
    "total": 3
  },
  "vaccinations": [
    {
      "id": "vac_123",
      "name": "Rabies",
      "dueDate": "2024-03-15T10:00:00Z",
      "status": "current"
    }
  ]
}
```

#### 3. Create Vaccination
```
POST /v1/patients/:id/vaccinations
```

**Request Body:**
```json
{
  "name": "Rabies",
  "administeredAt": "2023-03-15",
  "dueDate": "2024-03-15",
  "notes": "1-year vaccine"
}
```

**Response 201:** Created vaccination object

#### 4. Update Vaccination
```
PUT /v1/vaccinations/:id
```

**Request Body:** (partial update allowed)
```json
{
  "administeredAt": "2024-03-15",
  "dueDate": "2027-03-15",
  "notes": "3-year vaccine this time"
}
```

**Response 200:** Updated vaccination object

#### 5. Delete Vaccination
```
DELETE /v1/vaccinations/:id
```

**Response 204:** No content

---

## Status Calculation Logic

```typescript
// In service layer
function calculateVaccinationStatus(dueDate: Date): 'current' | 'due-soon' | 'overdue' {
  const now = new Date();
  const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 30) return 'due-soon';
  return 'current';
}

// Overall patient status = worst of all vaccines
function calculateOverallStatus(vaccinations: Vaccination[]): 'current' | 'due-soon' | 'overdue' {
  const statuses = vaccinations.map(v => calculateVaccinationStatus(v.dueDate));
  if (statuses.includes('overdue')) return 'overdue';
  if (statuses.includes('due-soon')) return 'due-soon';
  return 'current';
}
```

---

## Frontend Integration

### 1. Patient List Page (`web/app/patients/page.tsx`)

Add vaccination status dot to patient table using existing `VaccinationStatusDot` component.

**Changes needed:**
- Fetch vaccination status for visible patients (batched or individual)
- Add column with status indicator
- Show tooltip on hover with details

### 2. Patient Detail Page (`web/app/patients/[id]/page.tsx`)

**Changes needed:**
- Add VaccinationStatus chip in header area
- Add "Vaccinations" section with list/table
- Allow adding new vaccination records
- Show status with color coding

### 3. Reuse Existing Component

The `VaccinationStatus` component is already built at `web/components/VaccinationStatus.tsx`. Just needs:
- Real data from API
- Proper props passed in

---

## Rollout Plan

### Phase 1: Backend (4 hours)
1. Create database migration for Vaccination model
2. Create VaccinationsModule with controller and service
3. Implement all CRUD endpoints
4. Add status calculation logic
5. Write unit tests for service

### Phase 2: Frontend (4 hours)
1. Add vaccination status to patient list
2. Add vaccinations section to patient detail page
3. Create vaccination creation dialog
4. Wire up VaccinationStatus component

### Phase 3: Testing & Polish (2 hours)
1. Integration testing
2. Edge cases (empty state, all overdue, etc.)
3. Add to seed data for demo

---

## Observability

### Logs
- Log all vaccination mutations (create/update/delete) with user attribution
- Structured log: `{ action: 'vaccination.created', patientId, vaccineName, userId }`

### Metrics (future)
- Count of overdue vaccines per clinic
- Most common vaccines administered

---

## Test Plan

### Unit Tests (API)
- Status calculation logic for each scenario (current, due-soon, overdue)
- Overall status aggregation (worst wins)
- Service CRUD operations
- Controller validation

### Integration Tests
- End-to-end flow: create patient → add vaccine → check status
- Status updates correctly as time passes
- Deleting vaccination updates patient status

### Manual Tests
- Create vaccination in UI
- Verify status indicator appears on list
- Verify status indicator appears on detail
- Check edge cases (no vaccines, all overdue)

---

## Open Questions

1. **Should we pre-populate common vaccines?** 
   - *Recommendation*: Yes, add common vaccines (Rabies, DA2PP, FVRCP, etc.) as suggestions in UI
   
2. **Should vaccines auto-calculate due date?**
   - *Recommendation*: Start with manual entry, add protocols later (e.g., "Rabies = 1 or 3 years")

3. **Multi-pet discount?** (not applicable - single patient records)

---

## Files to Modify

### Backend
- `api/prisma/schema.prisma` - Add Vaccination model
- `api/src/app.module.ts` - Import VaccinationsModule
- `api/src/vaccinations/vaccinations.module.ts` - Create
- `api/src/vaccinations/vaccinations.controller.ts` - Create
- `api/src/vaccinations/vaccinations.service.ts` - Create
- `api/src/vaccinations/dto.ts` - Create DTOs

### Frontend
- `web/app/patients/page.tsx` - Add status column
- `web/app/patients/[id]/page.tsx` - Add vaccinations section
- `web/components/VaccinationDialog.tsx` - Create (for add/edit)
- `web/lib/api.ts` - Add vaccination API helpers

---

## Success Criteria

- [ ] Can create vaccination record via API
- [ ] Can view vaccination status on patient list (green/yellow/red dot)
- [ ] Can view vaccination status on patient detail (chip)
- [ ] Status updates automatically as due dates approach
- [ ] All CRUD operations work in UI
- [ ] Tests pass (unit + integration)

---

*Ready for implementation. Start with backend schema and API, then frontend integration.*

# Veterinary Doctor Improvement Suggestions

> This document contains improvement ideas from Dr. Sarah Mitchell's perspective.
> Last updated: 2026-03-29

---

## ✅ Recently Completed (March 2026)

### Patient Alert Banner
**Category:** Safety, UI/UX  
**Status:** ✅ Implemented

**Description:**
- Prominent banner at top of patient pages
- Color-coded by severity (critical=red, warning=yellow, info=blue)
- Supports allergies, chronic conditions, medications, behavioral notes
- Collapsible but shows alert count when minimized

**Dr. Mitchell's Feedback:**
"This is exactly what I needed. The red banner for critical allergies is impossible to miss. I feel much safer knowing I'll see penicillin allergies immediately."

---

### Vaccination Status Indicators
**Category:** Preventive Care, UI/UX  
**Status:** ✅ Implemented

**Description:**
- Traffic light system: Green (current), Yellow (due within 30 days), Red (overdue)
- Full detail view with list of all vaccines and due dates
- Compact dot indicator for patient lists
- Tooltip showing which vaccines are due

**Dr. Mitchell's Feedback:**
"Love the instant visual. During wellness exams, I immediately know if I need to pull vaccines. The due date calculations are spot-on."

---

### Weight History Chart
**Category:** Data Visualization  
**Status:** ✅ Implemented

**Description:**
- Line chart showing weight trends over time
- Unit toggle (kg/lbs)
- Automatic alerts for >10% weight changes
- Shows current weight, previous weight, and trend percentage
- Table view of recent records

**Dr. Mitchell's Feedback:**
"The trend line makes weight changes obvious. The 10% alert caught a diabetic patient's weight loss that I might have missed otherwise."

---

### Medical Record Templates (Backend)
**Category:** Efficiency, Workflow  
**Status:** ✅ Partially Implemented

**Description:**
- 60+ medication templates in database (Amoxicillin, Carprofen, etc.)
- 9 note templates (Wellness Exam, Sick Visit, Ear Infection, etc.)
- Templates include dosage, frequency, duration, instructions

**Still Needed:**
- Frontend integration to use templates when writing records
- Template selection UI in MedicalRecordDialog

---

## Critical Priority - Still Needed

### 1. Prescription Management System
**Category:** Safety, Workflow  
**Status:** Schema Ready, Not Implemented

**Description:**
Full prescription workflow:
- Create prescriptions from medication templates
- Print prescriptions with clinic letterhead
- Track prescription history per patient
- Calculate refills remaining
- Drug interaction warnings (flag dangerous combinations)
- Controlled substance flagging

**Current State:**
- `Prescription` model exists in schema
- `MedicationTemplate` has 60+ common drugs
- No API endpoints or UI yet

**Clinical Justification:**
"I write 20-30 prescriptions a day. Without templates, I'm typing the same dosing instructions repeatedly. And I NEED drug interaction warnings - missing a NSAID contraindication could kill a patient with kidney disease."

**Implementation Priority:**
1. Create prescription API endpoints
2. Add prescription dialog to patient page
3. Integrate medication templates
4. Add print functionality
5. Build drug interaction checker (start with common dangerous pairs)

---

### 2. Note Template Integration
**Category:** Efficiency  
**Status:** Backend Ready, Frontend Missing

**Description:**
- Quick-insert templates when writing medical records
- Categories: Wellness, Sick Visit, Surgery, Dermatology, etc.
- Placeholder replacement ({{patientName}}, {{weight}}, etc.)

**Current State:**
- 9 templates in database
- Not accessible from MedicalRecordDialog

**Clinical Justification:**
"I shouldn't have to type 'Physical exam within normal limits' 10 times a day. Templates should handle 80% of my routine notes."

---

## High Priority

### 3. Appointment Status "In Progress"
**Category:** Workflow  
**Status:** Not Implemented (only scheduled/completed/cancelled)

**Description:**
Add workflow statuses:
- `checked-in` - Patient arrived
- `in-progress` - In exam room
- `ready-for-checkout` - Finished, needs payment

**Benefits:**
- Front desk sees room occupancy
- Doctors see which patients are waiting
- Better wait time tracking

**Clinical Justification:**
"When I'm running behind, I need to know which patients are still in rooms vs. which are waiting. The front desk needs to see room occupancy at a glance."

---

### 4. Photo/Image Upload & Comparison
**Category:** Clinical Documentation  
**Status:** Schema Ready, Not Implemented

**Description:**
- Upload photos of skin conditions, wounds, dental, radiographs
- Organize by category
- Side-by-side comparison (then vs now)
- Thumbnail gallery

**Current State:**
- `PatientPhoto` model exists
- No API endpoints or UI

**Clinical Justification:**
"A photo of a skin mass from 6 months ago is worth a thousand words. I need to track progression of skin conditions, compare before/after surgery photos."

---

### 5. Follow-up Reminders & Task List
**Category:** Workflow  
**Status:** Not Implemented

**Description:**
- Create reminders when completing appointments
- Types: Lab results, recheck appointments, post-surgery calls
- Daily task list for vets
- Notifications for overdue tasks

**Clinical Justification:**
"I tell clients 'I'll call you in 3 days with lab results' and then get busy and forget. The system should track my promises and remind me."

---

## Medium Priority

### 6. Lab Results Management
**Category:** Clinical Workflow  
**Status:** Not Implemented

**Description:**
- Upload and attach lab PDFs to medical records
- Track pending lab status
- Flag abnormal values
- Historical trend graphs for chronic conditions (kidney values, blood sugar)

**Clinical Justification:**
"I get lab results via email and have to manually file them. A central place to see pending results and historical trends would save 30 minutes a day."

---

### 7. SMS Reminders for Clients
**Category:** Client Communication  
**Status:** Not Implemented

**Description:**
- Automated appointment reminders (24-48 hours before)
- Vaccine due reminders
- Appointment confirmation replies
- Custom message templates

**Clinical Justification:**
"No-shows kill our schedule. SMS reminders would reduce no-shows by 50%. Plus, clients love text confirmations."

---

### 8. Enhanced Search
**Category:** UI/UX  
**Status:** Basic Search Implemented

**Description:**
- Search by microchip ID
- Search by owner phone number
- Search medical record content
- Filter by species, breed, age range

**Clinical Justification:**
"Sometimes clients only have the microchip number. Or I need to find all 'Golden Retrievers' with skin allergies. Better search saves time."

---

### 9. Inventory Tracking for Medications
**Category:** Practice Management  
**Status:** Not Implemented

**Description:**
- Track medication stock levels
- Low stock alerts
- Link dispensed medications to inventory
- Expiration date tracking

**Clinical Justification:**
"Running out of vaccines mid-day is a nightmare. Basic inventory tracking would prevent stockouts and waste from expired drugs."

---

### 10. Client Portal (Phase 2)
**Category:** Client Communication  
**Status:** Out of Scope for Now

**Description:**
- View vaccine history and certificates
- Request prescription refills
- Book appointments
- Access educational materials

**Clinical Justification:**
"Clients call constantly for vaccine records. A portal would save front desk hours per week, but I understand it's complex to build securely."

---

## Technical Debt & Improvements

### Performance Optimizations
**Status:** Not Addressed

**Issues:**
- Patient detail page makes 6+ API calls simultaneously
- No caching for reference data (doctors, templates)
- Images not optimized (no thumbnails)

**Recommendation:**
- Implement React Query for caching
- Add API endpoint that returns patient with related data in one call
- Image optimization pipeline

---

### Mobile Responsiveness
**Status:** Partial

**Issues:**
- Appointment calendar hard to use on tablets
- Medical record dialog too wide for mobile
- Weight chart doesn't resize well

**Clinical Context:**
"We use tablets in exam rooms. The system needs to work on 10-inch screens, not just desktops."

---

## Summary: Priority Order for Next Sprint

### Week 1-2: Prescription System
1. Create prescription API endpoints
2. Build prescription creation dialog
3. Integrate medication templates
4. Add print functionality

### Week 3-4: Template Integration
1. Connect note templates to medical record dialog
2. Add template selection UI
3. Implement placeholder replacement

### Week 5-6: Workflow Improvements
1. Add "In Progress" appointment status
2. Create follow-up reminder system
3. Add task list for veterinarians

### Week 7-8: Photo Upload
1. Create photo upload API
2. Build photo gallery component
3. Add side-by-side comparison view

---

## How to Add New Suggestions

When Dr. Mitchell reviews a feature, add entries here with:
1. Clear title and category
2. Current implementation status
3. Clinical use case (why it matters)
4. Implementation notes (if applicable)
5. Priority level

Format template:
```markdown
### [Number]. [Title]
**Category:** [Categories]  
**Status:** [Not Implemented/Partial/Implemented]

**Description:**
[What the feature does]

**Clinical Justification:**
[Why Dr. Mitchell needs this]

**Implementation Notes:**
[Technical considerations]
```

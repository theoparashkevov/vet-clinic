# Veterinary Doctor Improvement Suggestions

> This document contains improvement ideas from Dr. Sarah Mitchell's perspective.
> Last updated: 2026-03-27

---

## Critical Priority

### 1. Patient Alert Banner
**Category:** Safety, UI/UX  
**Status:** Not Implemented  

**Description:**  
Display prominent alerts at the top of patient pages for:
- Drug allergies
- Chronic conditions (diabetes, kidney disease, etc.)
- Current medications
- Behavioral warnings (aggressive, anxious)

**Clinical Justification:**  
"I can't afford to miss that a patient is allergic to penicillin or has a history of aggression. These need to be the first thing I see, not buried in the record."

**Implementation Notes:**
- Red/yellow color coding based on severity
- Collapsible but visible by default
- Sync with medical records

---

### 2. Quick-View Vaccination Status
**Category:** Preventive Care, UI/UX  
**Status:** Not Implemented  

**Description:**  
Visual indicator (traffic light system) showing:
- Green: All vaccines current
- Yellow: Vaccines due within 30 days
- Red: Vaccines overdue

**Clinical Justification:**  
"During a wellness exam, I need to instantly know if vaccines are due. Don't make me scroll through records or do date math."

**Implementation Notes:**
- Show on patient list and detail page
- Calculate based on species-specific protocols
- Configurable vaccine schedules

---

## High Priority

### 3. Weight History Chart
**Category:** Feature, Data Visualization  
**Status:** Not Implemented  

**Description:**  
Simple line chart showing weight trends over time with:
- Current weight vs. previous visits
- Visual alerts for significant changes (>10%)
- Ideal weight range indicator

**Clinical Justification:**  
"Weight changes are often the first sign of disease. A chart makes trends obvious. I want to see this immediately when I open a patient record."

---

### 4. Prescription Management
**Category:** Feature, Workflow  
**Status:** Partial (can create records, no printing)  

**Description:**  
Full prescription workflow:
- Print prescriptions with clinic letterhead
- Track prescription history
- Calculate refills remaining
- Drug interaction warnings
- Common drug templates (e.g., "Carprofen 75mg, 1 tablet PO q24h x 14 days")

**Clinical Justification:**  
"I write 20-30 prescriptions a day. Templates save me minutes per prescription. Drug interaction checks prevent disasters."

---

### 5. Appointment Status "In Progress"
**Category:** Workflow  
**Status:** Not Implemented (only scheduled/completed/cancelled)  

**Description:**  
Add "In Progress" status for appointments:
- Mark when patient arrives
- Mark when in exam room
- Track wait times
- Visual indicator on calendar

**Clinical Justification:**  
"Front desk needs to know which rooms are occupied. I need to see which patients are waiting. The calendar should show real-time status."

---

## Medium Priority

### 6. Photo/Image Upload
**Category:** Feature  
**Status:** Not Implemented  

**Description:**  
Upload and store images:
- Skin conditions (track progression)
- Radiographs (reference)
- Surgery photos (for records)
- Before/after comparisons

**Clinical Justification:**  
"A photo of a skin mass from 6 months ago is worth a thousand words. Let me upload and compare side-by-side."

---

### 7. Quick Note Templates
**Category:** UI/UX, Efficiency  
**Status:** Not Implemented  

**Description:**  
Pre-built templates for common findings:
- "Normal physical exam"
- "Mild dental tartar, recommend cleaning in 6 months"
- "Otitis externa - moderate erythema and discharge"
- Custom template creation

**Clinical Justification:**  
"I shouldn't have to type the same normal findings over and over. Templates should cover 80% of routine cases."

---

### 8. Follow-up Reminders
**Category:** Workflow, Feature  
**Status:** Not Implemented  

**Description:**  
System to track and remind about:
- Recheck appointments
- Lab result follow-ups
- Post-surgery check-ins
- Medication compliance calls

**Clinical Justification:**  
"I tell clients 'I'll call you in 3 days with lab results' and then get busy and forget. The system should remind me."

---

## Low Priority / Future

### 9. Client Portal
**Category:** Feature, Client Communication  
**Status:** Out of Scope (per project plan)  

**Description:**  
Allow clients to:
- View vaccine history
- Request prescription refills
- Book appointments
- Access educational materials

**Clinical Justification:**  
"Clients call constantly for vaccine records. A portal would save front desk hours per week. But I understand this is complex to build securely."

---

### 10. Lab Integration
**Category:** Integration  
**Status:** Out of Scope (per project plan)  

**Description:**  
Auto-import lab results from major labs (IDEXX, Antech):
- PDF attachment
- Key value extraction
- Trend tracking for chronic conditions

**Clinical Justification:**  
"Currently I get lab results via email or fax. Auto-import would be dreamy, but I know it's a heavy integration lift."

---

## Recently Completed

### ✅ Patient Timeline (March 2026)
**Category:** UI/UX  
**Status:** Implemented  

**Feedback:**  
"This is exactly what I wanted! Seeing appointments and medical records chronologically makes it so easy to track a patient's history. The filter is great too."

---

### ✅ Calendar View with Status Updates (March 2026)
**Category:** UI/UX, Workflow  
**Status:** Implemented  

**Feedback:**  
"Love the day/week toggle. Being able to click and update appointment status is smooth. Would love an 'In Progress' status added (see #5 above)."

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

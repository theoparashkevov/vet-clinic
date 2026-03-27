# Technical Spec: Clinical Efficiency Features

> **Status**: In Progress  
> **Priority**: High  
> **Estimated Effort**: 28 hours  
> **Goal**: Reduce Dr. Mitchell's daily documentation time by 30-45 minutes

---

## Overview

This spec covers three high-impact clinical features designed to streamline Dr. Mitchell's daily workflow:

1. **Prescription Management** (12h) - Templates, drug interactions, printing
2. **Quick Note Templates** (6h) - One-click medical record templates  
3. **Photo Uploads** (10h) - Track conditions visually over time

---

## Feature 1: Prescription Management

### Problem
Dr. Mitchell writes 20-30 prescriptions daily, retyping the same medications and dosages repeatedly. No drug interaction warnings exist.

### Solution
- Pre-built medication templates
- Drug interaction checker
- One-click printing with clinic letterhead
- Prescription history per patient

### Database Schema

```prisma
model Prescription {
  id                String   @id @default(cuid())
  patient           Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  patientId         String
  medication        String   // e.g., "Amoxicillin 250mg"
  dosage            String   // e.g., "1 tablet"
  frequency         String   // e.g., "Twice daily"
  duration          String   // e.g., "7 days"
  instructions      String?  // Special instructions
  prescribedAt      DateTime @default(now())
  expiresAt         DateTime // When prescription expires
  refillsTotal      Int      @default(0)
  refillsRemaining  Int      @default(0)
  isControlled      Boolean  @default(false) // Controlled substance flag
  veterinarian      String   // Prescribing doctor name
  notes             String?  // Internal notes
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([patientId])
  @@index([prescribedAt])
}

model MedicationTemplate {
  id            String   @id @default(cuid())
  name          String   // e.g., "Amoxicillin 250mg"
  category      String   // e.g., "Antibiotic", "Pain Relief"
  dosage        String   // Default dosage
  frequency     String   // Default frequency
  duration      String   // Default duration
  instructions  String?  // Default instructions
  isCommon      Boolean  @default(false) // Show in quick list
  createdAt     DateTime @default(now())

  @@index([category])
  @@index([isCommon])
}
```

### Drug Interaction Database (In-Memory)

```typescript
// Static map of dangerous drug combinations
const DRUG_INTERACTIONS = {
  "NSAID": ["Steroid", "Blood Thinner"],
  "Amoxicillin": ["Probenecid"],
  "Prednisone": ["NSAID", "Diuretic"],
  // ... more interactions
};
```

### API Endpoints

```
GET    /v1/patients/:id/prescriptions          // List patient prescriptions
POST   /v1/patients/:id/prescriptions          // Create new prescription
GET    /v1/prescriptions/:id                   // Get prescription details
POST   /v1/prescriptions/:id/print             // Generate PDF
GET    /v1/medication-templates                // List templates
POST   /v1/prescriptions/check-interactions    // Check drug interactions
```

### Frontend Components

- **PrescriptionDialog** - Create/edit prescriptions with template selection
- **PrescriptionHistory** - List of all prescriptions for patient
- **DrugInteractionWarning** - Alert banner for dangerous combinations
- **PrintPrescriptionButton** - Generate and print PDF

### Prescription PDF Format

```
╔══════════════════════════════════════╗
║     VETCLINIC                        ║
║     Dr. Maria Ivanova                ║
║     License #: BG-VET-12345          ║
╠══════════════════════════════════════╣
║  PRESCRIPTION                        ║
╠══════════════════════════════════════╣
║  Patient: Rex (Canine)               ║
║  Owner: Ivan Petrov                  ║
║  Date: 27/03/2026                    ║
╠══════════════════════════════════════╣
║  Rx: Amoxicillin 250mg               ║
║  Sig: 1 tablet twice daily for 7 days║
║  Refills: 0                          ║
╠══════════════════════════════════════╣
║  Dr. Maria Ivanova _______________   ║
║  License: BG-VET-12345               ║
╚══════════════════════════════════════╝
```

---

## Feature 2: Quick Note Templates

### Problem
Writing medical records takes 5-10 minutes per appointment. Much of it is repetitive.

### Solution
- One-click templates for common visits
- Auto-fill patient info, weight, date
- Customizable per doctor
- Smart text expansion

### Database Schema

```prisma
model NoteTemplate {
  id          String   @id @default(cuid())
  name        String   // e.g., "Wellness Exam - Normal"
  category    String   // e.g., "Wellness", "Sick Visit", "Surgery"
  content     String   // Template text with placeholders
  isCommon    Boolean  @default(false)
  createdBy   String?  // User ID who created it
  createdAt   DateTime @default(now())

  @@index([category])
  @@index([isCommon])
}
```

### Template Placeholders

- `{{patientName}}` - Pet's name
- `{{species}}` - Species (Dog/Cat)
- `{{date}}` - Current date
- `{{weight}}` - Current weight from records
- `{{veterinarian}}` - Doctor's name

### Example Templates

```typescript
const DEFAULT_TEMPLATES = [
  {
    name: "Wellness Exam - Normal",
    category: "Wellness",
    content: `{{patientName}} presented for routine wellness examination. 

Physical Examination:
- Temperature: Normal
- Heart rate: Normal  
- Respiratory: Normal
- Body condition: Good
- Coat/Skin: Healthy

Weight: {{weight}} kg

Assessment: Healthy adult {{species}}. No concerns identified.

Plan:
- Continue current diet and exercise
- Vaccines updated as needed
- Next wellness exam in 12 months`
  },
  {
    name: "Vaccination Only",
    category: "Preventive",
    content: `{{patientName}} presented for vaccination update.

Vaccines Administered:
- 

Weight: {{weight}} kg

Next vaccinations due: 

Patient tolerated vaccines well. No adverse reactions observed.`
  }
];
```

### API Endpoints

```
GET    /v1/note-templates              // List templates
POST   /v1/note-templates              // Create custom template
PUT    /v1/note-templates/:id          // Update template
DELETE /v1/note-templates/:id          // Delete template
POST   /v1/note-templates/:id/apply    // Apply template to patient
```

### Frontend Components

- **TemplateSelector** - Dropdown of available templates
- **TemplateEditor** - Create/edit custom templates
- **TemplatePreview** - Preview with placeholder substitution

---

## Feature 3: Photo Uploads

### Problem
Skin conditions, wounds, and post-surgical sites need visual tracking. Currently no way to organize photos.

### Solution
- Upload photos from exam rooms (tablet-friendly)
- Organized by date and category
- Side-by-side before/after comparison
- Annotations (circles, arrows)

### Database Schema

```prisma
model PatientPhoto {
  id          String   @id @default(cuid())
  patient     Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  patientId   String
  url         String   // S3/Storage URL
  thumbnailUrl String? // Optimized thumbnail
  category    String   // e.g., "Skin", "Wound", "Dental", "X-Ray"
  description String?
  takenAt     DateTime // When photo was taken
  uploadedAt  DateTime @default(now())
  uploadedBy  String   // User ID
  fileSize    Int      // In bytes
  mimeType    String   // image/jpeg, image/png

  @@index([patientId])
  @@index([category])
  @@index([takenAt])
}
```

### Storage Configuration

**Development**: Local filesystem storage  
**Production**: AWS S3 or similar

```typescript
// File upload limits
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFilesPerUpload: 5,
};
```

### API Endpoints

```
GET    /v1/patients/:id/photos           // List photos
POST   /v1/patients/:id/photos           // Upload photo(s)
GET    /v1/photos/:id                    // Get photo details
DELETE /v1/photos/:id                    // Delete photo
GET    /v1/photos/:id/download           // Download original
POST   /v1/photos/compare                // Get two photos for comparison
```

### Frontend Components

- **PhotoGallery** - Grid view of all photos with filtering
- **PhotoUpload** - Drag-and-drop upload component
- **PhotoViewer** - Lightbox with zoom and annotation
- **PhotoComparison** - Side-by-side before/after
- **PhotoAnnotation** - Draw circles/arrows on photos

### Photo Categories

- **Skin** - Rashes, allergies, infections
- **Wound** - Injuries, surgical sites
- **Dental** - Teeth, oral cavity
- **Eye** - Ophthalmology
- **Ear** - Otitis, foreign bodies
- **X-Ray** - Radiographs
- **Other** - Miscellaneous

---

## Implementation Plan

### Week 1: Prescription Management (Days 1-3)

**Day 1: Backend**
- [ ] Create Prescription and MedicationTemplate models
- [ ] Run database migration
- [ ] Implement CRUD endpoints
- [ ] Add drug interaction checker

**Day 2: Frontend Core**
- [ ] Create PrescriptionDialog component
- [ ] Build medication template selector
- [ ] Add interaction warning display

**Day 3: Printing & Polish**
- [ ] Implement PDF generation
- [ ] Add print styling
- [ ] Create prescription history view
- [ ] Test with Dr. Mitchell's common medications

### Week 2: Quick Note Templates (Days 4-5)

**Day 4: Backend & Templates**
- [ ] Create NoteTemplate model
- [ ] Seed default templates
- [ ] Build API endpoints

**Day 5: Frontend Integration**
- [ ] Create TemplateSelector component
- [ ] Integrate into MedicalRecordDialog
- [ ] Add template preview
- [ ] Allow custom template creation

### Week 3: Photo Uploads (Days 6-8)

**Day 6: Storage & API**
- [ ] Configure file storage
- [ ] Create PatientPhoto model
- [ ] Build upload endpoints with validation

**Day 7: Frontend Gallery**
- [ ] Create PhotoGallery component
- [ ] Build PhotoUpload with drag-drop
- [ ] Add category filtering

**Day 8: Comparison & Polish**
- [ ] Implement side-by-side comparison
- [ ] Add photo viewer lightbox
- [ ] Mobile-responsive upload

---

## Testing Checklist

### Prescription Management
- [ ] Can create prescription from template
- [ ] Drug interactions are detected and warned
- [ ] PDF prints correctly with clinic info
- [ ] Prescription history shows all medications
- [ ] Refill tracking works

### Quick Note Templates
- [ ] Templates populate correctly
- [ ] Placeholders substitute patient data
- [ ] Custom templates save and load
- [ ] Integration with medical records works

### Photo Uploads
- [ ] Can upload multiple photos
- [ ] Thumbnails generate correctly
- [ ] Photos organized by category
- [ ] Comparison view works
- [ ] Mobile upload works from tablet

---

## Success Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| Prescription time | 3-5 min | < 1 min | Time per prescription |
| Medical record time | 5-10 min | 2-3 min | Time per record |
| Photo organization | None | 100% | Photos tagged and findable |
| Drug interaction misses | Unknown | 0 | Safety incidents |

---

Ready to start building! These features will make Dr. Mitchell's daily workflow significantly more efficient.

# Billing & Invoicing System - Technical Specification

## Context

The vet clinic platform needs a complete billing and invoicing system to replace manual invoice creation. Currently, staff must manually track charges outside the system, leading to missed fees and delayed payments.

**Existing Systems to Integrate:**
- Appointments (visit scheduling and completion)
- Inventory (dispensed medications and supplies)
- Patients/Owners (billing contact info)
- Client Portal (online payment access)

## Goals

1. **Auto-generate invoices** from completed appointments with all billable items
2. **Process payments** via Stripe integration (cards, digital wallets)
3. **Track payment status** through full lifecycle (pending → paid → overdue)
4. **Generate PDF invoices/receipts** with professional clinic branding
5. **Email receipts automatically** to clients after payment
6. **Revenue reporting** by service type, date range, and payment status
7. **Prevent missed charges** by automatically capturing dispensed inventory

## Non-Goals

- Insurance claim processing (out of scope for MVP)
- Recurring billing/subscriptions (future phase)
- Multi-currency support (USD only for now)
- Offline payment tracking (assume all payments go through Stripe)
- Inventory cost accounting (track retail prices only)

## Proposed Approach

### Phase 1: Core Invoice Management
Build invoice CRUD with manual creation, then add auto-generation.

### Phase 2: Stripe Integration
Add payment processing and webhook handling for async updates.

### Phase 3: Automation
Auto-generate invoices from appointments, email receipts, revenue dashboard.

**Alternative Considered:** QuickBooks/Xero integration
- **Why not:** Adds dependency, higher fees, less control over client experience
- **Why Stripe direct:** Lower fees, full control, better client portal integration

## Data Model

### New Prisma Models

```prisma
// ── Billing & Invoicing ─────────────────────────────────────────────────────

model Invoice {
  id              String   @id @default(cuid())
  invoiceNumber   String   @unique  // INV-2024-0001 format
  
  // Relations
  appointmentId   String?  @unique  // Optional link to appointment
  appointment     Appointment? @relation(fields: [appointmentId], references: [id])
  patientId       String
  patient         Patient  @relation(fields: [patientId], references: [id])
  ownerId         String
  owner           Owner    @relation(fields: [ownerId], references: [id])
  
  // Invoice details
  issueDate       DateTime @default(now())
  dueDate         DateTime
  status          InvoiceStatus @default(DRAFT)
  
  // Totals
  subtotal        Float    // Sum of line items
  taxRate         Float    @default(0)  // e.g., 0.08 for 8%
  taxAmount       Float    @default(0)
  total           Float    // subtotal + taxAmount
  amountPaid      Float    @default(0)
  balanceDue      Float    // total - amountPaid
  
  // Metadata
  notes           String?  // Internal notes
  terms           String?  // Payment terms
  
  // Relations
  items           InvoiceItem[]
  payments        Payment[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdById     String
  createdBy       User     @relation(fields: [createdById], references: [id])
  
  @@index([ownerId])
  @@index([patientId])
  @@index([status])
  @@index([issueDate])
  @@index([dueDate])
}

model InvoiceItem {
  id              String   @id @default(cuid())
  invoiceId       String
  invoice         Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  // Item details
  serviceType     ServiceType
  description     String
  quantity        Float    @default(1)
  unitPrice       Float
  total           Float    // quantity * unitPrice
  
  // Source tracking (for auto-generated items)
  inventoryItemId String?  // If dispensed from inventory
  prescriptionId  String?  // If from prescription
  
  createdAt       DateTime @default(now())
  
  @@index([invoiceId])
  @@index([serviceType])
}

model Payment {
  id              String   @id @default(cuid())
  invoiceId       String
  invoice         Invoice  @relation(fields: [invoiceId], references: [id])
  
  // Payment details
  amount          Float
  method          PaymentMethod
  status          PaymentStatus @default(PENDING)
  
  // Stripe integration
  stripePaymentIntentId String? @unique
  stripeChargeId        String?
  
  // Metadata
  processedAt     DateTime?
  receiptUrl      String?  // Stripe receipt URL
  failureMessage  String?  // If payment failed
  
  // Refund tracking
  refundedAmount  Float    @default(0)
  isRefunded      Boolean  @default(false)
  
  // Who processed
  processedById   String?  // Staff who processed (null if client paid online)
  processedBy     User?    @relation(fields: [processedById], references: [id])
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([invoiceId])
  @@index([status])
  @@index([stripePaymentIntentId])
}

// Enums
enum InvoiceStatus {
  DRAFT           // Not yet sent to client
  SENT            // Sent to client, awaiting payment
  PAID            // Fully paid
  PARTIAL         // Partially paid
  OVERDUE         // Past due date
  CANCELLED       // Voided/cancelled
  REFUNDED        // Fully refunded
}

enum ServiceType {
  CONSULTATION    // Office visit, exam
  PROCEDURE       // Surgery, dental, etc.
  MEDICATION      // Dispensed drugs
  VACCINATION     // Vaccines
  LAB_TEST        // Bloodwork, urinalysis
  SUPPLY          // Food, supplements, etc.
  BOARDING        // Boarding/daycare
  OTHER
}

enum PaymentMethod {
  CREDIT_CARD
  DEBIT_CARD
  CASH
  CHECK
  BANK_TRANSFER
  STRIPE
}

enum PaymentStatus {
  PENDING         // Awaiting confirmation
  PROCESSING      // Stripe processing
  COMPLETED       // Successful
  FAILED          // Failed
  REFUNDED        // Refunded
}

// Update existing models
model Appointment {
  // ... existing fields ...
  invoice         Invoice?  // One-to-one relation
}

model Patient {
  // ... existing fields ...
  invoices        Invoice[]
}

model Owner {
  // ... existing fields ...
  invoices        Invoice[]
}
```

## API Endpoints

### Invoice Management

```typescript
// GET /v1/invoices
// List invoices with filters
Query params: {
  status?: InvoiceStatus
  patientId?: string
  ownerId?: string
  startDate?: string (ISO date)
  endDate?: string (ISO date)
  overdue?: boolean
  search?: string (invoice number or patient name)
  page?: number
  limit?: number
}
Response: {
  data: Invoice[]
  meta: { total, page, totalPages }
}

// GET /v1/invoices/:id
// Get invoice details with items and payments
Response: Invoice & { items: InvoiceItem[], payments: Payment[] }

// POST /v1/invoices
// Create new invoice
Body: CreateInvoiceDto {
  patientId: string
  ownerId: string
  appointmentId?: string
  dueDate: string
  items: {
    serviceType: ServiceType
    description: string
    quantity: number
    unitPrice: number
  }[]
  notes?: string
}

// PUT /v1/invoices/:id
// Update invoice (only if status is DRAFT)
Body: UpdateInvoiceDto

// POST /v1/invoices/:id/send
// Mark invoice as sent and email to client
// Changes status from DRAFT to SENT

// POST /v1/invoices/:id/void
// Cancel/void an invoice
// Changes status to CANCELLED

// POST /v1/invoices/generate-from-appointment
// Auto-generate invoice from appointment
Body: { appointmentId: string }
Response: Invoice

// GET /v1/invoices/:id/pdf
// Generate and download PDF invoice
Response: PDF blob
```

### Payment Processing

```typescript
// POST /v1/payments/create-intent
// Create Stripe PaymentIntent
Body: {
  invoiceId: string
  paymentMethodId?: string  // For saved cards
}
Response: {
  clientSecret: string  // For Stripe.js
  amount: number
  currency: string
}

// POST /v1/payments/confirm
// Confirm payment (called after Stripe confirms)
Body: {
  invoiceId: string
  stripePaymentIntentId: string
}
Response: Payment

// POST /v1/payments/record-offline
// Record cash/check payment (staff only)
Body: {
  invoiceId: string
  amount: number
  method: PaymentMethod.CASH | PaymentMethod.CHECK
  notes?: string
}

// POST /v1/payments/:id/refund
// Process refund (staff only)
Body: {
  amount?: number  // Partial refund amount, or omit for full
  reason?: string
}
```

### Reporting

```typescript
// GET /v1/reports/revenue
// Revenue report by date range
Query params: {
  startDate: string
  endDate: string
  groupBy?: 'day' | 'week' | 'month' | 'serviceType'
}
Response: {
  totalRevenue: number
  totalCollected: number
  totalOutstanding: number
  breakdown: {
    label: string  // date or service type
    revenue: number
    collected: number
  }[]
}

// GET /v1/reports/outstanding-invoices
// All unpaid/overdue invoices
Query params: {
  daysOverdue?: number  // Filter by minimum days overdue
}
Response: Invoice[]

// GET /v1/reports/top-services
// Most frequently billed services
Query params: {
  startDate: string
  endDate: string
  limit?: number
}
Response: {
  serviceType: ServiceType
  count: number
  revenue: number
}[]
```

## Frontend Pages

### Admin Panel (Staff)

1. **Invoice List Page** (`/admin/billing/invoices`)
   - Filterable table with status badges
   - Quick actions: View, Edit (if draft), Send, Record Payment
   - Export to CSV

2. **Invoice Detail Page** (`/admin/billing/invoices/[id]`)
   - Invoice preview with print styling
   - Line items table
   - Payment history
   - Action buttons: Send, Record Payment, Refund, Void
   - PDF download

3. **Create Invoice Page** (`/admin/billing/invoices/new`)
   - Patient selector
   - Line item builder (add/remove items)
   - Auto-calculate totals
   - Preview before save

4. **Revenue Dashboard** (`/admin/billing/dashboard`)
   - Revenue charts (by month, by service type)
   - KPI cards: Today's revenue, Outstanding, Overdue
   - Outstanding invoices list

5. **Payment Processing Page** (`/admin/billing/payments`)
   - Stripe Elements integration
   - Card input form
   - Payment confirmation

### Client Portal

1. **My Invoices Page** (`/client/invoices`)
   - List of invoices for client's pets
   - Status badges (Paid, Pending, Overdue)
   - Pay Now button for unpaid invoices

2. **Invoice Payment Page** (`/client/invoices/[id]/pay`)
   - Invoice summary
   - Stripe payment form
   - Payment confirmation
   - Download receipt after payment

## Stripe Integration

### Setup
1. Install `@stripe/stripe-js` and `@stripe/react-stripe-js`
2. Configure Stripe keys in environment variables
3. Create Stripe webhook endpoint for async events

### Payment Flow
1. Client clicks "Pay Now" on invoice
2. Backend creates PaymentIntent: `stripe.paymentIntents.create()`
3. Frontend loads Stripe Elements with client secret
4. Client enters card details and confirms
5. Stripe processes payment and confirms
6. Frontend calls backend `/payments/confirm`
7. Backend updates invoice status and creates Payment record
8. Email receipt sent automatically

### Webhook Events to Handle
- `payment_intent.succeeded` → Mark payment completed
- `payment_intent.payment_failed` → Mark payment failed, notify client
- `charge.refunded` → Update refund status

## PDF Generation

**Library:** `puppeteer` or `@react-pdf/renderer`

**Approach:**
1. Create invoice template component (React)
2. Render to PDF on-demand
3. Store generated PDFs in S3 or generate on-the-fly
4. Cache PDFs to avoid regeneration

**Invoice Template:**
- Clinic letterhead (logo, address, contact)
- Invoice number and dates
- Owner/patient info
- Line items table
- Totals breakdown
- Payment instructions
- Footer with terms

## Email Notifications

**Templates:**
1. **Invoice Sent** - New invoice available, payment link
2. **Payment Received** - Receipt with PDF attachment
3. **Payment Overdue** - Reminder with late fee warning
4. **Refund Processed** - Confirmation of refund

**Integration:** Use existing SMS/email service (Twilio SendGrid or nodemailer)

## Rollout Plan

### Phase 1: Manual Invoices (Week 1)
- Database migrations
- Invoice CRUD API
- Invoice list/detail pages
- Manual invoice creation

### Phase 2: Stripe Integration (Week 2)
- Stripe setup and configuration
- Payment processing API
- Payment pages (staff + client)
- Webhook handling

### Phase 3: Automation (Week 3)
- Auto-generate from appointments
- Email notifications
- PDF generation
- Revenue dashboard

### Phase 4: Polish (Week 4)
- Client portal integration
- Overdue reminders
- Reporting enhancements
- E2E tests

## Observability

**Logs:**
- Payment attempts (success/failure)
- Invoice generation events
- Refund operations

**Metrics:**
- Revenue per day/week/month
- Payment success rate
- Average time to payment
- Overdue invoice rate

**Alerts:**
- Payment processing failures
- Unusual refund activity
- Stripe webhook errors

## Test Plan

**Unit Tests:**
- Invoice total calculations
- Payment status transitions
- Stripe webhook handling

**Integration Tests:**
- End-to-end payment flow with Stripe test mode
- Invoice generation from appointments
- PDF generation

**E2E Tests:**
- Create invoice → Send → Pay → Download receipt
- Auto-generate from appointment completion
- Refund flow

## Open Questions

1. **Tax handling:** Do we need to calculate sales tax on medications/supplies? (Assume no for MVP)
2. **Multi-location:** Will invoices need location-specific numbering/branding? (Assume single location for now)
3. **Offline payments:** Do we need to track cash/check payments in detail, or just record them? (Record with basic tracking)

## Implementation Priority

**Must Have (MVP):**
- Invoice CRUD with manual creation
- Stripe payment processing
- Basic revenue reporting
- Client portal payment

**Should Have:**
- Auto-generate from appointments
- PDF generation
- Email notifications

**Nice to Have:**
- Recurring payments
- Payment plans
- Advanced analytics

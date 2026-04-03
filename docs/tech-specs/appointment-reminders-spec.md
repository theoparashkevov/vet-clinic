# Automated Appointment Reminders - Technical Specification

## Context

The vet clinic experiences a 15-20% no-show rate, costing $150-300 per missed appointment. Currently, staff manually call clients to confirm appointments, consuming 30-60 minutes daily. This system automates reminders via email and SMS with two-way confirmation capabilities.

**Existing Infrastructure:**
- NestJS API with Prisma ORM
- PostgreSQL database
- Twilio SMS service already integrated
- Appointment scheduling system
- Client Portal with email capabilities

## Goals

1. **Automated multi-channel reminders** - Email (48hrs) + SMS (24hrs) before appointments
2. **Two-way SMS responses** - Clients can CONFIRM, CANCEL, or RESCHEDULE via text
3. **Confirmation tracking** - Appointment status updates based on client replies
4. **Waitlist automation** - Trigger waitlist backfill when cancellations occur
5. **Configurable templates** - Different reminder content per appointment type
6. **Failure recovery** - Retry failed sends with exponential backoff
7. **Reminder analytics** - Dashboard showing confirmation rates and no-show trends

## Non-Goals

- Phone call reminders (out of scope - too expensive)
- WhatsApp/Viber reminders (SMS is sufficient for MVP)
- Push notifications (mobile app doesn't exist)
- AI chatbot responses (keep it simple: keyword matching)
- Automatic rescheduling (just provide link, let staff handle)

## Proposed Approach

### Architecture
1. **Cron Job**: Runs every hour to check for appointments needing reminders
2. **Queue System**: BullMQ or node-cron with Redis for reliable job processing
3. **SMS Webhook**: Twilio webhook endpoint handles incoming replies
4. **Template Engine**: Handlebars or simple string replacement for personalization

### Alternative: Event-Driven with Database Triggers
- **Why not**: More complex, harder to debug, scheduling logic is clearer with cron
- **Why Cron**: Simple, predictable, easy to monitor and retry

## Data Model

### New Prisma Models

```prisma
// ── Appointment Reminders ───────────────────────────────────────────────────

model ReminderConfig {
  id                String   @id @default(cuid())
  
  // Appointment type this config applies to
  appointmentType   String   // "WELLNESS", "SURGERY", "DENTAL", etc. or "DEFAULT"
  isDefault         Boolean  @default(false)
  
  // Timing configuration
  emailReminderHours    Int    @default(48)  // Hours before appointment
  smsReminderHours      Int    @default(24)
  finalSmsHours         Int?   // Optional day-of reminder
  
  // Templates
  emailSubject          String
  emailTemplate         String // Handlebars template
  smsTemplate           String // Limited to 160 chars for single SMS
  
  // Settings
  isActive              Boolean @default(true)
  requireConfirmation   Boolean @default(false) // If true, auto-cancel if not confirmed
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@unique([appointmentType])
}

model ReminderLog {
  id              String   @id @default(cuid())
  
  // Relations
  appointmentId   String
  appointment     Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  patientId       String
  ownerId         String
  
  // Reminder details
  type            String   // "EMAIL_48H", "SMS_24H", "SMS_DAYOF"
  channel         String   // "EMAIL" or "SMS"
  status          String   @default("PENDING") // PENDING, SENT, DELIVERED, FAILED, REPLIED
  
  // Content
  subject         String?  // For email
  content         String   // The actual message sent
  recipient       String   // Email address or phone number
  
  // Tracking
  sentAt          DateTime?
  deliveredAt     DateTime?
  failedAt        DateTime?
  failureReason   String?
  
  // Twilio/Email provider tracking
  providerMessageId String? // Twilio MessageSid or Email MessageId
  
  // Reply handling
  replyReceivedAt DateTime?
  replyContent    String?
  replyAction     String?  // CONFIRMED, CANCELLED, RESCHEDULE_REQUESTED
  
  // Retry logic
  retryCount      Int      @default(0)
  nextRetryAt     DateTime?
  
  createdAt       DateTime @default(now())
  
  @@index([appointmentId])
  @@index([status])
  @@index([createdAt])
  @@index([type])
}

model OwnerReminderPreference {
  id              String   @id @default(cuid())
  
  ownerId         String   @unique
  owner           Owner    @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  
  // Opt-in/opt-out
  emailReminders  Boolean  @default(true)
  smsReminders    Boolean  @default(true)
  
  // Preferred channel
  preferredChannel String  @default("BOTH") // EMAIL, SMS, BOTH
  
  // Quiet hours (don't send SMS during these hours)
  smsQuietStart   Int?     // Hour (0-23), e.g., 21 for 9 PM
  smsQuietEnd     Int?     // Hour (0-23), e.g., 8 for 8 AM
  
  updatedAt       DateTime @updatedAt
  
  @@index([ownerId])
}

// Update existing Appointment model
model Appointment {
  // ... existing fields ...
  
  // Reminder tracking
  confirmationStatus    String   @default("PENDING") // PENDING, CONFIRMED, CANCELLED_BY_CLIENT
  confirmedAt           DateTime?
  confirmationMethod    String?  // "SMS", "EMAIL", "PHONE", "PORTAL"
  
  // Reminder logs
  reminderLogs          ReminderLog[]
  
  // Auto-cancel handling
  autoCancelled         Boolean  @default(false)
  autoCancelledAt       DateTime?
  autoCancelledReason   String?
  
  // Waitlist backfill tracking
  waitlistBackfilled    Boolean  @default(false)
  backfilledAt          DateTime?
  backfilledWithId      String?  // Appointment ID that took this slot
}

// Update Owner model
model Owner {
  // ... existing fields ...
  reminderPreference    OwnerReminderPreference?
}
```

## API Endpoints

### Reminder Configuration (Admin Only)

```typescript
// GET /v1/reminders/config
// Get all reminder configurations
Response: ReminderConfig[]

// GET /v1/reminders/config/:appointmentType
// Get config for specific appointment type
Response: ReminderConfig

// POST /v1/reminders/config
// Create new reminder configuration
Body: {
  appointmentType: string
  emailReminderHours: number
  smsReminderHours: number
  emailSubject: string
  emailTemplate: string
  smsTemplate: string
  isActive: boolean
}
Response: ReminderConfig

// PUT /v1/reminders/config/:id
// Update configuration
Body: Partial<CreateReminderConfigDto>

// DELETE /v1/reminders/config/:id
// Delete configuration (can't delete default)
```

### Reminder Logs & Monitoring

```typescript
// GET /v1/reminders/logs
// Query reminder logs with filters
Query: {
  appointmentId?: string
  patientId?: string
  ownerId?: string
  status?: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'REPLIED'
  type?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}
Response: {
  data: ReminderLog[]
  meta: { total, page, totalPages }
}

// GET /v1/reminders/stats
// Dashboard statistics
Query: {
  startDate: string
  endDate: string
}
Response: {
  totalRemindersSent: number
  totalDelivered: number
  totalFailed: number
  confirmationRate: number // percentage
  noShowRate: number // percentage
  byType: {
    type: string
    sent: number
    confirmed: number
    failed: number
  }[]
}

// POST /v1/reminders/:appointmentId/send-now
// Manually trigger a reminder (staff only)
Body: {
  type: 'EMAIL' | 'SMS'
  templateOverride?: string // Optional custom message
}
```

### Client Preferences

```typescript
// GET /v1/reminders/preferences
// Get current user's reminder preferences (client portal)
Response: OwnerReminderPreference

// PUT /v1/reminders/preferences
// Update preferences
Body: {
  emailReminders?: boolean
  smsReminders?: boolean
  preferredChannel?: 'EMAIL' | 'SMS' | 'BOTH'
  smsQuietStart?: number
  smsQuietEnd?: number
}
```

### Webhooks (Twilio)

```typescript
// POST /v1/webhooks/twilio/sms-reply
// Handle incoming SMS replies from Twilio
// Secured with Twilio signature validation
Body: {
  From: string      // Phone number
  Body: string      // Message content
  MessageSid: string // Twilio message ID
  // ... other Twilio params
}
Response: 200 OK (Twilio expects 200)
```

## Template System

### Available Variables

```handlebars
{{patientName}} - Pet's name
{{ownerName}} - Client's name
{{appointmentDate}} - Formatted date
{{appointmentTime}} - Formatted time
{{appointmentType}} - Type of appointment
{{doctorName}} - Veterinarian name
{{clinicName}} - Clinic name
{{clinicPhone}} - Clinic phone number
{{confirmUrl}} - Link to confirm via portal
{{rescheduleUrl}} - Link to reschedule
{{cancelUrl}} - Link to cancel
```

### Default Templates

**Email (48 hours):**
```
Subject: Appointment Reminder for {{patientName}}

Hi {{ownerName}},

This is a friendly reminder that {{patientName}} has an appointment scheduled:

Date: {{appointmentDate}}
Time: {{appointmentTime}}
Type: {{appointmentType}}
Doctor: {{doctorName}}

Please reply to this email or text CONFIRM to verify, or call us at {{clinicPhone}} if you need to reschedule.

Thank you,
{{clinicName}}
```

**SMS (24 hours):**
```
Hi {{ownerName}}, reminder: {{patientName}} has {{appointmentType}} appt on {{appointmentDate}} at {{appointmentTime}}. Reply CONFIRM to verify or CANCEL to cancel. {{clinicName}} {{clinicPhone}}
```

## Implementation Phases

### Phase 1: Core Reminder Engine (Week 1)

1. **Database Migration**
   - Create ReminderConfig, ReminderLog, OwnerReminderPreference tables
   - Add reminder fields to Appointment model

2. **Cron Job Setup**
   - Install node-cron or @nestjs/schedule
   - Create ReminderService with checkReminders() method
   - Run every hour to find appointments needing reminders

3. **Basic Reminder Sending**
   - Implement email sending (use existing email service)
   - Implement SMS sending (use existing Twilio service)
   - Log all attempts to ReminderLog

4. **Configuration API**
   - CRUD endpoints for ReminderConfig
   - Default configurations for common appointment types

### Phase 2: Two-Way SMS (Week 2)

1. **Twilio Webhook**
   - Create webhook endpoint for SMS replies
   - Validate Twilio signatures
   - Parse reply content

2. **Reply Processing**
   - Keyword matching: CONFIRM, CANCEL, RESCHEDULE
   - Update appointment confirmationStatus
   - Update ReminderLog with reply info

3. **Auto-Cancellation**
   - If client texts CANCEL, mark appointment cancelled
   - Trigger waitlist backfill logic
   - Notify staff of cancellation

### Phase 3: Waitlist & Optimization (Week 3)

1. **Waitlist Integration**
   - When appointment cancelled via SMS, trigger waitlist
   - Notify waitlist clients of available slot
   - Track backfill in appointment record

2. **Failure Retry**
   - Exponential backoff for failed sends
   - Max 3 retries for SMS, 2 for email
   - Alert staff if persistent failures

3. **Client Preferences**
   - Portal page for clients to manage preferences
   - Opt-in/opt-out controls
   - Quiet hours settings

### Phase 4: Dashboard & Analytics (Week 4)

1. **Admin Dashboard**
   - Upcoming reminders view
   - Confirmation rate charts
   - No-show trends
   - Failed sends list

2. **Manual Controls**
   - Send reminder now button
   - Override templates for special cases
   - Bulk reminder send

3. **Reporting**
   - Monthly reminder effectiveness report
   - ROI calculation (reminders sent vs no-shows prevented)

## Observability

### Logs
```typescript
// Structured logging for all reminder operations
logger.info('Reminder scheduled', {
  appointmentId,
  type: 'EMAIL_48H',
  scheduledFor: '2024-01-15T10:00:00Z'
});

logger.info('Reminder sent', {
  logId,
  channel: 'SMS',
  recipient: '+1234567890',
  providerMessageId: 'SM123456789'
});

logger.info('SMS reply received', {
  from: '+1234567890',
  content: 'CONFIRM',
  action: 'CONFIRMED',
  appointmentId
});
```

### Metrics
- `reminders.sent.total` - Counter by channel and type
- `reminders.delivered.total` - Counter by channel
- `reminders.failed.total` - Counter with failure reason
- `reminders.replies.total` - Counter by action type
- `appointments.confirmation_rate` - Gauge (percentage)
- `appointments.no_show_rate` - Gauge (percentage)

### Alerts
- High failure rate (>10% in 1 hour) → Alert dev team
- SMS reply processing failure → Alert immediately
- Cron job hasn't run in >2 hours → Alert dev team

## Test Plan

### Unit Tests
- Template rendering with variables
- Keyword matching for SMS replies
- Cron job appointment filtering logic
- Time zone handling

### Integration Tests
- End-to-end reminder flow (create appointment → receive reminder)
- SMS reply processing
- Webhook signature validation
- Database state consistency

### E2E Tests
- Client receives email reminder 48 hours before
- Client receives SMS reminder 24 hours before
- Client replies CONFIRM → appointment confirmed
- Client replies CANCEL → appointment cancelled + waitlist triggered
- Failure retry mechanism

## Security Considerations

1. **Webhook Security**
   - Validate Twilio request signatures
   - Rate limit webhook endpoint
   - Log all webhook requests

2. **Data Privacy**
   - Don't log full message content (PII)
   - Encrypt phone numbers at rest
   - Honor opt-out requests immediately

3. **Compliance**
   - TCPA compliance for SMS (opt-in required)
   - CAN-SPAM for emails (unsubscribe link)
   - GDPR right to be forgotten

## Open Questions

1. **Time Zones**: Do we need per-clinic timezone support or is local time sufficient?
   - *Assumption: Use clinic's fixed timezone for now*

2. **Waitlist**: Is there an existing waitlist system to integrate with?
   - *Assumption: Build simple waitlist trigger, integrate with existing later*

3. **International**: Any international clients (different SMS/email regulations)?
   - *Assumption: US-only for MVP*

## Rollout Plan

1. **Soft Launch** (Week 1)
   - Enable for 10% of appointments
   - Monitor failure rates
   - Staff training on manual overrides

2. **Gradual Rollout** (Weeks 2-3)
   - Increase to 50%, then 100%
   - Track confirmation rates
   - Adjust templates based on responses

3. **Full Deployment** (Week 4)
   - All appointments get reminders
   - Enable auto-cancellation feature
   - Launch client preference portal

## Success Metrics

- **No-show rate reduction**: Target 15% → 8% (47% reduction)
- **Confirmation rate**: Target >70% of appointments confirmed
- **Staff time saved**: 30-60 min/day on confirmation calls
- **Client satisfaction**: >90% positive feedback on reminder system

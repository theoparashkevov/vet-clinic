## Web-new scaffolding learnings

- Vite React TS template works well as a base for modern React apps.
- TanStack Router file-based routing requires `routeTree.gen.ts` to be generated before `tsc -b` passes. The Vite plugin generates it during `vite build`, but since `npm run build` runs `tsc -b && vite build`, the first run of `tsc -b` fails unless the file already exists. Workaround: run `vite build` once to generate the file, then `npm run build` works forever. The generated file should be committed to git.
- Tailwind v4 uses `@import "tailwindcss"` in CSS and `@theme` block for design tokens. No `tailwind.config.js` needed for basic theming.
- PostCSS config for Tailwind v4 is simply: `{ plugins: { "@tailwindcss/postcss": {} } }`.
- `baseUrl` + `paths` in tsconfig.app.json triggers TS5101 deprecation warning in TypeScript ~6.0.2. Removed to keep build clean.
- React 19 + TypeScript ~6.0.2 works with the Vite React plugin without issues.
- Zustand `persist` middleware stores to localStorage by default; `getToken()` reads from that stored shape directly.
- For API proxy in Vite: `server.proxy: { '/v1': { target: 'http://localhost:3000', changeOrigin: true } }`.
- The `_authenticated` layout route in TanStack Router uses `path: ''` (empty) so it doesn't add a URL segment but wraps children with auth checks.

## Plan Compliance Audit Findings (2026-04-30)

### PASS Items
- **Schema**: 34 models present across schema.prisma, schema.sqlite.prisma, schema.postgres.prisma. 5 enums in postgres schema (AppointmentStatus, InvoiceStatus, PaymentMethod, ServiceType, PaymentStatus). SQLite/PostgreSQL dual-mode supported via separate schema files.
- **Role System**: Role, Permission, UserRole, RolePermission models all present. RolesGuard at `api/src/common/guards/roles.guard.ts` and `api/src/auth/roles.guard.ts`. RolesModule with full CRUD.
- **Superadmin Panel**: `web-new/src/routes/_authenticated/admin.tsx` has 5 tabs (Settings, AI Config, Bot Config, Users, Audit Logs). All 5 tab components exist in `web-new/src/components/admin/`.
- **Invoice System**: Invoice, InvoiceItem, Payment, ServiceCatalog models present. `api/src/invoices/` module with controller, service, module, dto.
- **AI Bubble**: Multi-provider backend with AIProviderRegistry, OpenAI provider, Anthropic provider, test provider. Frontend AIBubble.tsx is text-only with medical disclaimer. Extensible registry pattern.
- **Generic Bot**: Viber adapter at `api/src/bot/adapters/viber.adapter.ts`. Webhook controller, conversation service, adapter registry, and business handlers (appointment, identity, menu, patient, reminder).
- **Audit Log**: AuditLogInterceptor captures userId, action, resourceType, resourceId, oldValues, newValues in metadataJson.
- **web-new Stack**: Vite + React 19 (^19.2.5) + Tailwind v4 (^4.2.4) + TanStack Router + TanStack Query + Zustand. Confirmed in package.json and code.
- **Docker**: `web-new` service present in docker-compose.yml with build context, healthcheck, and depends_on api.
- **Error Handling**: ErrorBoundary.tsx, Toaster.tsx (sonner), API error toasts in api.ts for 401/403/500/network errors.

### FAIL Items
- **Demo Data Seeding — Invoices Missing**: `api/prisma/seed.ts` seeds 3 doctors, 4 owners, 6 patients, appointments, medical records, prescriptions, vaccinations, weight records, lab results, medication templates, note templates, and follow-up reminders. However, **NO Invoice or Payment records are created** in the seed file. This is a gap vs the expected deliverable.
- **Tests**: Expected "104 passing across 12 suites". Actual: 12 suites, 104 total tests, **103 passed, 1 failed**. The `happy-path.integration.spec.ts` fails because it creates a User with nested role connects without first seeding the required Role records. The test needs to create roles before creating users with roles.

### Concerns
- **AI Bubble Provider Hardcoding**: The frontend AIBubble hardcodes `provider: "openai"` in the chat request. The backend supports multi-provider switching, but the UI does not expose provider selection.
- **SQLite Schema Lacks Enums**: The SQLite schema (schema.prisma) uses String fields for statuses instead of Prisma enums. Enums only exist in schema.postgres.prisma. This is a pragmatic choice for SQLite compatibility but loses type safety in SQLite mode.
- **Seed File Size**: seed.ts is 2102 lines. Consider splitting into modular seeders for maintainability.
- **Integration Test Setup**: The failing integration test reveals that test database setup does not seed prerequisite data (roles) before running dependent operations.

## SettingsModule Implementation

### Created Files
- `api/src/settings/settings.module.ts`
- `api/src/settings/settings.service.ts`
- `api/src/settings/settings.controller.ts`
- `api/src/settings/dto.ts`
- `api/src/auth/superadmin.guard.ts`
- `api/src/auth/superadmin-access.decorator.ts`

### Modified Files
- `api/src/auth/auth.types.ts` - added `isSuperAdmin` to `AuthUser`
- `api/src/auth/auth.service.ts` - include `isSuperAdmin` in JWT payload
- `api/src/auth/auth.module.ts` - register `SuperAdminGuard`
- `api/src/app.module.ts` - import `SettingsModule`

### Endpoints
- `GET /v1/settings` - list all (superadmin only)
- `GET /v1/settings/:key` - get single setting (any authenticated user)
- `PUT /v1/settings/:key` - update single (superadmin only)
- `PUT /v1/settings` - batch update (superadmin only)

### Seeding
Default settings seeded on `OnModuleInit`:
- clinic.name = "Happy Paws Veterinary Clinic"
- clinic.address = ""
- clinic.phone = ""
- clinic.email = ""
- clinic.timezone = "UTC"
- ai.defaultProvider = "openai"
- viber.enabled = "false"

### Encryption
- AES-256-GCM for `!isPublic` settings
- Dev key fallback, configurable via `SETTINGS_ENCRYPTION_KEY`
- Secret values masked as `***` in API responses

### Testing
All curl tests passed:
- Admin (superadmin) can list, update single, and batch update
- Staff can read single setting by key
- Unauthenticated requests get 401
- Non-superadmin gets 403 on admin endpoints

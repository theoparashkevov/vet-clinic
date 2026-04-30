# Role/Permission System Implementation

## What was done
- Created RolesModule with CRUD for roles and user-role assignment
- Created @Roles() decorator and RolesGuard in common/
- Migrated existing auth/users code from simple string `user.role` to DB-based `userRoles` junction table
- Updated seed script to create default roles and assign them to demo users
- Fixed existing schema inconsistencies (added `veterinarian` to Prescription)

## Files created
- `api/src/roles/roles.module.ts`
- `api/src/roles/roles.service.ts`
- `api/src/roles/roles.controller.ts`
- `api/src/roles/dto.ts`
- `api/src/common/decorators/roles.decorator.ts`
- `api/src/common/guards/roles.guard.ts`

## Files modified
- `api/src/app.module.ts` - added RolesModule
- `api/src/auth/auth.types.ts` - changed `role: UserRole` to `roles: string[]`
- `api/src/auth/auth.service.ts` - fetch DB roles for JWT payload
- `api/src/auth/roles.guard.ts` - re-exports from common/guards
- `api/src/auth/roles.decorator.ts` - accepts `string[]` instead of `UserRole[]`
- `api/src/auth/roles.constants.ts` - added superadmin, nurse, registrar
- `api/src/auth/staff-access.decorator.ts` - uses common/ guard
- `api/src/auth/auth.module.ts` - imports RolesGuard from common/
- `api/src/users/users.service.ts` - removed `role` field usage, `listDoctors` uses DB roles
- `api/src/users/dto.ts` - removed `role` from CreateUserDto/UpdateUserDto
- `api/src/users/user-selects.ts` - includes `userRoles.role.name`
- `api/prisma/seed.ts` - creates roles and UserRole assignments
- `api/prisma/schema.prisma` - added `veterinarian` to Prescription
- `api/prisma/schema.sqlite.prisma` - same
- `api/prisma/schema.postgres.prisma` - same

## Verification
- `npm run build` passes
- `npm test` passes (80/80)
- curl scenarios verified: login returns roles, GET/POST /v1/roles work, user role assignment works, guard rejects unauthorized access with 403

export const USER_ROLES = {
  superadmin: 'superadmin',
  admin: 'admin',
  doctor: 'doctor',
  nurse: 'nurse',
  registrar: 'registrar',
  client: 'client',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const STAFF_ROLES: UserRole[] = [
  USER_ROLES.superadmin,
  USER_ROLES.admin,
  USER_ROLES.doctor,
  USER_ROLES.nurse,
  USER_ROLES.registrar,
];

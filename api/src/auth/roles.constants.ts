export const USER_ROLES = {
  admin: 'admin',
  staff: 'staff',
  doctor: 'doctor',
  client: 'client',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const STAFF_ROLES: UserRole[] = [
  USER_ROLES.admin,
  USER_ROLES.staff,
  USER_ROLES.doctor,
];

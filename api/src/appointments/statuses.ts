export const APPOINTMENT_STATUSES = ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

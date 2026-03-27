export const APPOINTMENT_STATUSES = ['scheduled', 'completed', 'cancelled', 'no-show'] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

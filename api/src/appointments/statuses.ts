export const APPOINTMENT_STATUSES = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

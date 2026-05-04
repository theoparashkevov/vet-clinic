export const APPOINTMENT_STATUSES = ['scheduled', 'arrived', 'completed', 'cancelled', 'no_show', 'rescheduled'] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const TERMINAL_STATUSES: AppointmentStatus[] = ['completed', 'cancelled', 'no_show', 'rescheduled'];

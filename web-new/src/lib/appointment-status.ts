export type AppointmentStatus =
  | "scheduled"
  | "arrived"
  | "completed"
  | "no_show"
  | "cancelled"
  | "rescheduled"

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  arrived: "Arrived",
  completed: "Completed",
  no_show: "No Show",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled",
}

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  scheduled: "bg-amber-100 text-amber-800 border border-amber-200",
  arrived: "bg-blue-100 text-blue-800 border border-blue-200",
  completed: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  no_show: "bg-gray-100 text-gray-600 border border-gray-200",
  cancelled: "bg-red-100 text-red-700 border border-red-200",
  rescheduled: "bg-violet-100 text-violet-800 border border-violet-200",
}

export const STATUS_DOT_COLORS: Record<AppointmentStatus, string> = {
  scheduled: "bg-amber-500",
  arrived: "bg-blue-500",
  completed: "bg-emerald-500",
  no_show: "bg-gray-400",
  cancelled: "bg-red-500",
  rescheduled: "bg-violet-500",
}

export const TERMINAL_STATUSES: AppointmentStatus[] = [
  "completed",
  "no_show",
  "cancelled",
  "rescheduled",
]

export function isTerminal(status: string): boolean {
  return TERMINAL_STATUSES.includes(status as AppointmentStatus)
}

export function isPast(startsAt: string): boolean {
  return new Date(startsAt) < new Date()
}

export function normalizeStatus(status: string): AppointmentStatus {
  const s = status.toLowerCase()
  if (s === "confirmed") return "arrived"
  return s as AppointmentStatus
}

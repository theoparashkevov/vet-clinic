import { useQuery } from "@tanstack/react-query"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/v1"

interface DashboardOverview {
  totalPatients: number
  totalOwners: number
  totalAppointments: number
  todayAppointments: number
  pendingLabResults: number
  appointmentGrowth: number
}

interface AppointmentsByStatus {
  scheduled: number
  completed: number
  cancelled: number
  noShow: number
}

interface TrendPoint {
  date: string
  count: number
}

interface ActivityItem {
  id: string
  date: string
  patientName: string
  reason: string | null
  status: string
}

interface DashboardStats {
  overview: DashboardOverview
  appointmentsByStatus: AppointmentsByStatus
  patientsBySpecies: Record<string, number>
  appointmentsTrend: TrendPoint[]
  recentActivity: ActivityItem[]
}

interface AppointmentsAnalytics {
  total: number
  dailyTrend: TrendPoint[]
  byStatus: Record<string, number>
  byDoctor: Record<string, number>
}

interface PatientDemographics {
  total: number
  bySpecies: Record<string, number>
  byAgeGroup: {
    puppy: number
    young: number
    adult: number
    senior: number
  }
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/analytics/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats")
  }

  const result = await response.json()
  return result.data
}

async function fetchAppointmentsAnalytics(days: number = 30): Promise<AppointmentsAnalytics> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/analytics/appointments?days=${days}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch appointments analytics")
  }

  const result = await response.json()
  return result.data
}

async function fetchPatientDemographics(): Promise<PatientDemographics> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/analytics/patients/demographics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch patient demographics")
  }

  const result = await response.json()
  return result.data
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
  })
}

export function useAppointmentsAnalytics(days: number = 30) {
  return useQuery({
    queryKey: ["analytics", "appointments", days],
    queryFn: () => fetchAppointmentsAnalytics(days),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePatientDemographics() {
  return useQuery({
    queryKey: ["analytics", "patients", "demographics"],
    queryFn: fetchPatientDemographics,
    staleTime: 5 * 60 * 1000,
  })
}

export type { DashboardStats, DashboardOverview, TrendPoint, ActivityItem, AppointmentsAnalytics, PatientDemographics }
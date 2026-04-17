const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/v1"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("vet-clinic-auth")
  if (!stored) return null
  try {
    const parsed = JSON.parse(stored)
    return parsed.state?.token || null
  } catch {
    return null
  }
}

export interface Appointment {
  id: string
  patientId: string
  ownerId: string
  doctorId?: string
  startsAt: string
  endsAt: string
  reason?: string
  status: "scheduled" | "completed" | "cancelled" | "noShow"
  patient?: {
    id: string
    name: string
    species: string
    breed?: string
  }
  owner?: {
    id: string
    name: string
    phone?: string
  }
  doctor?: {
    id: string
    name: string
  }
  createdAt: string
}

export interface CreateAppointmentData {
  patientId: string
  ownerId: string
  doctorId?: string
  startsAt: string
  endsAt: string
  reason?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken()
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export async function fetchAppointments(
  page: number = 1,
  limit: number = 10,
  filters?: {
    date?: string
    doctorId?: string
    status?: string
    patientId?: string
  }
): Promise<PaginatedResponse<Appointment>> {
  const params = new URLSearchParams()
  params.append("page", page.toString())
  params.append("limit", limit.toString())
  if (filters?.date) params.append("date", filters.date)
  if (filters?.doctorId) params.append("doctorId", filters.doctorId)
  if (filters?.status) params.append("status", filters.status)
  if (filters?.patientId) params.append("patientId", filters.patientId)

  const result = await fetchWithAuth(`${API_URL}/appointments?${params}`)
  return result
}

export async function fetchAppointment(id: string): Promise<Appointment> {
  const result = await fetchWithAuth(`${API_URL}/appointments/${id}`)
  return result.data
}

export async function createAppointment(data: CreateAppointmentData): Promise<Appointment> {
  const result = await fetchWithAuth(`${API_URL}/appointments`, {
    method: "POST",
    body: JSON.stringify(data),
  })
  return result.data
}

export async function updateAppointment(id: string, data: Partial<CreateAppointmentData>): Promise<Appointment> {
  const result = await fetchWithAuth(`${API_URL}/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  return result.data
}

export async function deleteAppointment(id: string): Promise<void> {
  await fetchWithAuth(`${API_URL}/appointments/${id}`, {
    method: "DELETE",
  })
}

export async function fetchAvailableSlots(date: string, doctorId?: string): Promise<string[]> {
  const params = new URLSearchParams()
  params.append("date", date)
  if (doctorId) params.append("doctorId", doctorId)

  const result = await fetchWithAuth(`${API_URL}/appointments/slots?${params}`)
  return result.data
}

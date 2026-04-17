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

export interface MedicalRecord {
  id: string
  patientId: string
  appointmentId?: string
  visitDate: string
  summary: string
  diagnoses?: string
  treatments?: string
  prescriptions?: string
  createdAt: string
  updatedAt: string
}

export interface CreateMedicalRecordData {
  visitDate: string
  summary: string
  diagnoses?: string
  treatments?: string
  prescriptions?: string
  appointmentId?: string
}

export interface UpdateMedicalRecordData {
  visitDate?: string
  summary?: string
  diagnoses?: string
  treatments?: string
  prescriptions?: string
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

export async function fetchMedicalRecords(patientId: string): Promise<MedicalRecord[]> {
  const result = await fetchWithAuth(`${API_URL}/patients/${patientId}/medical-records`)
  return result.data || []
}

export async function createMedicalRecord(
  patientId: string,
  data: CreateMedicalRecordData
): Promise<MedicalRecord> {
  const result = await fetchWithAuth(`${API_URL}/patients/${patientId}/medical-records`, {
    method: "POST",
    body: JSON.stringify(data),
  })
  return result.data
}

export async function updateMedicalRecord(
  id: string,
  data: UpdateMedicalRecordData
): Promise<MedicalRecord> {
  const result = await fetchWithAuth(`${API_URL}/medical-records/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  return result.data
}

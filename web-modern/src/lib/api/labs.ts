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

export interface LabPanel {
  id: string
  name: string
  category: string
  description?: string
  species?: string
  isCommon: boolean
  createdAt: string
}

export interface LabTest {
  id: string
  panelId: string
  name: string
  abbreviation?: string
  unit: string
  refRangeDogMin?: number
  refRangeDogMax?: number
  refRangeCatMin?: number
  refRangeCatMax?: number
  criticalLow?: number
  criticalHigh?: number
  warningLow?: number
  warningHigh?: number
  sortOrder: number
}

export interface LabResultValue {
  id: string
  resultId: string
  testId: string
  test?: LabTest
  value: number
  status: "normal" | "abnormal" | "critical"
  notes?: string
}

export interface LabResult {
  id: string
  patientId: string
  panelId: string
  panel?: LabPanel
  appointmentId?: string
  testDate: string
  status: "pending" | "normal" | "abnormal" | "critical"
  externalLab?: string
  notes?: string
  reviewedDate?: string
  reviewedBy?: string
  interpretation?: string
  abnormalCount: number
  criticalCount: number
  values: LabResultValue[]
  createdAt: string
}

export interface CreateLabResultData {
  panelId: string
  appointmentId?: string
  testDate: string
  externalLab?: string
  notes?: string
  values: {
    testId: string
    value: number
    notes?: string
  }[]
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

export async function fetchLabPanels(species?: string): Promise<LabPanel[]> {
  const params = new URLSearchParams()
  if (species) params.append("species", species)
  const result = await fetchWithAuth(`${API_URL}/labs/panels?${params}`)
  return result.data || []
}

export async function fetchCommonLabPanels(species?: string): Promise<LabPanel[]> {
  const params = new URLSearchParams()
  if (species) params.append("species", species)
  const result = await fetchWithAuth(`${API_URL}/labs/panels/common?${params}`)
  return result.data || []
}

export async function fetchLabTestsByPanel(panelId: string): Promise<LabTest[]> {
  const result = await fetchWithAuth(`${API_URL}/labs/panels/${panelId}/tests`)
  return result.data || []
}

export async function fetchLabResults(patientId: string): Promise<LabResult[]> {
  const result = await fetchWithAuth(`${API_URL}/labs/patients/${patientId}/results`)
  return result.data || []
}

export async function fetchPendingLabResults(patientId: string): Promise<LabResult[]> {
  const result = await fetchWithAuth(`${API_URL}/labs/patients/${patientId}/results/pending`)
  return result.data || []
}

export async function fetchLabResult(id: string): Promise<LabResult> {
  const result = await fetchWithAuth(`${API_URL}/labs/results/${id}`)
  if (!result.data) {
    throw new Error("Lab result not found")
  }
  return result.data
}

export async function createLabResult(
  patientId: string,
  data: CreateLabResultData
): Promise<LabResult> {
  const result = await fetchWithAuth(`${API_URL}/labs/patients/${patientId}/results`, {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!result.data) {
    throw new Error("Failed to create lab result")
  }
  return result.data
}

export async function updateLabResult(
  id: string,
  data: {
    status?: string
    reviewedDate?: string
    reviewedBy?: string
    interpretation?: string
    notes?: string
  }
): Promise<LabResult> {
  const result = await fetchWithAuth(`${API_URL}/labs/results/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!result.data) {
    throw new Error("Failed to update lab result")
  }
  return result.data
}

export async function deleteLabResult(id: string): Promise<void> {
  await fetchWithAuth(`${API_URL}/labs/results/${id}`, {
    method: "DELETE",
  })
}

export async function fetchTestHistory(
  patientId: string,
  testId: string,
  limit: number = 10
): Promise<LabResultValue[]> {
  const result = await fetchWithAuth(
    `${API_URL}/labs/patients/${patientId}/tests/${testId}/history?limit=${limit}`
  )
  return result.data || []
}
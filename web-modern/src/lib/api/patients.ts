const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/v1"

export interface Owner {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  createdAt: string
  updatedAt: string
}

export interface Patient {
  id: string
  name: string
  species: string
  breed?: string
  birthdate?: string
  microchipId?: string
  notes?: string
  allergies?: string
  chronicConditions?: string
  ownerId: string
  owner?: Owner
  createdAt: string
  updatedAt: string
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
  const token = localStorage.getItem("token")
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

export async function fetchPatients(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<PaginatedResponse<Patient>> {
  const params = new URLSearchParams()
  params.append("page", page.toString())
  params.append("limit", limit.toString())
  if (search) params.append("search", search)

  const result = await fetchWithAuth(`${API_URL}/patients?${params}`)
  return result
}

export async function fetchPatient(id: string): Promise<Patient> {
  const result = await fetchWithAuth(`${API_URL}/patients/${id}`)
  return result.data
}

export async function createPatient(data: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<Patient> {
  const result = await fetchWithAuth(`${API_URL}/patients`, {
    method: "POST",
    body: JSON.stringify(data),
  })
  return result.data
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
  const result = await fetchWithAuth(`${API_URL}/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  return result.data
}

export async function deletePatient(id: string): Promise<void> {
  await fetchWithAuth(`${API_URL}/patients/${id}`, {
    method: "DELETE",
  })
}

export async function fetchOwners(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<PaginatedResponse<Owner>> {
  const params = new URLSearchParams()
  params.append("page", page.toString())
  params.append("limit", limit.toString())
  if (search) params.append("search", search)

  const result = await fetchWithAuth(`${API_URL}/owners?${params}`)
  return result
}

export async function fetchOwner(id: string): Promise<Owner> {
  const result = await fetchWithAuth(`${API_URL}/owners/${id}`)
  return result.data
}

export async function createOwner(data: Omit<Owner, "id" | "createdAt" | "updatedAt">): Promise<Owner> {
  const result = await fetchWithAuth(`${API_URL}/owners`, {
    method: "POST",
    body: JSON.stringify(data),
  })
  return result.data
}

export async function updateOwner(id: string, data: Partial<Owner>): Promise<Owner> {
  const result = await fetchWithAuth(`${API_URL}/owners/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  return result.data
}

export async function deleteOwner(id: string): Promise<void> {
  await fetchWithAuth(`${API_URL}/owners/${id}`, {
    method: "DELETE",
  })
}
import { useAuthStore } from "../stores/authStore"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"

export function getToken(): string | null {
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

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken()
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    useAuthStore.getState().logout()
    window.location.href = "/login"
    throw new Error("Session expired. Please log in again.")
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export async function login(credentials: { email: string; password: string }) {
  const fullUrl = `${API_BASE}/v1/auth/login`

  const response = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || "Invalid email or password")
  }

  return response.json()
}

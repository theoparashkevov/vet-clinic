import { toast } from "sonner"
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

  let response: Response
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers,
    })
  } catch {
    toast.error("Cannot connect to server.")
    throw new Error("Cannot connect to server.")
  }

  if (response.status === 401) {
    toast.error("Session expired. Please log in again.")
    useAuthStore.getState().logout()
    window.location.href = "/login"
    throw new Error("Session expired. Please log in again.")
  }

  if (response.status === 403) {
    toast.error("You don't have permission to do that.")
    throw new Error("You don't have permission to do that.")
  }

  if (response.status >= 500) {
    toast.error("Something went wrong. Please try again.")
    throw new Error("Something went wrong. Please try again.")
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

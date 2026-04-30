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

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

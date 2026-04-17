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

export interface Photo {
  id: string
  url: string
  thumbnailUrl?: string
  category: string
  description?: string
  takenAt: string
  uploadedAt: string
  uploadedBy: string
  fileSize: number
  mimeType: string
}

export interface PhotoUploadData {
  category?: string
  description?: string
  takenAt?: string
}

export async function fetchPatientPhotos(patientId: string): Promise<Photo[]> {
  const token = getToken()
  const response = await fetch(`${API_URL}/patients/${patientId}/photos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch photos")
  }

  const data = await response.json()
  return data.data || []
}

export async function uploadPatientPhoto(
  patientId: string,
  file: File,
  data: PhotoUploadData
): Promise<Photo> {
  const token = getToken()
  const formData = new FormData()
  formData.append("file", file)
  
  if (data.category) formData.append("category", data.category)
  if (data.description) formData.append("description", data.description)
  if (data.takenAt) formData.append("takenAt", data.takenAt)

  const response = await fetch(`${API_URL}/patients/${patientId}/photos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to upload photo")
  }

  const result = await response.json()
  if (!result.data) {
    throw new Error("Failed to upload photo")
  }
  return result.data
}

export async function deletePatientPhoto(photoId: string): Promise<void> {
  const token = getToken()
  const response = await fetch(`${API_URL}/photos/${photoId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to delete photo")
  }
}

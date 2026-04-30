export interface Owner {
  id: string
  name: string
  phone: string
  email?: string | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
  emergencyContact?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Patient {
  id: string
  ownerId: string
  name: string
  species: string
  breed?: string | null
  birthdate?: string | null
  sex?: string | null
  isNeutered?: boolean | null
  color?: string | null
  microchipId?: string | null
  status: string
  deceasedAt?: string | null
  notes?: string | null
  allergies?: string | null
  chronicConditions?: string | null
  owner: Owner
  createdAt: string
  updatedAt: string
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreatePatientInput {
  ownerId: string
  name: string
  species: string
  breed?: string
  birthdate?: string
  sex?: string
  isNeutered?: boolean
  color?: string
  microchipId?: string
  status?: string
  notes?: string
  allergies?: string
  chronicConditions?: string
}

export interface UpdatePatientInput extends Partial<CreatePatientInput> {}

export interface MedicalRecord {
  id: string
  patientId: string
  appointmentId?: string | null
  createdById?: string | null
  updatedById?: string | null
  visitDate: string
  summary: string
  diagnoses?: string | null
  treatments?: string | null
  prescriptions?: string | null
  attachments?: string | null
  bodyConditionScore?: number | null
  nextVisitRecommended?: string | null
  createdAt: string
  updatedAt: string
}

export interface Appointment {
  id: string
  patientId: string
  ownerId: string
  doctorId?: string | null
  startsAt: string
  endsAt: string
  reason?: string | null
  status: string
  checkedInAt?: string | null
  checkedOutAt?: string | null
  room?: string | null
  notes?: string | null
  cancelledAt?: string | null
  cancelledBy?: string | null
  cancellationReason?: string | null
  createdAt: string
  updatedAt: string
}

export interface PatientPhoto {
  id: string
  patientId: string
  url: string
  thumbnailUrl?: string | null
  category: string
  description?: string | null
  takenAt: string
  uploadedAt: string
  uploadedBy: string
  fileSize: number
  mimeType: string
  createdAt: string
  updatedAt: string
}

export interface Prescription {
  id: string
  patientId: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string | null
  prescribedAt: string
  expiresAt: string
  refillsTotal: number
  refillsRemaining: number
  isControlled: boolean
  prescribedById?: string | null
  veterinarian?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface Vaccination {
  id: string
  patientId: string
  type: string
  name: string
  givenDate: string
  dueDate: string
  batchNumber?: string | null
  veterinarian?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface WeightRecord {
  id: string
  patientId: string
  weight: number
  date: string
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface LabResult {
  id: string
  patientId: string
  appointmentId?: string | null
  panelId: string
  testDate: string
  receivedDate?: string | null
  reviewedDate?: string | null
  reviewedBy?: string | null
  status: string
  abnormalCount: number
  criticalCount: number
  notes?: string | null
  interpretation?: string | null
  pdfUrl?: string | null
  externalLab?: string | null
  createdAt: string
  updatedAt: string
}

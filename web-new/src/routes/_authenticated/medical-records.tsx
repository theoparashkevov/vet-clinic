import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import {
  FileText,
  Plus,
  ArrowLeft,
  Calendar,
  Stethoscope,
  Heart,
  Thermometer,
  Activity,
  Weight,
  ClipboardList,
  User,
} from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Skeleton } from "../../components/ui/skeleton"
import { Separator } from "../../components/ui/separator"
import { toast } from "sonner"
import { PatientSearch } from "../../components/patients/PatientSearch"

export const Route = createFileRoute("/_authenticated/medical-records")({
  component: MedicalRecordsPage,
})

interface Patient {
  id: string
  name: string
  species: string
  owner?: { name: string }
}

interface VitalSigns {
  id?: string
  temperature?: number
  heartRate?: number
  respiratoryRate?: number
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  weight?: number
  bodyConditionScore?: number
  notes?: string
  recordedAt?: string
}

interface MedicalRecord {
  id: string
  patientId: string
  patient: Patient
  appointmentId?: string
  visitDate: string
  summary: string
  diagnoses?: string
  treatments?: string
  prescriptions?: string
  bodyConditionScore?: number
  nextVisitRecommended?: string
  createdBy?: { id: string; name: string }
  updatedBy?: { id: string; name: string }
  vitalSigns?: VitalSigns
  createdAt: string
  updatedAt: string
}

interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

function usePatients() {
  return useQuery({
    queryKey: ["patients", "list"],
    queryFn: async (): Promise<Patient[]> => {
      const res = (await fetchWithAuth("/v1/patients?limit=100")) as PaginatedResponse<Patient>
      return res.data ?? []
    },
  })
}

function useMedicalRecords(patientId?: string) {
  return useQuery({
    queryKey: ["medical-records", "list", patientId],
    queryFn: async (): Promise<MedicalRecord[]> => {
      const url = patientId
        ? `/v1/medical-records?patientId=${patientId}&limit=100`
        : "/v1/medical-records?limit=100"
      const res = (await fetchWithAuth(url)) as PaginatedResponse<MedicalRecord>
      return res.data ?? []
    },
  })
}

function useMedicalRecord(id: string | null) {
  return useQuery({
    queryKey: ["medical-records", "detail", id],
    queryFn: async (): Promise<MedicalRecord> => {
      const res = await fetchWithAuth(`/v1/medical-records/${id}`)
      return res.data as MedicalRecord
    },
    enabled: !!id,
  })
}

function useCreateMedicalRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: {
      patientId: string
      visitDate: string
      summary: string
      diagnoses?: string
      treatments?: string
      prescriptions?: string
      bodyConditionScore?: number
      nextVisitRecommended?: string
      vitalSigns?: {
        temperature?: number
        heartRate?: number
        respiratoryRate?: number
        bloodPressureSystolic?: number
        bloodPressureDiastolic?: number
        weight?: number
        bodyConditionScore?: number
        notes?: string
        recordedAt?: string
      }
    }) => {
      const res = await fetchWithAuth("/v1/medical-records", {
        method: "POST",
        body: JSON.stringify(dto),
      })
      return res.data as MedicalRecord
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] })
      toast.success("Medical record created successfully")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create medical record")
    },
  })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function MedicalRecordsPage() {
  const [view, setView] = useState<"list" | "detail" | "create">("list")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [patientFilter, setPatientFilter] = useState<string>("")

  const { data: patients } = usePatients()
  const { data: records, isLoading } = useMedicalRecords(patientFilter || undefined)
  const { data: recordDetail } = useMedicalRecord(selectedId)
  const createMutation = useCreateMedicalRecord()

  const handleViewDetail = (id: string) => {
    setSelectedId(id)
    setView("detail")
  }

  const handleBack = () => {
    setView("list")
    setSelectedId(null)
  }

  if (view === "detail" && recordDetail) {
    return <MedicalRecordDetail record={recordDetail} onBack={handleBack} />
  }

  if (view === "create") {
    return (
      <CreateMedicalRecordForm
        patients={patients ?? []}
        onCancel={handleBack}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data)
          handleBack()
        }}
        isSubmitting={createMutation.isPending}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Medical Records
          </h1>
          <p className="mt-1 text-muted-foreground">
            View and manage patient visit records.
          </p>
        </div>
        <Button onClick={() => setView("create")}>
          <Plus className="mr-2 h-4 w-4" />
          New Record
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <PatientSearch
          patients={patients ?? []}
          value={patientFilter}
          onChange={setPatientFilter}
          placeholder="Filter by patient…"
          className="max-w-sm flex-1"
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="mt-2 h-4 w-96" />
              </CardContent>
            </Card>
          ))
        ) : records && records.length > 0 ? (
          records.map((record) => (
            <MedicalRecordCard
              key={record.id}
              record={record}
              onClick={() => handleViewDetail(record.id)}
            />
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                No medical records found.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setView("create")}>
                <Plus className="mr-2 h-4 w-4" />
                Create first record
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function MedicalRecordCard({
  record,
  onClick,
}: {
  record: MedicalRecord
  onClick: () => void
}) {
  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/50"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  {formatDate(record.visitDate)}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {record.patient.name}
                </Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {record.summary}
              </p>
              {record.diagnoses && (
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium">Diagnoses:</span> {record.diagnoses}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {record.vitalSigns?.temperature && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Thermometer className="h-3 w-3" />
                {record.vitalSigns.temperature}°C
              </div>
            )}
            {record.vitalSigns?.heartRate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Heart className="h-3 w-3" />
                {record.vitalSigns.heartRate} bpm
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MedicalRecordDetail({
  record,
  onBack,
}: {
  record: MedicalRecord
  onBack: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to list
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Medical Record
        </h1>
        <p className="mt-1 text-muted-foreground">
          {record.patient.name} · {formatDate(record.visitDate)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="h-4 w-4 text-primary" />
                Visit Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {record.summary}
              </p>
            </CardContent>
          </Card>

          {record.diagnoses && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  Diagnoses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {record.diagnoses}
                </p>
              </CardContent>
            </Card>
          )}

          {record.treatments && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-primary" />
                  Treatments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {record.treatments}
                </p>
              </CardContent>
            </Card>
          )}

          {record.prescriptions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-primary" />
                  Prescriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {record.prescriptions}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patient Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{record.patient.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{formatDate(record.visitDate)}</span>
              </div>
              {record.createdBy && (
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{record.createdBy.name}</span>
                </div>
              )}
              {record.bodyConditionScore && (
                <div className="flex items-center gap-3">
                  <Weight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">BCS: {record.bodyConditionScore}/9</span>
                </div>
              )}
              {record.nextVisitRecommended && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    Next visit: {formatDate(record.nextVisitRecommended)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {record.vitalSigns && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vital Signs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {record.vitalSigns.temperature !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Temperature</span>
                    <span className="text-sm font-medium">{record.vitalSigns.temperature}°C</span>
                  </div>
                )}
                {record.vitalSigns.heartRate !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Heart Rate</span>
                    <span className="text-sm font-medium">{record.vitalSigns.heartRate} bpm</span>
                  </div>
                )}
                {record.vitalSigns.respiratoryRate !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Respiratory Rate</span>
                    <span className="text-sm font-medium">{record.vitalSigns.respiratoryRate} /min</span>
                  </div>
                )}
                {(record.vitalSigns.bloodPressureSystolic !== undefined ||
                  record.vitalSigns.bloodPressureDiastolic !== undefined) && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Blood Pressure</span>
                    <span className="text-sm font-medium">
                      {record.vitalSigns.bloodPressureSystolic ?? "—"}/
                      {record.vitalSigns.bloodPressureDiastolic ?? "—"} mmHg
                    </span>
                  </div>
                )}
                {record.vitalSigns.weight !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Weight</span>
                    <span className="text-sm font-medium">{record.vitalSigns.weight} kg</span>
                  </div>
                )}
                {record.vitalSigns.bodyConditionScore !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Body Condition</span>
                    <span className="text-sm font-medium">{record.vitalSigns.bodyConditionScore}/9</span>
                  </div>
                )}
                {record.vitalSigns.notes && (
                  <>
                    <Separator />
                    <p className="text-xs text-muted-foreground">{record.vitalSigns.notes}</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function CreateMedicalRecordForm({
  patients,
  onCancel,
  onSubmit,
  isSubmitting,
}: {
  patients: Patient[]
  onCancel: () => void
  onSubmit: (data: {
    patientId: string
    visitDate: string
    summary: string
    diagnoses?: string
    treatments?: string
    prescriptions?: string
    bodyConditionScore?: number
    nextVisitRecommended?: string
    vitalSigns?: {
      temperature?: number
      heartRate?: number
      respiratoryRate?: number
      bloodPressureSystolic?: number
      bloodPressureDiastolic?: number
      weight?: number
      bodyConditionScore?: number
      notes?: string
      recordedAt?: string
    }
  }) => Promise<void>
  isSubmitting: boolean
}) {
  const [form, setForm] = useState({
    patientId: "",
    visitDate: new Date().toISOString().slice(0, 10),
    summary: "",
    diagnoses: "",
    treatments: "",
    prescriptions: "",
    bodyConditionScore: "",
    nextVisitRecommended: "",
    vitalSigns: {
      temperature: "",
      heartRate: "",
      respiratoryRate: "",
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      weight: "",
      bodyConditionScore: "",
      notes: "",
    },
  })

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateVital = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      vitalSigns: { ...prev.vitalSigns, [field]: value },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      patientId: form.patientId,
      visitDate: form.visitDate,
      summary: form.summary,
      diagnoses: form.diagnoses || undefined,
      treatments: form.treatments || undefined,
      prescriptions: form.prescriptions || undefined,
      bodyConditionScore: form.bodyConditionScore ? parseInt(form.bodyConditionScore) : undefined,
      nextVisitRecommended: form.nextVisitRecommended || undefined,
      vitalSigns:
        form.vitalSigns.temperature ||
        form.vitalSigns.heartRate ||
        form.vitalSigns.respiratoryRate ||
        form.vitalSigns.weight
          ? {
              temperature: form.vitalSigns.temperature ? parseFloat(form.vitalSigns.temperature) : undefined,
              heartRate: form.vitalSigns.heartRate ? parseInt(form.vitalSigns.heartRate) : undefined,
              respiratoryRate: form.vitalSigns.respiratoryRate ? parseInt(form.vitalSigns.respiratoryRate) : undefined,
              bloodPressureSystolic: form.vitalSigns.bloodPressureSystolic
                ? parseInt(form.vitalSigns.bloodPressureSystolic)
                : undefined,
              bloodPressureDiastolic: form.vitalSigns.bloodPressureDiastolic
                ? parseInt(form.vitalSigns.bloodPressureDiastolic)
                : undefined,
              weight: form.vitalSigns.weight ? parseFloat(form.vitalSigns.weight) : undefined,
              bodyConditionScore: form.vitalSigns.bodyConditionScore
                ? parseInt(form.vitalSigns.bodyConditionScore)
                : undefined,
              notes: form.vitalSigns.notes || undefined,
            }
          : undefined,
    }
    onSubmit(payload)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          New Medical Record
        </h1>
        <p className="mt-1 text-muted-foreground">Record a new patient visit.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visit Information</CardTitle>
            <CardDescription>Basic details about the visit</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Patient *</Label>
              <PatientSearch
                patients={patients}
                value={form.patientId}
                onChange={(id) => updateField("patientId", id)}
                placeholder="Select patient…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visitDate">Visit Date *</Label>
              <Input
                id="visitDate"
                type="date"
                required
                value={form.visitDate}
                onChange={(e) => updateField("visitDate", e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="summary">Summary *</Label>
              <Textarea
                id="summary"
                required
                placeholder="Chief complaint and overall assessment..."
                value={form.summary}
                onChange={(e) => updateField("summary", e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="diagnoses">Diagnoses</Label>
              <Textarea
                id="diagnoses"
                placeholder="Primary and secondary diagnoses..."
                value={form.diagnoses}
                onChange={(e) => updateField("diagnoses", e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="treatments">Treatments</Label>
              <Textarea
                id="treatments"
                placeholder="Procedures, therapies, and treatments performed..."
                value={form.treatments}
                onChange={(e) => updateField("treatments", e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="prescriptions">Prescriptions</Label>
              <Textarea
                id="prescriptions"
                placeholder="Medications prescribed..."
                value={form.prescriptions}
                onChange={(e) => updateField("prescriptions", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bodyConditionScore">Body Condition Score (1-9)</Label>
              <Input
                id="bodyConditionScore"
                type="number"
                min={1}
                max={9}
                value={form.bodyConditionScore}
                onChange={(e) => updateField("bodyConditionScore", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextVisitRecommended">Next Visit Recommended</Label>
              <Input
                id="nextVisitRecommended"
                type="date"
                value={form.nextVisitRecommended}
                onChange={(e) => updateField("nextVisitRecommended", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vital Signs</CardTitle>
            <CardDescription>Optional measurements taken during the visit</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="temp">Temperature (°C)</Label>
              <Input
                id="temp"
                type="number"
                step="0.1"
                placeholder="38.5"
                value={form.vitalSigns.temperature}
                onChange={(e) => updateVital("temperature", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hr">Heart Rate (bpm)</Label>
              <Input
                id="hr"
                type="number"
                placeholder="120"
                value={form.vitalSigns.heartRate}
                onChange={(e) => updateVital("heartRate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rr">Respiratory Rate (/min)</Label>
              <Input
                id="rr"
                type="number"
                placeholder="20"
                value={form.vitalSigns.respiratoryRate}
                onChange={(e) => updateVital("respiratoryRate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bps">BP Systolic (mmHg)</Label>
              <Input
                id="bps"
                type="number"
                placeholder="120"
                value={form.vitalSigns.bloodPressureSystolic}
                onChange={(e) => updateVital("bloodPressureSystolic", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bpd">BP Diastolic (mmHg)</Label>
              <Input
                id="bpd"
                type="number"
                placeholder="80"
                value={form.vitalSigns.bloodPressureDiastolic}
                onChange={(e) => updateVital("bloodPressureDiastolic", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="25.0"
                value={form.vitalSigns.weight}
                onChange={(e) => updateVital("weight", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vitalBcs">Body Condition Score (1-9)</Label>
              <Input
                id="vitalBcs"
                type="number"
                min={1}
                max={9}
                value={form.vitalSigns.bodyConditionScore}
                onChange={(e) => updateVital("bodyConditionScore", e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-3">
              <Label htmlFor="vitalNotes">Notes</Label>
              <Textarea
                id="vitalNotes"
                placeholder="Additional observations..."
                value={form.vitalSigns.notes}
                onChange={(e) => updateVital("notes", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Record"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

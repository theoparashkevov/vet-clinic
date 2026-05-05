import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import {
  UserCheck,
  Stethoscope,
  ClipboardList,
  HeartHandshake,
  Check,
  ChevronDown,
  ChevronRight,
  FlaskConical,
  Pill,
  CalendarDays,
  PawPrint,
  ArrowLeft,
  Plus,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { fetchWithAuth } from "../../lib/api"
import { PatientSearch } from "../../components/patients/PatientSearch"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Skeleton } from "../../components/ui/skeleton"
import { Separator } from "../../components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { toast } from "sonner"

export const Route = createFileRoute("/_authenticated/visit")({
  component: NewVisitPage,
})

// ─── types ────────────────────────────────────────────────────────────────────

interface Patient {
  id: string
  name: string
  species: string
  owner?: { name: string }
}

interface Appointment {
  id: string
  patientId: string
  patient?: { name: string; species: string }
  appointedAt: string
  reason?: string
  status: string
}

interface LabPanel {
  id: string
  name: string
  category: string
  tests?: LabPanelTest[]
}

interface LabPanelTest {
  id: string
  name: string
  abbreviation?: string
  unit: string
  refRangeMin?: number
  refRangeMax?: number
}

interface MedicationTemplate {
  id: string
  name: string
  category: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

interface PaginatedResponse<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

interface CreatedItem {
  type: "lab" | "rx"
  label: string
  id: string
}

// ─── hooks ────────────────────────────────────────────────────────────────────

function usePatients() {
  return useQuery({
    queryKey: ["patients", "list"],
    queryFn: async (): Promise<Patient[]> => {
      const res = (await fetchWithAuth("/v1/patients?limit=100")) as PaginatedResponse<Patient>
      return res.data ?? []
    },
  })
}

function useTodayAppointments() {
  const today = new Date().toISOString().slice(0, 10)
  return useQuery({
    queryKey: ["appointments", "today", today],
    queryFn: async (): Promise<Appointment[]> => {
      const res = (await fetchWithAuth(
        `/v1/appointments?date=${today}&limit=50`
      )) as PaginatedResponse<Appointment>
      return res.data ?? []
    },
  })
}

function useLabPanels() {
  return useQuery({
    queryKey: ["lab-panels"],
    queryFn: async (): Promise<LabPanel[]> => {
      const res = await fetchWithAuth("/v1/lab-panels")
      return (res as any[]) ?? []
    },
  })
}

function useLabPanelDetail(panelId: string | null) {
  return useQuery({
    queryKey: ["lab-panels", "detail", panelId],
    queryFn: async (): Promise<LabPanel> => {
      const res = await fetchWithAuth(`/v1/lab-panels/${panelId}`)
      return res.data as LabPanel
    },
    enabled: !!panelId,
  })
}

function useMedicationTemplates() {
  return useQuery({
    queryKey: ["medications", "templates"],
    queryFn: async (): Promise<MedicationTemplate[]> => {
      const res = await fetchWithAuth("/v1/medications")
      return (res as any[]) ?? []
    },
  })
}

function useCreateOwner() {
  return useMutation({
    mutationFn: async (dto: { name: string; phone?: string; email?: string }) => {
      const res = await fetchWithAuth("/v1/owners", {
        method: "POST",
        body: JSON.stringify(dto),
      })
      return res.data as { id: string; name: string }
    },
  })
}

function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: {
      name: string
      species: string
      breed?: string
      dateOfBirth?: string
      sex?: string
      ownerId?: string
    }) => {
      const res = await fetchWithAuth("/v1/patients", {
        method: "POST",
        body: JSON.stringify(dto),
      })
      return res.data as Patient
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients"] }),
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
      nextVisitRecommended?: string
      vitalSigns?: {
        temperature?: number
        heartRate?: number
        respiratoryRate?: number
        bloodPressureSystolic?: number
        bloodPressureDiastolic?: number
        weight?: number
      }
    }) => {
      const res = await fetchWithAuth("/v1/medical-records", {
        method: "POST",
        body: JSON.stringify(dto),
      })
      return res.data as { id: string }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medical-records"] }),
  })
}

function useCreateLabResult() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: {
      patientId: string
      panelId: string
      testDate: string
      values: Array<{ testId: string; value: number }>
      notes?: string
      externalLab?: string
    }) => {
      const res = await fetchWithAuth("/v1/lab-results", {
        method: "POST",
        body: JSON.stringify(dto),
      })
      return res.data as { id: string }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lab-results"] }),
  })
}

function useCreatePrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: {
      patientId: string
      medicationTemplateId?: string
      medication?: string
      dosage?: string
      frequency?: string
      duration?: string
      instructions?: string
      expiresAt?: string
      refillsTotal?: number
      isControlled?: boolean
      veterinarian?: string
    }) => {
      const res = await fetchWithAuth("/v1/prescriptions", {
        method: "POST",
        body: JSON.stringify(dto),
      })
      return res.data as { id: string; medication: string }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prescriptions"] }),
  })
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── step indicator ───────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { label: "Check-in", icon: UserCheck },
  { label: "Examination", icon: Stethoscope },
  { label: "Care Plan", icon: ClipboardList },
  { label: "Discharge", icon: HeartHandshake },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-start">
      {WIZARD_STEPS.map((s, i) => (
        <div key={i} className="flex flex-1 items-start last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors",
                i < current && "border-primary bg-primary text-primary-foreground",
                i === current && "border-primary bg-primary/10 text-primary",
                i > current && "border-muted bg-muted/50 text-muted-foreground"
              )}
            >
              {i < current ? (
                <Check className="h-4 w-4" />
              ) : (
                <s.icon className="h-4 w-4" />
              )}
            </div>
            <p
              className={cn(
                "mt-1.5 whitespace-nowrap text-xs font-medium",
                i === current
                  ? "text-primary"
                  : i < current
                    ? "text-foreground"
                    : "text-muted-foreground"
              )}
            >
              {s.label}
            </p>
          </div>
          {i < WIZARD_STEPS.length - 1 && (
            <div
              className={cn(
                "mx-2 mt-4 h-0.5 flex-1",
                i < current ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── step 0: check-in ────────────────────────────────────────────────────────

interface CheckInResult {
  patientId: string
  patientName: string
  appointmentId: string | null
}

function CheckInStep({ onNext }: { onNext: (r: CheckInResult) => void }) {
  const [mode, setMode] = useState<"existing" | "new">("existing")

  // Existing patient
  const [existingId, setExistingId] = useState("")
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null)

  // New patient
  const [patientForm, setPatientForm] = useState({
    name: "",
    species: "dog",
    breed: "",
    dateOfBirth: "",
    sex: "unknown",
  })
  const [showOwner, setShowOwner] = useState(false)
  const [ownerForm, setOwnerForm] = useState({ name: "", phone: "", email: "" })

  const { data: patients } = usePatients()
  const { data: todayAppts, isLoading: apptsLoading } = useTodayAppointments()
  const createOwner = useCreateOwner()
  const createPatient = useCreatePatient()

  const selectedPatient = patients?.find((p) => p.id === existingId)

  async function handleContinue() {
    if (mode === "existing") {
      if (!existingId) {
        toast.error("Please select a patient to continue.")
        return
      }
      onNext({ patientId: existingId, patientName: selectedPatient?.name ?? "", appointmentId: selectedApptId })
    } else {
      if (!patientForm.name.trim() || !patientForm.species) {
        toast.error("Patient name and species are required.")
        return
      }
      try {
        let ownerId: string | undefined
        if (ownerForm.name.trim()) {
          const owner = await createOwner.mutateAsync({
            name: ownerForm.name,
            phone: ownerForm.phone || undefined,
            email: ownerForm.email || undefined,
          })
          ownerId = owner.id
        }
        const patient = await createPatient.mutateAsync({
          name: patientForm.name,
          species: patientForm.species,
          breed: patientForm.breed || undefined,
          dateOfBirth: patientForm.dateOfBirth || undefined,
          sex: patientForm.sex || undefined,
          ownerId,
        })
        toast.success(`${patient.name} registered`)
        onNext({ patientId: patient.id, patientName: patient.name, appointmentId: null })
      } catch (err: any) {
        toast.error(err.message || "Failed to register patient")
      }
    }
  }

  const isBusy = createOwner.isPending || createPatient.isPending

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-1 rounded-lg border p-1">
        {(["existing", "new"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              mode === m
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m === "existing" ? "Existing Patient" : "New Patient"}
          </button>
        ))}
      </div>

      {mode === "existing" ? (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Search patient</Label>
            <PatientSearch
              patients={patients ?? []}
              value={existingId}
              onChange={(id) => { setExistingId(id); setSelectedApptId(null) }}
              placeholder="Name, species, or owner…"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Today's appointments</p>
            {apptsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            ) : todayAppts && todayAppts.length > 0 ? (
              <div className="space-y-2">
                {todayAppts.map((appt) => (
                  <div
                    key={appt.id}
                    onClick={() => {
                      const next = appt.id === selectedApptId ? null : appt.id
                      setSelectedApptId(next)
                      if (next && appt.patientId && appt.patientId !== existingId) {
                        setExistingId(appt.patientId)
                      }
                    }}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50",
                      selectedApptId === appt.id && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <CalendarDays className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{appt.patient?.name ?? "Patient"}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(appt.appointedAt)}
                          {appt.reason ? ` · ${appt.reason}` : ""}
                        </p>
                      </div>
                    </div>
                    {selectedApptId === appt.id && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed py-5 text-center text-sm text-muted-foreground">
                No appointments scheduled for today.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PawPrint className="h-4 w-4" />
                Patient Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-name">Name *</Label>
                <Input
                  id="p-name"
                  placeholder="e.g. Buddy"
                  value={patientForm.name}
                  onChange={(e) => setPatientForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-species">Species *</Label>
                <Select
                  value={patientForm.species}
                  onValueChange={(v) => setPatientForm((p) => ({ ...p, species: v }))}
                >
                  <SelectTrigger id="p-species"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["dog", "cat", "bird", "rabbit", "hamster", "reptile", "other"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-breed">Breed</Label>
                <Input
                  id="p-breed"
                  placeholder="e.g. Labrador"
                  value={patientForm.breed}
                  onChange={(e) => setPatientForm((p) => ({ ...p, breed: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-dob">Date of Birth</Label>
                <Input
                  id="p-dob"
                  type="date"
                  value={patientForm.dateOfBirth}
                  onChange={(e) => setPatientForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-sex">Sex</Label>
                <Select
                  value={patientForm.sex}
                  onValueChange={(v) => setPatientForm((p) => ({ ...p, sex: v }))}
                >
                  <SelectTrigger id="p-sex"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[
                      { value: "unknown", label: "Unknown" },
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "neutered_male", label: "Neutered Male" },
                      { value: "spayed_female", label: "Spayed Female" },
                    ].map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Owner section toggle */}
          <button
            type="button"
            onClick={() => setShowOwner((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent/30"
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {showOwner ? "Remove owner information" : "Add owner information (optional)"}
            </span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", showOwner && "rotate-180")} />
          </button>

          {showOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCheck className="h-4 w-4" />
                  Owner Details
                </CardTitle>
                <CardDescription>All fields are optional</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="o-name">Name</Label>
                  <Input
                    id="o-name"
                    placeholder="e.g. Jane Smith"
                    value={ownerForm.name}
                    onChange={(e) => setOwnerForm((o) => ({ ...o, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="o-phone">Phone</Label>
                  <Input
                    id="o-phone"
                    type="tel"
                    placeholder="+1 555-0100"
                    value={ownerForm.phone}
                    onChange={(e) => setOwnerForm((o) => ({ ...o, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="o-email">Email</Label>
                  <Input
                    id="o-email"
                    type="email"
                    placeholder="jane@example.com"
                    value={ownerForm.email}
                    onChange={(e) => setOwnerForm((o) => ({ ...o, email: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleContinue} disabled={isBusy}>
          {isBusy ? "Registering…" : "Continue"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── step 1: examination ──────────────────────────────────────────────────────

interface ExaminationResult {
  recordId: string
  nextVisitRecommended?: string
}

function ExaminationStep({
  patientId,
  patientName,
  onNext,
  onBack,
}: {
  patientId: string
  patientName: string
  onNext: (r: ExaminationResult) => void
  onBack: () => void
}) {
  const [showVitals, setShowVitals] = useState(false)
  const [f, setF] = useState({
    visitDate: new Date().toISOString().slice(0, 10),
    summary: "",
    diagnoses: "",
    treatments: "",
    nextVisitRecommended: "",
    temperature: "",
    heartRate: "",
    respiratoryRate: "",
    bpSystolic: "",
    bpDiastolic: "",
    weight: "",
  })

  const createRecord = useCreateMedicalRecord()
  const up = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }))

  async function handleContinue() {
    if (!f.summary.trim()) {
      toast.error("A visit summary is required.")
      return
    }
    const hasVitals = f.temperature || f.heartRate || f.weight || f.respiratoryRate
    try {
      const record = await createRecord.mutateAsync({
        patientId,
        visitDate: f.visitDate,
        summary: f.summary,
        diagnoses: f.diagnoses || undefined,
        treatments: f.treatments || undefined,
        nextVisitRecommended: f.nextVisitRecommended || undefined,
        vitalSigns: hasVitals
          ? {
              temperature: f.temperature ? parseFloat(f.temperature) : undefined,
              heartRate: f.heartRate ? parseInt(f.heartRate) : undefined,
              respiratoryRate: f.respiratoryRate ? parseInt(f.respiratoryRate) : undefined,
              bloodPressureSystolic: f.bpSystolic ? parseInt(f.bpSystolic) : undefined,
              bloodPressureDiastolic: f.bpDiastolic ? parseInt(f.bpDiastolic) : undefined,
              weight: f.weight ? parseFloat(f.weight) : undefined,
            }
          : undefined,
      })
      toast.success("Medical record saved")
      onNext({ recordId: record.id, nextVisitRecommended: f.nextVisitRecommended || undefined })
    } catch (err: any) {
      toast.error(err.message || "Failed to save record")
    }
  }

  const vitalsFields = [
    { id: "temperature", label: "Temp (°C)", placeholder: "38.5", step: "0.1" },
    { id: "heartRate", label: "Heart Rate (bpm)", placeholder: "120" },
    { id: "respiratoryRate", label: "Resp. Rate (/min)", placeholder: "20" },
    { id: "weight", label: "Weight (kg)", placeholder: "25.0", step: "0.1" },
    { id: "bpSystolic", label: "BP Systolic (mmHg)", placeholder: "120" },
    { id: "bpDiastolic", label: "BP Diastolic (mmHg)", placeholder: "80" },
  ]

  return (
    <div className="space-y-5">
      {/* Patient banner */}
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <PawPrint className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{patientName}</p>
          <p className="text-xs text-muted-foreground">Examining now</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="visitDate">Visit Date *</Label>
        <Input
          id="visitDate"
          type="date"
          className="max-w-[200px]"
          value={f.visitDate}
          onChange={(e) => up("visitDate", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Summary *</Label>
        <Textarea
          id="summary"
          placeholder="Chief complaint and overall assessment…"
          rows={3}
          value={f.summary}
          onChange={(e) => up("summary", e.target.value)}
        />
      </div>

      {/* Vitals toggle */}
      <button
        type="button"
        onClick={() => setShowVitals((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/30"
      >
        <span className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
          Vital Signs
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showVitals && "rotate-180")} />
      </button>

      {showVitals && (
        <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
          {vitalsFields.map((field) => (
            <div key={field.id} className="space-y-1.5">
              <Label htmlFor={field.id} className="text-xs">{field.label}</Label>
              <Input
                id={field.id}
                type="number"
                step={field.step ?? "1"}
                placeholder={field.placeholder}
                value={(f as any)[field.id]}
                onChange={(e) => up(field.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="diagnoses">Diagnoses</Label>
        <Textarea
          id="diagnoses"
          placeholder="Primary and secondary diagnoses…"
          rows={2}
          value={f.diagnoses}
          onChange={(e) => up("diagnoses", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="treatments">Treatments</Label>
        <Textarea
          id="treatments"
          placeholder="Procedures and therapies performed…"
          rows={2}
          value={f.treatments}
          onChange={(e) => up("treatments", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nextVisit">Next Visit Recommended</Label>
        <Input
          id="nextVisit"
          type="date"
          className="max-w-[200px]"
          value={f.nextVisitRecommended}
          onChange={(e) => up("nextVisitRecommended", e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleContinue} disabled={createRecord.isPending}>
          {createRecord.isPending ? "Saving…" : "Continue"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── step 2: care plan ────────────────────────────────────────────────────────

function CarePlanStep({
  patientId,
  patientName,
  onNext,
  onBack,
}: {
  patientId: string
  patientName: string
  onNext: (items: CreatedItem[]) => void
  onBack: () => void
}) {
  // Lab result state
  const [labOpen, setLabOpen] = useState(false)
  const [labPanelId, setLabPanelId] = useState("")
  const [labValues, setLabValues] = useState<Record<string, string>>({})
  const [labNotes, setLabNotes] = useState("")
  const [labExternalLab, setLabExternalLab] = useState("")

  // Prescription state
  const [rxOpen, setRxOpen] = useState(false)
  const [useTemplate, setUseTemplate] = useState(true)
  const [templateId, setTemplateId] = useState("")
  const [rxF, setRxF] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    expiresAt: "",
    refillsTotal: "0",
    isControlled: false,
    veterinarian: "",
  })

  const { data: panels } = useLabPanels()
  const { data: panelDetail } = useLabPanelDetail(labPanelId || null)
  const { data: templates } = useMedicationTemplates()

  const createLabResult = useCreateLabResult()
  const createPrescription = useCreatePrescription()

  const selectedTemplate = templates?.find((t) => t.id === templateId)

  const handleTemplateChange = (tid: string) => {
    setTemplateId(tid)
    const t = templates?.find((t) => t.id === tid)
    if (t) {
      setRxF((p) => ({
        ...p,
        medication: t.name,
        dosage: t.dosage,
        frequency: t.frequency,
        duration: t.duration,
        instructions: t.instructions ?? p.instructions,
      }))
    }
  }

  async function handleContinue() {
    const items: CreatedItem[] = []

    if (labOpen && labPanelId) {
      const tests = panelDetail?.tests ?? []
      const values = tests
        .filter((t) => labValues[t.id]?.trim())
        .map((t) => ({ testId: t.id, value: parseFloat(labValues[t.id]) }))

      try {
        const lab = await createLabResult.mutateAsync({
          patientId,
          panelId: labPanelId,
          testDate: new Date().toISOString().slice(0, 10),
          values,
          notes: labNotes || undefined,
          externalLab: labExternalLab || undefined,
        })
        items.push({ type: "lab", label: panelDetail?.name ?? "Lab Result", id: lab.id })
        toast.success("Lab result recorded")
      } catch (err: any) {
        toast.error(err.message || "Failed to save lab result")
        return
      }
    }

    if (rxOpen && (templateId || rxF.medication)) {
      const dto: any = {
        patientId,
        veterinarian: rxF.veterinarian || undefined,
        expiresAt: rxF.expiresAt || undefined,
        refillsTotal: rxF.refillsTotal ? parseInt(rxF.refillsTotal) : 0,
        isControlled: rxF.isControlled,
      }
      if (useTemplate && templateId) {
        dto.medicationTemplateId = templateId
      } else {
        dto.medication = rxF.medication
        dto.dosage = rxF.dosage
        dto.frequency = rxF.frequency
        dto.duration = rxF.duration
        dto.instructions = rxF.instructions || undefined
      }
      try {
        const rx = await createPrescription.mutateAsync(dto)
        const label = useTemplate && selectedTemplate ? selectedTemplate.name : rxF.medication
        items.push({ type: "rx", label: label || "Prescription", id: rx.id })
        toast.success("Prescription created")
      } catch (err: any) {
        toast.error(err.message || "Failed to create prescription")
        return
      }
    }

    onNext(items)
  }

  const isBusy = createLabResult.isPending || createPrescription.isPending

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Optionally record lab results or prescribe medication for{" "}
        <strong>{patientName}</strong>. Both sections can be skipped.
      </p>

      {/* Lab Results card */}
      <Card className={cn("transition-colors", labOpen && "border-primary/50")}>
        <CardHeader
          className="cursor-pointer pb-3"
          onClick={() => setLabOpen((v) => !v)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="h-4 w-4 text-primary" />
              Lab Results
            </CardTitle>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                labOpen && "rotate-180"
              )}
            />
          </div>
          <CardDescription>Record results from an in-clinic or external lab test</CardDescription>
        </CardHeader>

        {labOpen && (
          <CardContent className="space-y-4 pt-0">
            <Separator />
            <div className="space-y-2">
              <Label>Lab Panel *</Label>
              <Select
                value={labPanelId || undefined}
                onValueChange={(v) => { setLabPanelId(v); setLabValues({}) }}
              >
                <SelectTrigger><SelectValue placeholder="Select panel…" /></SelectTrigger>
                <SelectContent>
                  {panels?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {p.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {labPanelId && panelDetail?.tests && panelDetail.tests.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Test Values
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {panelDetail.tests.map((test) => (
                    <div key={test.id} className="space-y-1.5">
                      <Label htmlFor={`tv-${test.id}`} className="text-xs leading-tight">
                        {test.name}
                        {test.abbreviation ? ` (${test.abbreviation})` : ""}{" "}
                        <span className="font-normal text-muted-foreground">{test.unit}</span>
                        {test.refRangeMin != null && test.refRangeMax != null && (
                          <span className="font-normal text-muted-foreground">
                            {" "}· ref {test.refRangeMin}–{test.refRangeMax}
                          </span>
                        )}
                      </Label>
                      <Input
                        id={`tv-${test.id}`}
                        type="number"
                        step="0.01"
                        placeholder="—"
                        value={labValues[test.id] ?? ""}
                        onChange={(e) =>
                          setLabValues((prev) => ({ ...prev, [test.id]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="extLab">External Lab</Label>
                <Input
                  id="extLab"
                  placeholder="e.g. IDEXX"
                  value={labExternalLab}
                  onChange={(e) => setLabExternalLab(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="labNotes">Notes / Interpretation</Label>
              <Textarea
                id="labNotes"
                placeholder="Clinical interpretation…"
                rows={2}
                value={labNotes}
                onChange={(e) => setLabNotes(e.target.value)}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Prescription card */}
      <Card className={cn("transition-colors", rxOpen && "border-primary/50")}>
        <CardHeader
          className="cursor-pointer pb-3"
          onClick={() => setRxOpen((v) => !v)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Pill className="h-4 w-4 text-primary" />
              Prescription
            </CardTitle>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                rxOpen && "rotate-180"
              )}
            />
          </div>
          <CardDescription>Prescribe medication for the patient</CardDescription>
        </CardHeader>

        {rxOpen && (
          <CardContent className="space-y-4 pt-0">
            <Separator />

            <div className="flex items-center gap-4 text-sm">
              {[true, false].map((isTemplate) => (
                <label key={String(isTemplate)} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    checked={useTemplate === isTemplate}
                    onChange={() => setUseTemplate(isTemplate)}
                    className="h-4 w-4 accent-primary"
                  />
                  {isTemplate ? "Use template" : "Manual entry"}
                </label>
              ))}
            </div>

            {useTemplate ? (
              <div className="space-y-2">
                <Label>Medication Template</Label>
                <Select
                  value={templateId || undefined}
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger><SelectValue placeholder="Select template…" /></SelectTrigger>
                  <SelectContent>
                    {templates?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <div className="space-y-0.5 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                    <p><strong>Dosage:</strong> {selectedTemplate.dosage}</p>
                    <p><strong>Frequency:</strong> {selectedTemplate.frequency}</p>
                    <p><strong>Duration:</strong> {selectedTemplate.duration}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="rx-med">Medication Name *</Label>
                  <Input
                    id="rx-med"
                    placeholder="e.g. Carprofen"
                    value={rxF.medication}
                    onChange={(e) => setRxF((p) => ({ ...p, medication: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rx-dose">Dosage</Label>
                  <Input
                    id="rx-dose"
                    placeholder="e.g. 75 mg"
                    value={rxF.dosage}
                    onChange={(e) => setRxF((p) => ({ ...p, dosage: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rx-freq">Frequency</Label>
                  <Input
                    id="rx-freq"
                    placeholder="e.g. Once daily"
                    value={rxF.frequency}
                    onChange={(e) => setRxF((p) => ({ ...p, frequency: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rx-dur">Duration</Label>
                  <Input
                    id="rx-dur"
                    placeholder="e.g. 14 days"
                    value={rxF.duration}
                    onChange={(e) => setRxF((p) => ({ ...p, duration: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rx-inst">Instructions</Label>
                  <Input
                    id="rx-inst"
                    placeholder="Give with food…"
                    value={rxF.instructions}
                    onChange={(e) => setRxF((p) => ({ ...p, instructions: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rx-vet">Veterinarian</Label>
                <Input
                  id="rx-vet"
                  placeholder="Dr. Smith"
                  value={rxF.veterinarian}
                  onChange={(e) => setRxF((p) => ({ ...p, veterinarian: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rx-exp">Expires At</Label>
                <Input
                  id="rx-exp"
                  type="date"
                  value={rxF.expiresAt}
                  onChange={(e) => setRxF((p) => ({ ...p, expiresAt: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="rx-ctrl"
                  type="checkbox"
                  checked={rxF.isControlled}
                  onChange={(e) => setRxF((p) => ({ ...p, isControlled: e.target.checked }))}
                  className="h-4 w-4 accent-primary"
                />
                <Label htmlFor="rx-ctrl" className="cursor-pointer text-sm font-normal">
                  <ShieldAlert className="mr-1 inline h-3.5 w-3.5 text-amber-600" />
                  Controlled substance
                </Label>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleContinue} disabled={isBusy}>
          {isBusy ? "Saving…" : "Continue"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── step 3: discharge ────────────────────────────────────────────────────────

function DischargeStep({
  patientName,
  createdRecordId,
  createdItems,
  nextVisitRecommended,
  onReset,
}: {
  patientName: string
  createdRecordId: string | null
  createdItems: CreatedItem[]
  nextVisitRecommended?: string
  onReset: () => void
}) {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Success header */}
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <HeartHandshake className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Visit Complete</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {patientName
              ? `${patientName}'s visit has been recorded successfully.`
              : "The visit has been recorded successfully."}
          </p>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visit Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {createdRecordId && (
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Medical record created</span>
            </div>
          )}
          {createdItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              {item.type === "lab" ? (
                <span>Lab result recorded — <strong>{item.label}</strong></span>
              ) : (
                <span>Prescription created — <strong>{item.label}</strong></span>
              )}
            </div>
          ))}
          {!createdRecordId && createdItems.length === 0 && (
            <p className="text-sm text-muted-foreground">No records were created during this visit.</p>
          )}

          {nextVisitRecommended && (
            <>
              <Separator />
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 shrink-0" />
                Next visit recommended:{" "}
                <strong className="text-foreground">
                  {new Date(nextVisitRecommended).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </strong>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="outline" onClick={onReset}>
          Start Another Visit
        </Button>
        <Button onClick={() => navigate({ to: "/dashboard" })}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

function NewVisitPage() {
  const [step, setStep] = useState(0)
  const [patientId, setPatientId] = useState("")
  const [patientName, setPatientName] = useState("")
  const [createdRecordId, setCreatedRecordId] = useState<string | null>(null)
  const [createdItems, setCreatedItems] = useState<CreatedItem[]>([])
  const [nextVisitRecommended, setNextVisitRecommended] = useState<string | undefined>()

  function reset() {
    setStep(0)
    setPatientId("")
    setPatientName("")
    setCreatedRecordId(null)
    setCreatedItems([])
    setNextVisitRecommended(undefined)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Visit</h1>
        <p className="text-muted-foreground">
          Guide a patient through today's visit step by step.
        </p>
      </div>

      <StepIndicator current={step} />

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {step === 0 && (
          <CheckInStep
            onNext={({ patientId: pid, patientName: pname, appointmentId: _ }) => {
              setPatientId(pid)
              setPatientName(pname)
              setStep(1)
            }}
          />
        )}
        {step === 1 && (
          <ExaminationStep
            patientId={patientId}
            patientName={patientName}
            onNext={({ recordId, nextVisitRecommended: nvr }) => {
              setCreatedRecordId(recordId)
              setNextVisitRecommended(nvr)
              setStep(2)
            }}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <CarePlanStep
            patientId={patientId}
            patientName={patientName}
            onNext={(items) => {
              setCreatedItems(items)
              setStep(3)
            }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <DischargeStep
            patientName={patientName}
            createdRecordId={createdRecordId}
            createdItems={createdItems}
            nextVisitRecommended={nextVisitRecommended}
            onReset={reset}
          />
        )}
      </div>
    </div>
  )
}

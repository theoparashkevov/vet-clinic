import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Pill,
  Plus,
  ArrowLeft,
  Calendar,
  User,
  Clock,
  ShieldAlert,
  RefreshCcw,
  X,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

export const Route = createFileRoute("/_authenticated/prescriptions")({
  component: PrescriptionsPage,
})

interface Patient {
  id: string
  name: string
  species: string
}

interface MedicationTemplate {
  id: string
  name: string
  category: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  isCommon: boolean
}

interface Prescription {
  id: string
  patientId: string
  patient: { name: string; species: string }
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  prescribedAt: string
  expiresAt: string
  refillsTotal: number
  refillsRemaining: number
  isControlled: boolean
  veterinarian?: string
  notes?: string
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

function useMedicationTemplates() {
  return useQuery({
    queryKey: ["medications", "templates"],
    queryFn: async (): Promise<MedicationTemplate[]> => {
      const res = await fetchWithAuth("/v1/medications")
      return (res as any[]) ?? []
    },
  })
}

function usePrescriptions(patientId?: string) {
  return useQuery({
    queryKey: ["prescriptions", "list", patientId],
    queryFn: async (): Promise<Prescription[]> => {
      const url = patientId
        ? `/v1/prescriptions?patientId=${patientId}&limit=100`
        : "/v1/prescriptions?limit=100"
      const res = (await fetchWithAuth(url)) as PaginatedResponse<Prescription>
      return res.data ?? []
    },
  })
}

function usePrescriptionDetail(id: string | null) {
  return useQuery({
    queryKey: ["prescriptions", "detail", id],
    queryFn: async (): Promise<Prescription> => {
      const res = await fetchWithAuth(`/v1/prescriptions/${id}`)
      return res.data as Prescription
    },
    enabled: !!id,
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
      notes?: string
    }) => {
      const res = await fetchWithAuth("/v1/prescriptions", {
        method: "POST",
        body: JSON.stringify(dto),
      })
      return res.data as Prescription
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
      toast.success("Prescription created successfully")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create prescription")
    },
  })
}

function useRefillPrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/v1/prescriptions/${id}/refill`, {
        method: "POST",
      })
      return res.data as Prescription
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
      toast.success("Prescription refilled successfully")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to refill prescription")
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

function isExpired(expiresAt: string) {
  return new Date(expiresAt) < new Date()
}

function PrescriptionsPage() {
  const [view, setView] = useState<"list" | "create">("list")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [patientFilter, setPatientFilter] = useState<string>("")

  const { data: patients } = usePatients()
  const { data: prescriptions, isLoading } = usePrescriptions(patientFilter || undefined)
  const createMutation = useCreatePrescription()

  const handleBack = () => {
    setView("list")
  }

  if (view === "create") {
    return (
      <CreatePrescriptionForm
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
            Prescriptions
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage patient prescriptions and medications.
          </p>
        </div>
        <Button onClick={() => setView("create")}>
          <Plus className="mr-2 h-4 w-4" />
          New Prescription
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="mt-2 h-4 w-48" />
                  <Skeleton className="mt-4 h-8 w-full" />
                </CardContent>
              </Card>
            ))
          : prescriptions && prescriptions.length > 0
            ? prescriptions.map((rx) => (
                <PrescriptionCard
                  key={rx.id}
                  prescription={rx}
                  onClick={() => setSelectedId(rx.id)}
                />
              ))
            : null}
      </div>

      {!isLoading && (!prescriptions || prescriptions.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Pill className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              No prescriptions found.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setView("create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create first prescription
            </Button>
          </CardContent>
        </Card>
      )}

      <PrescriptionDrawer
        id={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}

function PrescriptionCard({
  prescription,
  onClick,
}: {
  prescription: Prescription
  onClick: () => void
}) {
  const expired = isExpired(prescription.expiresAt)

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/50"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Pill className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground line-clamp-1">
                {prescription.medication}
              </p>
              <p className="text-xs text-muted-foreground">
                {prescription.patient.name}
              </p>
            </div>
          </div>
          {prescription.isControlled && (
            <ShieldAlert className="h-4 w-4 text-amber-600" />
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            {prescription.dosage}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {prescription.frequency}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {prescription.duration}
          </Badge>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {expired ? (
              <span className="text-red-600">Expired {formatDate(prescription.expiresAt)}</span>
            ) : (
              <span>Expires {formatDate(prescription.expiresAt)}</span>
            )}
          </div>
          {prescription.refillsRemaining > 0 && (
            <span className="text-emerald-600">
              {prescription.refillsRemaining} refill{prescription.refillsRemaining !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function PrescriptionDrawer({
  id,
  onClose,
}: {
  id: string | null
  onClose: () => void
}) {
  const { data: prescription, isLoading } = usePrescriptionDetail(id)
  const refillMutation = useRefillPrescription()

  const expired = prescription ? isExpired(prescription.expiresAt) : false

  return (
    <AnimatePresence>
      {id && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Pill className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-semibold text-foreground">Prescription Details</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoading || !prescription ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-foreground">
                        {prescription.medication}
                      </h3>
                      {prescription.isControlled && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <ShieldAlert className="h-3 w-3" />
                          Controlled
                        </Badge>
                      )}
                      {expired ? (
                        <Badge variant="destructive" className="text-xs">Expired</Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {prescription.patient.name} · {prescription.patient.species}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Dosage</p>
                      <p className="text-sm font-medium text-foreground">{prescription.dosage}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Frequency</p>
                      <p className="text-sm font-medium text-foreground">{prescription.frequency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-medium text-foreground">{prescription.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Veterinarian</p>
                      <p className="text-sm font-medium text-foreground">
                        {prescription.veterinarian ?? "—"}
                      </p>
                    </div>
                  </div>

                  {prescription.instructions && (
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Instructions
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {prescription.instructions}
                      </p>
                    </div>
                  )}

                  {prescription.notes && (
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Notes
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {prescription.notes}
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{prescription.patient.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        Prescribed {formatDate(prescription.prescribedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className={expired ? "text-red-600" : "text-foreground"}>
                        {expired ? "Expired" : "Expires"} {formatDate(prescription.expiresAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                    <span className="text-sm text-muted-foreground">Refills remaining</span>
                    <span className="text-sm font-semibold text-foreground">
                      {prescription.refillsRemaining} / {prescription.refillsTotal}
                    </span>
                  </div>

                  {prescription.refillsRemaining > 0 && !expired && (
                    <Button
                      className="w-full"
                      onClick={() => refillMutation.mutate(prescription.id)}
                      disabled={refillMutation.isPending}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      {refillMutation.isPending ? "Refilling..." : "Refill Prescription"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function CreatePrescriptionForm({
  patients,
  onCancel,
  onSubmit,
  isSubmitting,
}: {
  patients: Patient[]
  onCancel: () => void
  onSubmit: (data: {
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
    notes?: string
  }) => Promise<void>
  isSubmitting: boolean
}) {
  const { data: templates } = useMedicationTemplates()
  const [useTemplate, setUseTemplate] = useState(true)
  const [selectedTemplateId, setSelectedTemplateId] = useState("")

  const [form, setForm] = useState({
    patientId: "",
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    expiresAt: "",
    refillsTotal: "0",
    isControlled: false,
    veterinarian: "",
    notes: "",
  })

  const selectedTemplate = templates?.find((t) => t.id === selectedTemplateId)

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = templates?.find((t) => t.id === templateId)
    if (template) {
      setForm((prev) => ({
        ...prev,
        medication: template.name,
        dosage: template.dosage,
        frequency: template.frequency,
        duration: template.duration,
        instructions: template.instructions ?? prev.instructions,
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = {
      patientId: form.patientId,
      expiresAt: form.expiresAt || undefined,
      refillsTotal: form.refillsTotal ? parseInt(form.refillsTotal) : 0,
      isControlled: form.isControlled,
      veterinarian: form.veterinarian || undefined,
      notes: form.notes || undefined,
    }

    if (useTemplate && selectedTemplateId) {
      payload.medicationTemplateId = selectedTemplateId
    } else {
      payload.medication = form.medication
      payload.dosage = form.dosage
      payload.frequency = form.frequency
      payload.duration = form.duration
      payload.instructions = form.instructions || undefined
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
          New Prescription
        </h1>
        <p className="mt-1 text-muted-foreground">
          Prescribe medication for a patient.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prescription</CardTitle>
            <CardDescription>Select medication and dosage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Patient *</Label>
              <PatientSearch
                patients={patients}
                value={form.patientId}
                onChange={(id) => updateField("patientId", id)}
                placeholder="Select patient…"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={useTemplate}
                  onChange={() => setUseTemplate(true)}
                  className="h-4 w-4 accent-primary"
                />
                Use template
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={!useTemplate}
                  onChange={() => setUseTemplate(false)}
                  className="h-4 w-4 accent-primary"
                />
                Manual entry
              </label>
            </div>

            {useTemplate ? (
              <div className="space-y-2">
                <Label>Medication Template *</Label>
                <Select
                  value={selectedTemplateId || undefined}
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                    <p>
                      <strong>Dosage:</strong> {selectedTemplate.dosage}
                    </p>
                    <p>
                      <strong>Frequency:</strong> {selectedTemplate.frequency}
                    </p>
                    <p>
                      <strong>Duration:</strong> {selectedTemplate.duration}
                    </p>
                    {selectedTemplate.instructions && (
                      <p>
                        <strong>Instructions:</strong> {selectedTemplate.instructions}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="medication">Medication Name *</Label>
                  <Input
                    id="medication"
                    required={!useTemplate}
                    placeholder="e.g. Carprofen"
                    value={form.medication}
                    onChange={(e) => updateField("medication", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    required={!useTemplate}
                    placeholder="e.g. 75 mg"
                    value={form.dosage}
                    onChange={(e) => updateField("dosage", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Input
                    id="frequency"
                    required={!useTemplate}
                    placeholder="e.g. Once daily"
                    value={form.frequency}
                    onChange={(e) => updateField("frequency", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    required={!useTemplate}
                    placeholder="e.g. 14 days"
                    value={form.duration}
                    onChange={(e) => updateField("duration", e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Give with food..."
                    value={form.instructions}
                    onChange={(e) => updateField("instructions", e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires At</Label>
              <Input
                id="expiresAt"
                type="date"
                value={form.expiresAt}
                onChange={(e) => updateField("expiresAt", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refills">Refills Allowed</Label>
              <Input
                id="refills"
                type="number"
                min={0}
                max={99}
                value={form.refillsTotal}
                onChange={(e) => updateField("refillsTotal", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="veterinarian">Veterinarian</Label>
              <Input
                id="veterinarian"
                placeholder="Dr. Smith"
                value={form.veterinarian}
                onChange={(e) => updateField("veterinarian", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="controlled"
                type="checkbox"
                checked={form.isControlled}
                onChange={(e) => updateField("isControlled", e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <Label htmlFor="controlled" className="text-sm font-normal cursor-pointer">
                Controlled substance
              </Label>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Prescription"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

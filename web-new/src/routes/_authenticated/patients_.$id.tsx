import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  PawPrint,
  User,
  Phone,
  Mail,
  Weight,
  Syringe,
  FileText,
  Pill,
  FlaskConical,
  CalendarDays,
  AlertTriangle,
  Pencil,
  Clock,
  Stethoscope,
  ExternalLink,
  ShieldAlert,
  Heart,
  CheckCircle2,
} from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Separator } from "../../components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"
import { useState } from "react"
import { PatientFormModal } from "../../components/patients/PatientFormModal"
import { AppointmentDetailSheet } from "../../components/appointments/AppointmentDetailSheet"
import type { Patient, MedicalRecord, Vaccination, WeightRecord, Prescription, LabResult } from "../../components/patients/types"
import {
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_DOT_COLORS,
  normalizeStatus,
} from "../../lib/appointment-status"
import { cn } from "../../lib/utils"

export const Route = createFileRoute("/_authenticated/patients_/$id")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) ?? "overview",
  }),
  component: PatientDetailPage,
})

interface AppointmentItem {
  id: string
  startsAt: string
  endsAt: string
  reason?: string | null
  status: string
  doctor?: { name: string } | null
  patient?: { name: string; species: string } | null
  owner?: { name: string } | null
}

function calculateAge(birthdate?: string | null): string {
  if (!birthdate) return "—"
  const birth = new Date(birthdate)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--
  if (years > 0) return `${years} yr`
  const months = Math.max(
    0,
    (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
  )
  return months < 1 ? "< 1 mo" : `${months} mo`
}

function formatDate(d?: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

function usePatient(id: string) {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/patients/${id}`)
      return (res as { data: Patient }).data ?? (res as Patient)
    },
    enabled: !!id,
  })
}

function usePatientAppointments(patientId: string) {
  return useQuery({
    queryKey: ["appointments", "patient", patientId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/appointments?patientId=${patientId}&limit=50`)
      return ((res as { data: AppointmentItem[] }).data ?? []) as AppointmentItem[]
    },
    enabled: !!patientId,
  })
}

function usePatientMedicalRecords(patientId: string) {
  return useQuery({
    queryKey: ["medical-records", "patient", patientId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/patients/${patientId}/medical-records`)
      return ((res as { data: MedicalRecord[] }).data ?? []) as MedicalRecord[]
    },
    enabled: !!patientId,
  })
}

function usePatientVaccinations(patientId: string) {
  return useQuery({
    queryKey: ["vaccinations", "patient", patientId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/patients/${patientId}/vaccinations`)
      return ((res as { data: Vaccination[] }).data ?? res ?? []) as Vaccination[]
    },
    enabled: !!patientId,
  })
}

function usePatientWeightHistory(patientId: string) {
  return useQuery({
    queryKey: ["weight", "patient", patientId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/patients/${patientId}/weight-records`)
      return ((res as { data: WeightRecord[] }).data ?? res ?? []) as WeightRecord[]
    },
    enabled: !!patientId,
  })
}

function usePatientPrescriptions(patientId: string) {
  return useQuery({
    queryKey: ["prescriptions", "patient", patientId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/prescriptions?patientId=${patientId}&limit=50`)
      return ((res as { data: Prescription[] }).data ?? []) as Prescription[]
    },
    enabled: !!patientId,
  })
}

function usePatientLabResults(patientId: string) {
  return useQuery({
    queryKey: ["lab-results", "patient", patientId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/lab-results?patientId=${patientId}&limit=50`)
      return ((res as { data: LabResult[] }).data ?? []) as LabResult[]
    },
    enabled: !!patientId,
  })
}

function AppointmentStatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_COLORS[normalized]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_COLORS[normalized])} />
      {STATUS_LABELS[normalized]}
    </span>
  )
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
      <Icon className="h-8 w-8 opacity-25" />
      <p className="text-sm">{text}</p>
    </div>
  )
}

function PatientDetailPage() {
  const { id } = Route.useParams()
  const { tab } = Route.useSearch()
  const { data: patient, isLoading, refetch } = usePatient(id)
  const { data: appointments = [] } = usePatientAppointments(id)
  const { data: records = [] } = usePatientMedicalRecords(id)
  const { data: vaccinations = [] } = usePatientVaccinations(id)
  const { data: weights = [] } = usePatientWeightHistory(id)
  const { data: prescriptions = [] } = usePatientPrescriptions(id)
  const { data: labResults = [] } = usePatientLabResults(id)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-lg" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <PawPrint className="mb-4 h-12 w-12 opacity-30" />
        <p className="text-lg font-medium">Patient not found</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/patients">Back to Patients</Link>
        </Button>
      </div>
    )
  }

  const overdueVaccinations = vaccinations.filter(
    (v) => v.dueDate && new Date(v.dueDate) < new Date()
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/patients">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Patients
            </Link>
          </Button>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <PawPrint className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{patient.name}</h1>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  patient.status === "active"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : patient.status === "deceased"
                    ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                )}
              >
                {patient.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {patient.species}{patient.breed ? ` · ${patient.breed}` : ""}
              {patient.birthdate ? ` · ${calculateAge(patient.birthdate)}` : ""}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit Patient
        </Button>
      </div>

      {/* Alert banners */}
      {patient.allergies && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-900/20">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">Allergies</p>
            <p className="text-sm text-amber-800 dark:text-amber-300">{patient.allergies}</p>
          </div>
        </div>
      )}

      {overdueVaccinations.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-900/20">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">Overdue Vaccinations</p>
            <p className="text-sm text-red-800 dark:text-red-300">
              {overdueVaccinations.map((v) => v.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue={tab}>
        <TabsList className="w-full justify-start gap-0.5 overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments" className="gap-1.5">
            Appointments
            {appointments.length > 0 && (
              <span className="rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-xs leading-none">
                {appointments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="vaccinations" className="gap-1.5">
            Vaccinations
            {overdueVaccinations.length > 0 && (
              <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-xs leading-none text-red-600 dark:text-red-400">
                {overdueVaccinations.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="lab">Lab Results</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview">
          <div className="grid gap-4 pt-2 lg:grid-cols-3">
            {/* Patient vitals */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Patient Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <InfoRow label="Age" value={calculateAge(patient.birthdate)} />
                <InfoRow label="Born" value={formatDate(patient.birthdate)} />
                <InfoRow label="Sex" value={patient.sex ?? "—"} />
                <InfoRow
                  label="Neutered"
                  value={patient.isNeutered == null ? "—" : patient.isNeutered ? "Yes" : "No"}
                />
                <InfoRow label="Color" value={patient.color ?? "—"} />
                <InfoRow
                  label="Microchip"
                  value={
                    patient.microchipId ? (
                      <span className="font-mono text-xs">{patient.microchipId}</span>
                    ) : (
                      "—"
                    )
                  }
                />
                {patient.chronicConditions && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Heart className="h-3 w-3" />
                        Chronic Conditions
                      </p>
                      <p className="text-xs text-foreground">{patient.chronicConditions}</p>
                    </div>
                  </>
                )}
                {patient.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Notes
                      </p>
                      <p className="text-xs text-foreground">{patient.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Owner card */}
            {patient.owner && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Owner
                    </span>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                            <Link to="/owners/$id" params={{ id: patient.ownerId }}>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View owner profile</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="font-medium">{patient.owner.name}</p>
                  {patient.owner.phone && (
                    <a
                      href={`tel:${patient.owner.phone}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{patient.owner.phone}</span>
                    </a>
                  )}
                  {patient.owner.email && (
                    <a
                      href={`mailto:${patient.owner.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{patient.owner.email}</span>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Weight history */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <Weight className="h-3.5 w-3.5" />
                  Weight History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weights.length === 0 ? (
                  <EmptyState icon={Weight} text="No weight records." />
                ) : (
                  <ul className="divide-y">
                    {weights.slice(0, 8).map((w, i) => (
                      <li key={i} className="flex items-center justify-between py-2 text-sm">
                        <span className="font-semibold tabular-nums">{w.weight} kg</span>
                        <span className="text-xs text-muted-foreground">{formatDate(w.date)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Appointments ── */}
        <TabsContent value="appointments">
          <Card className="mt-2">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4" />
                Appointments
              </CardTitle>
              <Button size="sm" asChild>
                <Link to="/appointments/new">New</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <EmptyState icon={CalendarDays} text="No appointments yet." />
              ) : (
                <ul className="divide-y">
                  {appointments.map((appt) => (
                    <li
                      key={appt.id}
                      className="flex cursor-pointer items-center justify-between py-3 transition-colors hover:bg-accent/30 -mx-6 px-6 rounded-sm"
                      onClick={() => setSelectedApptId(appt.id)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">
                          {appt.reason ?? "Visit"}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(appt.startsAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(appt.startsAt)}
                          </span>
                          {appt.doctor && (
                            <span className="flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              {appt.doctor.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <AppointmentStatusBadge status={appt.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Medical Records ── */}
        <TabsContent value="records">
          <Card className="mt-2">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Medical Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <EmptyState icon={FileText} text="No medical records yet." />
              ) : (
                <ul className="divide-y">
                  {records.map((rec) => (
                    <li key={rec.id} className="py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-tight">{rec.summary}</p>
                          {rec.diagnoses && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{rec.diagnoses}</p>
                          )}
                          {rec.treatments && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{rec.treatments}</p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(rec.visitDate)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Vaccinations ── */}
        <TabsContent value="vaccinations">
          <Card className="mt-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Syringe className="h-4 w-4" />
                Vaccinations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vaccinations.length === 0 ? (
                <EmptyState icon={Syringe} text="No vaccination records." />
              ) : (
                <ul className="divide-y">
                  {vaccinations.map((vac) => {
                    const overdue = vac.dueDate && new Date(vac.dueDate) < new Date()
                    return (
                      <li key={vac.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium">{vac.name}</p>
                          <p className="text-xs text-muted-foreground">{vac.type}</p>
                          {vac.veterinarian && (
                            <p className="text-xs text-muted-foreground">{vac.veterinarian}</p>
                          )}
                        </div>
                        <div className="text-right text-xs">
                          <p className="text-muted-foreground">Given: {formatDate(vac.givenDate)}</p>
                          <p className={overdue ? "font-medium text-red-600 dark:text-red-400" : "text-muted-foreground"}>
                            Due: {formatDate(vac.dueDate)}
                            {overdue && " ⚠"}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Prescriptions ── */}
        <TabsContent value="prescriptions">
          <Card className="mt-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Pill className="h-4 w-4" />
                Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prescriptions.length === 0 ? (
                <EmptyState icon={Pill} text="No prescriptions yet." />
              ) : (
                <ul className="divide-y">
                  {prescriptions.map((rx) => {
                    const expired = rx.expiresAt && new Date(rx.expiresAt) < new Date()
                    return (
                      <li key={rx.id} className="py-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{rx.medication}</p>
                              {rx.isControlled && (
                                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                  Controlled
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {rx.dosage} · {rx.frequency}
                              {rx.duration ? ` · ${rx.duration}` : ""}
                            </p>
                            {rx.instructions && (
                              <p className="mt-0.5 text-xs text-muted-foreground italic">{rx.instructions}</p>
                            )}
                          </div>
                          <div className="shrink-0 text-right text-xs">
                            <p className={expired ? "font-medium text-red-600 dark:text-red-400" : "text-muted-foreground"}>
                              Expires {formatDate(rx.expiresAt)}
                            </p>
                            {rx.refillsRemaining != null && (
                              <p className="text-muted-foreground">
                                {rx.refillsRemaining} refill{rx.refillsRemaining !== 1 ? "s" : ""} left
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Lab Results ── */}
        <TabsContent value="lab">
          <Card className="mt-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FlaskConical className="h-4 w-4" />
                Lab Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {labResults.length === 0 ? (
                <EmptyState icon={FlaskConical} text="No lab results yet." />
              ) : (
                <ul className="divide-y">
                  {labResults.map((lr) => (
                    <li key={lr.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium">
                          {lr.panel?.name ?? "Lab Panel"}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(lr.testDate)}</span>
                          {lr.externalLab && <span>· {lr.externalLab}</span>}
                        </div>
                        {lr.interpretation && (
                          <p className="mt-0.5 text-xs text-muted-foreground italic">{lr.interpretation}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {lr.criticalCount > 0 && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            {lr.criticalCount} critical
                          </span>
                        )}
                        {lr.abnormalCount > 0 && lr.criticalCount === 0 && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            {lr.abnormalCount} abnormal
                          </span>
                        )}
                        {lr.criticalCount === 0 && lr.abnormalCount === 0 && lr.status === "completed" && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Normal
                          </span>
                        )}
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
                          {lr.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit modal */}
      <PatientFormModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => { setEditModalOpen(false); refetch() }}
        patient={patient}
      />

      {/* Appointment detail sheet */}
      <AppointmentDetailSheet
        appointmentId={selectedApptId}
        onClose={() => setSelectedApptId(null)}
      />
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

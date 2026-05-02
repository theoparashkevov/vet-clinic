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
} from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Separator } from "../../components/ui/separator"
import { useState } from "react"
import { PatientFormModal } from "../../components/patients/PatientFormModal"
import type { Patient } from "../../components/patients/types"

export const Route = createFileRoute("/_authenticated/patients/$id")({
  component: PatientDetailPage,
})

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
      const res = await fetchWithAuth(`/v1/appointments?patientId=${patientId}&limit=10`)
      return (res as { data: unknown[] }).data ?? []
    },
    enabled: !!patientId,
  })
}

function usePatientMedicalRecords(patientId: string) {
  return useQuery({
    queryKey: ["medical-records", "patient", patientId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/medical-records?patientId=${patientId}&limit=10`)
      return (res as { data: unknown[] }).data ?? []
    },
    enabled: !!patientId,
  })
}

function usePatientVaccinations(patientId: string) {
  return useQuery({
    queryKey: ["vaccinations", "patient", patientId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/patients/${patientId}/vaccinations`)
      return (res as unknown[]) ?? []
    },
    enabled: !!patientId,
  })
}

function usePatientWeightHistory(patientId: string) {
  return useQuery({
    queryKey: ["weight", "patient", patientId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/patients/${patientId}/weight-records`)
      return (res as unknown[]) ?? []
    },
    enabled: !!patientId,
  })
}

function usePatientPrescriptions(patientId: string) {
  return useQuery({
    queryKey: ["prescriptions", "patient", patientId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/prescriptions?patientId=${patientId}&limit=10`)
      return (res as { data: unknown[] }).data ?? []
    },
    enabled: !!patientId,
  })
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toLowerCase()) {
    case "completed": case "confirmed": return "default"
    case "scheduled": case "pending": return "secondary"
    case "cancelled": case "no_show": return "destructive"
    default: return "outline"
  }
}

function PatientDetailPage() {
  const { id } = Route.useParams()
  const { data: patient, isLoading, refetch } = usePatient(id)
  const { data: appointments = [] } = usePatientAppointments(id)
  const { data: records = [] } = usePatientMedicalRecords(id)
  const { data: vaccinations = [] } = usePatientVaccinations(id)
  const { data: weights = [] } = usePatientWeightHistory(id)
  const { data: prescriptions = [] } = usePatientPrescriptions(id)

  const [editModalOpen, setEditModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="col-span-2 h-64" />
        </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/patients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Patients
            </Link>
          </Button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <PawPrint className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{patient.name}</h1>
            <p className="text-sm text-muted-foreground">{patient.species}{patient.breed ? ` · ${patient.breed}` : ""}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditModalOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Patient
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: patient info + owner */}
        <div className="space-y-4">
          {/* Patient info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patient Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={patient.status === "active" ? "default" : "destructive"}>
                  {patient.status}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age</span>
                <span>{calculateAge(patient.birthdate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Born</span>
                <span>{formatDate(patient.birthdate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sex</span>
                <span>{patient.sex ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Neutered</span>
                <span>{patient.isNeutered == null ? "—" : patient.isNeutered ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Color</span>
                <span>{patient.color ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Microchip</span>
                <span className="font-mono text-xs">{patient.microchipId ?? "—"}</span>
              </div>
              {patient.allergies && (
                <>
                  <Separator />
                  <div>
                    <div className="mb-1 flex items-center gap-1 text-amber-600">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Allergies</span>
                    </div>
                    <p className="text-xs text-foreground">{patient.allergies}</p>
                  </div>
                </>
              )}
              {patient.chronicConditions && (
                <>
                  <Separator />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chronic Conditions</span>
                    <p className="mt-1 text-xs text-foreground">{patient.chronicConditions}</p>
                  </div>
                </>
              )}
              {patient.notes && (
                <>
                  <Separator />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</span>
                    <p className="mt-1 text-xs text-foreground">{patient.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Owner info */}
          {patient.owner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Owner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">{patient.owner.name}</p>
                {patient.owner.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{patient.owner.phone}</span>
                  </div>
                )}
                {patient.owner.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{patient.owner.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Weight history */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Weight className="h-4 w-4" />
                Weight History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(weights as Array<{ weight: number; date: string; notes?: string | null }>).length === 0 ? (
                <p className="text-sm text-muted-foreground">No weight records.</p>
              ) : (
                <ul className="space-y-2">
                  {(weights as Array<{ weight: number; date: string; notes?: string | null }>)
                    .slice(0, 6)
                    .map((w, i) => (
                      <li key={i} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{w.weight} kg</span>
                        <span className="text-xs text-muted-foreground">{formatDate(w.date)}</span>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right columns: activity */}
        <div className="space-y-4 lg:col-span-2">
          {/* Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="h-4 w-4" />
                  Appointments
                </CardTitle>
                <Button size="sm" asChild>
                  <Link to="/appointments/new">New</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(appointments as Array<{ id: string; startsAt: string; reason?: string | null; status: string; doctor?: { name: string } | null }>).length === 0 ? (
                <p className="text-sm text-muted-foreground">No appointments yet.</p>
              ) : (
                <ul className="divide-y">
                  {(appointments as Array<{ id: string; startsAt: string; reason?: string | null; status: string; doctor?: { name: string } | null }>)
                    .slice(0, 5)
                    .map((appt) => (
                      <li key={appt.id} className="flex items-center justify-between py-2">
                        <div>
                          <Link to="/appointments/$id" params={{ id: appt.id }} className="text-sm font-medium hover:underline">
                            {appt.reason ?? "Visit"}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(appt.startsAt)}
                            {appt.doctor && ` · ${appt.doctor.name}`}
                          </p>
                        </div>
                        <Badge variant={statusVariant(appt.status)}>{appt.status}</Badge>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Medical Records */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Medical Records
                </CardTitle>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/medical-records">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(records as Array<{ id: string; visitDate: string; summary: string; diagnoses?: string | null }>).length === 0 ? (
                <p className="text-sm text-muted-foreground">No medical records yet.</p>
              ) : (
                <ul className="divide-y">
                  {(records as Array<{ id: string; visitDate: string; summary: string; diagnoses?: string | null }>)
                    .slice(0, 5)
                    .map((rec) => (
                      <li key={rec.id} className="py-2">
                        <p className="text-sm font-medium">{rec.summary}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(rec.visitDate)}
                          {rec.diagnoses && ` · ${rec.diagnoses}`}
                        </p>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Vaccinations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Syringe className="h-4 w-4" />
                Vaccinations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(vaccinations as Array<{ id: string; name: string; givenDate: string; dueDate: string; type: string }>).length === 0 ? (
                <p className="text-sm text-muted-foreground">No vaccination records.</p>
              ) : (
                <ul className="divide-y">
                  {(vaccinations as Array<{ id: string; name: string; givenDate: string; dueDate: string; type: string }>)
                    .slice(0, 6)
                    .map((vac) => (
                      <li key={vac.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium">{vac.name}</p>
                          <p className="text-xs text-muted-foreground">{vac.type}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>Given: {formatDate(vac.givenDate)}</p>
                          <p className={new Date(vac.dueDate) < new Date() ? "text-destructive" : ""}>
                            Due: {formatDate(vac.dueDate)}
                          </p>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Prescriptions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Pill className="h-4 w-4" />
                  Prescriptions
                </CardTitle>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/prescriptions">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(prescriptions as Array<{ id: string; medication: string; dosage: string; frequency: string; expiresAt: string }>).length === 0 ? (
                <p className="text-sm text-muted-foreground">No prescriptions yet.</p>
              ) : (
                <ul className="divide-y">
                  {(prescriptions as Array<{ id: string; medication: string; dosage: string; frequency: string; expiresAt: string }>)
                    .slice(0, 5)
                    .map((rx) => (
                      <li key={rx.id} className="py-2">
                        <p className="text-sm font-medium">{rx.medication}</p>
                        <p className="text-xs text-muted-foreground">
                          {rx.dosage} · {rx.frequency} · expires {formatDate(rx.expiresAt)}
                        </p>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Lab Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FlaskConical className="h-4 w-4" />
                  Lab Results
                </CardTitle>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/lab-results">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <LabResultsSection patientId={id} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit modal */}
      <PatientFormModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => { setEditModalOpen(false); refetch() }}
        patient={patient}
      />
    </div>
  )
}

function LabResultsSection({ patientId }: { patientId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["lab-results", "patient", patientId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/lab-results?patientId=${patientId}&limit=5`)
      return (res as { data: unknown[] }).data ?? []
    },
    enabled: !!patientId,
  })

  if (isLoading) return <Skeleton className="h-12 w-full" />

  const results = data as Array<{ id: string; testDate: string; status: string; abnormalCount: number; criticalCount: number; panel?: { name: string } | null }>

  if (!results.length) return <p className="text-sm text-muted-foreground">No lab results yet.</p>

  return (
    <ul className="divide-y">
      {results.slice(0, 5).map((lr) => (
        <li key={lr.id} className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium">{lr.panel?.name ?? "Lab Panel"}</p>
            <p className="text-xs text-muted-foreground">{new Date(lr.testDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
          </div>
          <div className="flex items-center gap-2">
            {lr.criticalCount > 0 && (
              <Badge variant="destructive">{lr.criticalCount} critical</Badge>
            )}
            {lr.abnormalCount > 0 && lr.criticalCount === 0 && (
              <Badge variant="secondary">{lr.abnormalCount} abnormal</Badge>
            )}
            <Badge variant={lr.status === "completed" ? "default" : "outline"}>{lr.status}</Badge>
          </div>
        </li>
      ))}
    </ul>
  )
}

import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "@tanstack/react-router"
import {
  X, PawPrint, User, Phone, Mail, Pencil, CalendarDays,
  ExternalLink, AlertTriangle, Syringe, Weight, Stethoscope,
} from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { Separator } from "../../components/ui/separator"
import { cn } from "../../lib/utils"
import type { Patient } from "./types"

interface Props {
  patient: Patient | null
  onClose: () => void
  onEdit: (patient: Patient) => void
}

function calculateAge(birthdate?: string | null): string {
  if (!birthdate) return "—"
  const birth = new Date(birthdate)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--
  if (years > 0) return `${years} yr`
  const months = Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth())
  return months < 1 ? "< 1 mo" : `${months} mo`
}

function formatDate(d?: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

function statusColor(status: string) {
  switch (status) {
    case "active": return "default"
    case "inactive": return "secondary"
    case "deceased": return "destructive"
    default: return "outline"
  }
}

function apptStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "completed": return "default"
    case "scheduled": return "secondary"
    case "cancelled": return "destructive"
    default: return "outline"
  }
}

interface Appointment {
  id: string
  startsAt: string
  status: string
  reason?: string | null
  doctor?: { name: string } | null
}

interface Alert {
  id: string
  type: string
  severity: string
  description: string
}

function usePatientAppointments(patientId: string | null) {
  return useQuery({
    queryKey: ["appointments", "patient", patientId],
    queryFn: async (): Promise<Appointment[]> => {
      const res = await fetchWithAuth(`/v1/appointments?patientId=${patientId}&limit=5&orderBy=startsAt&order=desc`)
      return (res as { data?: Appointment[] }).data ?? []
    },
    enabled: !!patientId,
  })
}

function usePatientAlerts(patientId: string | null) {
  return useQuery({
    queryKey: ["patients", patientId, "alerts"],
    queryFn: async (): Promise<Alert[]> => {
      try {
        const res = await fetchWithAuth(`/v1/patients/${patientId}/alerts`)
        return (res as { data?: Alert[] }).data ?? []
      } catch {
        return []
      }
    },
    enabled: !!patientId,
  })
}

export function PatientDrawer({ patient, onClose, onEdit }: Props) {
  const navigate = useNavigate()
  const { data: appointments, isLoading: apptsLoading } = usePatientAppointments(patient?.id ?? null)
  const { data: alerts } = usePatientAlerts(patient?.id ?? null)

  const criticalAlerts = alerts?.filter((a) => a.severity === "critical" || a.severity === "warning") ?? []

  return (
    <AnimatePresence>
      {patient && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <PawPrint className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold leading-tight">{patient.name}</h2>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <span>{patient.species}</span>
                    {patient.breed && <><span>·</span><span>{patient.breed}</span></>}
                    {patient.birthdate && <><span>·</span><span>{calculateAge(patient.birthdate)}</span></>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant={statusColor(patient.status)} className="capitalize">{patient.status}</Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">

              {/* Alerts banner */}
              {criticalAlerts.length > 0 && (
                <div className="border-b bg-amber-50 px-5 py-3 dark:bg-amber-950/30">
                  {criticalAlerts.map((a) => (
                    <div key={a.id} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                      <span className="text-amber-800 dark:text-amber-200">{a.description}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-5 px-5 py-4">

                {/* Owner */}
                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Owner</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="font-medium">{patient.owner?.name ?? "—"}</span>
                    </div>
                    {patient.owner?.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{patient.owner.phone}</span>
                      </div>
                    )}
                    {(patient.owner as any)?.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span>{(patient.owner as any).email}</span>
                      </div>
                    )}
                  </div>
                </section>

                <Separator />

                {/* Details grid */}
                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Details</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <Detail label="Sex" value={patient.sex ?? "—"} />
                    <Detail label="Neutered" value={patient.isNeutered ? "Yes" : "No"} />
                    <Detail label="Color" value={patient.color ?? "—"} />
                    <Detail label="Microchip" value={patient.microchipId ?? "—"} />
                    <Detail label="Born" value={formatDate(patient.birthdate)} />
                    {patient.allergies && <Detail label="Allergies" value={patient.allergies} className="col-span-2" />}
                    {patient.chronicConditions && <Detail label="Conditions" value={patient.chronicConditions} className="col-span-2" />}
                    {patient.notes && <Detail label="Notes" value={patient.notes} className="col-span-2" />}
                  </div>
                </section>

                <Separator />

                {/* Recent appointments */}
                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent Appointments</p>
                  {apptsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : appointments && appointments.length > 0 ? (
                    <div className="space-y-2">
                      {appointments.map((appt) => (
                        <div key={appt.id} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {appt.reason ?? "Visit"}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <CalendarDays className="h-3 w-3" />
                              <span>{formatDate(appt.startsAt)}</span>
                              <span>·</span>
                              <span>{formatTime(appt.startsAt)}</span>
                              {appt.doctor && <><span>·</span><span>{appt.doctor.name}</span></>}
                            </div>
                          </div>
                          <Badge variant={apptStatusColor(appt.status)} className="ml-2 shrink-0 capitalize text-xs">
                            {appt.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No appointments on record.</p>
                  )}
                </section>

              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center gap-2 border-t px-5 py-4">
              <Button className="flex-1" onClick={() => onEdit(patient)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Patient
              </Button>
              <Button
                variant="outline"
                onClick={() => { onClose(); navigate({ to: "/patients/$id", params: { id: patient.id } }) }}
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Full Profile
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Detail({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn(className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="font-medium">{value}</p>
    </div>
  )
}

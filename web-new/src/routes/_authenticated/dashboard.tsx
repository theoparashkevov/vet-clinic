import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  CalendarDays,
  PawPrint,
  ClipboardList,
  AlertTriangle,
  CalendarPlus,
  Plus,
  FileText,
  ArrowRight,
  Clock,
  ChevronDown,
  Stethoscope,
} from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { QuickAppointmentModal } from "../../components/dashboard/QuickAppointmentModal"
import { MedicalRecordsSearchModal } from "../../components/dashboard/MedicalRecordsSearchModal"
import { PatientFormModal } from "../../components/patients/PatientFormModal"
import { cn } from "../../lib/utils"

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  todayAppointments: number
  totalPatients: number
  pendingTasks: number
  overdueReminders: number
}

interface Appointment {
  id: string
  startsAt: string
  endsAt: string
  status: string
  patient: { id: string; name: string; species: string }
  doctor: { id: string; name: string } | null
  reason?: string | null
}

interface Doctor {
  id: string
  name: string
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        const res = await fetchWithAuth("/v1/analytics/dashboard")
        return res.data as DashboardStats
      } catch {
        return { todayAppointments: 0, totalPatients: 0, pendingTasks: 0, overdueReminders: 0 }
      }
    },
  })
}

function useTodayAppointments(limit: number) {
  const today = new Date().toISOString().slice(0, 10)
  return useQuery({
    queryKey: ["appointments", "today", limit],
    queryFn: async (): Promise<Appointment[]> => {
      try {
        const res = await fetchWithAuth(`/v1/appointments?date=${today}&limit=${limit}`)
        return (res.data ?? []) as Appointment[]
      } catch {
        return []
      }
    },
  })
}

function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async (): Promise<Doctor[]> => {
      try {
        const res = await fetchWithAuth("/v1/doctors")
        return Array.isArray(res) ? res : []
      } catch {
        return []
      }
    },
  })
}

function useSlots(date: string, doctorId?: string) {
  return useQuery({
    queryKey: ["appointments", "slots", date, doctorId],
    queryFn: async (): Promise<string[]> => {
      try {
        const params = new URLSearchParams({ date })
        if (doctorId) params.set("doctorId", doctorId)
        const res = await fetchWithAuth(`/v1/appointments/slots?${params}`)
        return (res as { slots?: string[] }).slots ?? []
      } catch {
        return []
      }
    },
    enabled: !!date,
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function getStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "completed":
      return "default"
    case "pending":
      return "secondary"
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
}

// ─── Animation presets ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: i * 0.06, ease: "easeOut" },
  }),
}

// ─── Stat cards config ────────────────────────────────────────────────────────

const statCards = [
  { key: "todayAppointments" as const, label: "Today's Appointments", icon: CalendarDays, color: "text-primary", bg: "bg-primary/10" },
  { key: "totalPatients" as const, label: "Total Patients", icon: PawPrint, color: "text-primary", bg: "bg-primary/10" },
  { key: "pendingTasks" as const, label: "Pending Tasks", icon: ClipboardList, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/20" },
  { key: "overdueReminders" as const, label: "Overdue Reminders", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
]

const VISIT_COUNTS = [5, 10, 20]

// ─── Component ────────────────────────────────────────────────────────────────

function DashboardPage() {
  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)

  // Modal state
  const [apptModalOpen, setApptModalOpen] = useState(false)
  const [apptModalSlot, setApptModalSlot] = useState<string | undefined>()
  const [apptModalDoctorId, setApptModalDoctorId] = useState<string | undefined>()
  const [patientModalOpen, setPatientModalOpen] = useState(false)
  const [recordsModalOpen, setRecordsModalOpen] = useState(false)

  // Visits limit
  const [visitLimit, setVisitLimit] = useState(5)

  // Slots doctor filter
  const [slotDoctorId, setSlotDoctorId] = useState("")

  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: appointments, isLoading: apptsLoading } = useTodayAppointments(visitLimit)
  const { data: doctors } = useDoctors()
  const { data: slots, isLoading: slotsLoading } = useSlots(today, slotDoctorId || undefined)

  function openSlotModal(slot: string) {
    setApptModalSlot(slot)
    setApptModalDoctorId(slotDoctorId || undefined)
    setApptModalOpen(true)
  }

  function openFreshApptModal() {
    setApptModalSlot(undefined)
    setApptModalDoctorId(undefined)
    setApptModalOpen(true)
  }

  return (
    <>
      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <QuickAppointmentModal
        open={apptModalOpen}
        onClose={() => setApptModalOpen(false)}
        prefilledSlot={apptModalSlot}
        prefilledDoctorId={apptModalDoctorId}
        prefilledDate={today}
      />
      <PatientFormModal
        open={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        onSuccess={() => setPatientModalOpen(false)}
      />
      <MedicalRecordsSearchModal
        open={recordsModalOpen}
        onClose={() => setRecordsModalOpen(false)}
      />

      {/* ── Page ───────────────────────────────────────────────────────────── */}
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-wrap gap-2"
          >
            <Button size="sm" onClick={openFreshApptModal}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPatientModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Patient
            </Button>
            <Button size="sm" variant="outline" onClick={() => setRecordsModalOpen(true)}>
              <FileText className="mr-2 h-4 w-4" />
              Medical Records
            </Button>
          </motion.div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, i) => {
            const value = stats?.[card.key] ?? 0
            return (
              <motion.div key={card.key} custom={i} variants={fadeUp} initial="hidden" animate="visible">
                <Card className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.label}
                    </CardTitle>
                    <div className={cn("rounded-md p-2", card.bg)}>
                      <card.icon className={cn("h-4 w-4", card.color)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <motion.div
                        key={value}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25 }}
                        className="text-2xl font-bold tracking-tight"
                      >
                        {value}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Main two-column area */}
        <div className="grid gap-6 lg:grid-cols-5">

          {/* Today's visits — wider column */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>Today's Visits</CardTitle>
                  <CardDescription>Scheduled appointments for today</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  {VISIT_COUNTS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setVisitLimit(n)}
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-medium transition-colors",
                        visitLimit === n
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                  <Button variant="ghost" size="sm" className="ml-2 gap-1 text-xs" render={<Link to="/appointments" search={{ dateFrom: today, dateTo: today }} />}>
                    All <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {apptsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: visitLimit }).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : appointments && appointments.length > 0 ? (
                  <div className="divide-y">
                    {appointments.map((appt, i) => (
                      <motion.div
                        key={appt.id}
                        custom={i}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                      >
                        <button
                          onClick={() => navigate({ to: "/appointments/$id", params: { id: appt.id } })}
                          className="group flex w-full items-center justify-between py-3 text-left transition-colors first:pt-0 last:pb-0 hover:bg-accent/40 rounded-md px-2 -mx-2"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <PawPrint className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {appt.patient?.name ?? "Unknown"}
                                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                  {appt.patient?.species}
                                </span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {appt.doctor?.name ?? "Unassigned"}
                                {appt.reason && ` · ${appt.reason}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-3">
                            <div className="hidden text-right sm:block">
                              <p className="text-sm font-semibold tabular-nums text-foreground">
                                {formatTime(appt.startsAt)}
                              </p>
                            </div>
                            <Badge variant={getStatusVariant(appt.status)} className="capitalize">
                              {appt.status}
                            </Badge>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
                    <p className="mt-3 text-sm font-medium text-foreground">No visits scheduled today</p>
                    <p className="mt-1 text-xs text-muted-foreground">Click New Appointment to book one</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={openFreshApptModal}>
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming free slots — narrower column */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.28 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="h-4 w-4 text-primary" />
                      Free Slots Today
                    </CardTitle>
                    <CardDescription>Click a slot to book instantly</CardDescription>
                  </div>
                </div>

                {/* Doctor filter */}
                <div className="relative mt-2">
                  <Stethoscope className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={slotDoctorId}
                    onChange={(e) => setSlotDoctorId(e.target.value)}
                    className="h-8 w-full appearance-none rounded-md border border-input bg-card pl-8 pr-7 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">All doctors</option>
                    {doctors?.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </CardHeader>

              <CardContent>
                {slotsLoading ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : slots && slots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map((s, i) => (
                      <motion.button
                        key={s}
                        custom={i}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.03, transition: { duration: 0.12 } }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => openSlotModal(s)}
                        className="flex items-center justify-center gap-1.5 rounded-md border border-input bg-card py-2.5 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                      >
                        <Clock className="h-3 w-3" />
                        {formatTime(s)}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Clock className="h-8 w-8 text-muted-foreground/30" />
                    <p className="mt-2 text-sm text-muted-foreground">No free slots today</p>
                    <p className="text-xs text-muted-foreground">
                      {slotDoctorId ? "Try selecting a different doctor" : "All slots are booked"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  )
}

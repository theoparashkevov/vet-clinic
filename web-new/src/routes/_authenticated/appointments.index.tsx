import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useState, useEffect, useRef } from "react"
import {
  Calendar,
  Clock,
  PawPrint,
  Stethoscope,
  Search,
  X,
} from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Skeleton } from "../../components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_DOT_COLORS,
  normalizeStatus,
} from "../../lib/appointment-status"
import { AppointmentDetailSheet } from "../../components/appointments/AppointmentDetailSheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"
import { cn } from "../../lib/utils"

export const Route = createFileRoute("/_authenticated/appointments/")({
  component: AppointmentsListPage,
})

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "scheduled", label: STATUS_LABELS.scheduled },
  { value: "arrived", label: STATUS_LABELS.arrived },
  { value: "completed", label: STATUS_LABELS.completed },
  { value: "cancelled", label: STATUS_LABELS.cancelled },
  { value: "no_show", label: STATUS_LABELS.no_show },
  { value: "rescheduled", label: STATUS_LABELS.rescheduled },
]

interface Appointment {
  id: string
  startsAt: string
  endsAt: string
  status: string
  reason: string | null
  room: string | null
  notes: string | null
  patient: { id: string; name: string; species: string }
  owner: { id: string; name: string }
  doctor: { id: string; name: string } | null
}

interface Doctor {
  id: string
  name: string
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

const STATUS_DESCRIPTIONS: Record<string, string> = {
  scheduled: "Booked — awaiting arrival",
  arrived: "Checked in at reception",
  completed: "Visit finished",
  no_show: "Patient did not arrive",
  cancelled: "Appointment was cancelled",
  rescheduled: "Moved to a new time",
}

function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status)
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex cursor-default items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80",
              STATUS_COLORS[normalized]
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_COLORS[normalized])} />
            {STATUS_LABELS[normalized]}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          {STATUS_DESCRIPTIONS[normalized] ?? normalized}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function useAppointments(filters: {
  dateFrom?: string
  dateTo?: string
  doctorId?: string
  status?: string
  patientName?: string
  ownerName?: string
  page: number
  limit: number
}) {
  return useQuery({
    queryKey: ["appointments", "list", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom)
      if (filters.dateTo) params.set("dateTo", filters.dateTo)
      if (filters.doctorId && filters.doctorId !== "all") params.set("doctorId", filters.doctorId)
      if (filters.status && filters.status !== "all") params.set("status", filters.status)
      if (filters.patientName) params.set("patientName", filters.patientName)
      if (filters.ownerName) params.set("ownerName", filters.ownerName)
      params.set("page", String(filters.page))
      params.set("limit", String(filters.limit))
      const res = await fetchWithAuth(`/v1/appointments?${params.toString()}`)
      return res as {
        data: Appointment[]
        meta: { total: number; page: number; limit: number; totalPages: number }
      }
    },
  })
}

function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const res = await fetchWithAuth("/v1/doctors")
      return (res as { data?: Doctor[] }).data ?? []
    },
  })
}

function AppointmentsListPage() {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [doctorId, setDoctorId] = useState("all")
  const [status, setStatus] = useState("all")
  const [patientSearch, setPatientSearch] = useState("")
  const [ownerSearch, setOwnerSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 15

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const debouncedPatient = useDebounce(patientSearch, 400)
  const debouncedOwner = useDebounce(ownerSearch, 400)

  const { data, isLoading } = useAppointments({
    dateFrom,
    dateTo,
    doctorId,
    status,
    patientName: debouncedPatient || undefined,
    ownerName: debouncedOwner || undefined,
    page,
    limit,
  })
  const { data: doctors } = useDoctors()

  const appointments = data?.data ?? []
  const meta = data?.meta

  const hasFilters =
    dateFrom || dateTo || doctorId !== "all" || status !== "all" || patientSearch || ownerSearch

  function clearFilters() {
    setDateFrom("")
    setDateTo("")
    setDoctorId("all")
    setStatus("all")
    setPatientSearch("")
    setOwnerSearch("")
    setPage(1)
  }

  // Reset page when filters change
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    setPage(1)
  }, [dateFrom, dateTo, doctorId, status, debouncedPatient, debouncedOwner])

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">From</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-36 h-8 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">To</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-36 h-8 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Doctor</label>
          <Select value={doctorId} onValueChange={setDoctorId}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue placeholder="All doctors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All doctors</SelectItem>
              {doctors?.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Patient</label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search patient…"
              className="w-40 h-8 pl-7 text-sm"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Owner</label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={ownerSearch}
              onChange={(e) => setOwnerSearch(e.target.value)}
              placeholder="Search owner…"
              className="w-40 h-8 pl-7 text-sm"
            />
          </div>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 self-end gap-1.5">
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[160px]">Date & Time</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                </TableRow>
              ))
            ) : appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-36 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Search className="h-7 w-7 opacity-40" />
                    <p className="text-sm">No appointments found.</p>
                    {hasFilters && (
                      <Button variant="link" size="sm" onClick={clearFilters}>Clear filters</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appt) => (
                <TableRow
                  key={appt.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setSelectedId(appt.id)}
                >
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(appt.startsAt)}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(appt.startsAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <PawPrint className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">
                          {appt.patient?.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {appt.patient?.species} · {appt.owner?.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm">
                      <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                      {appt.doctor?.name ?? <span className="text-muted-foreground/60 italic">Unassigned</span>}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={appt.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {appt.reason ?? <span className="italic opacity-50">—</span>}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-7 px-2"
            >
              ←
            </Button>
            <span className="px-2">
              {meta.page} / {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="h-7 px-2"
            >
              →
            </Button>
          </div>
        </div>
      )}

      <AppointmentDetailSheet
        appointmentId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}

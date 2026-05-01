import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import {
  Calendar,
  Clock,
  MoreHorizontal,
  PawPrint,
  Stethoscope,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  CheckCircle2,
  UserCheck,
  Ban,
} from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Textarea } from "../../components/ui/textarea"


export const Route = createFileRoute("/_authenticated/appointments/")({
  component: AppointmentsListPage,
})

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
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

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "completed":
      return "default"
    case "scheduled":
      return "secondary"
    case "cancelled":
      return "destructive"
    case "no_show":
      return "outline"
    default:
      return "outline"
  }
}

function useAppointments(filters: {
  dateFrom?: string
  dateTo?: string
  doctorId?: string
  status?: string
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

function useUpdateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await fetchWithAuth(`/v1/appointments/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      return res.data as Appointment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
    },
  })
}

function useCancelAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/v1/appointments/${id}`, {
        method: "DELETE",
      })
      return res.data as Appointment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
    },
  })
}

function AppointmentsListPage() {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [doctorId, setDoctorId] = useState("all")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const limit = 10

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [cancelReason, setCancelReason] = useState("")

  const { data, isLoading } = useAppointments({
    dateFrom,
    dateTo,
    doctorId,
    status,
    page,
    limit,
  })
  const { data: doctors } = useDoctors()
  const updateMutation = useUpdateAppointment()
  const cancelMutation = useCancelAppointment()

  const appointments = data?.data ?? []
  const meta = data?.meta

  const hasFilters = dateFrom || dateTo || doctorId !== "all" || status !== "all"

  function clearFilters() {
    setDateFrom("")
    setDateTo("")
    setDoctorId("all")
    setStatus("all")
    setPage(1)
  }

  function handleStatusChange(id: string, newStatus: string) {
    updateMutation.mutate({ id, data: { status: newStatus } })
  }

  function openCancel(appt: Appointment) {
    setCancelTarget(appt)
    setCancelReason("")
    setCancelDialogOpen(true)
  }

  function confirmCancel() {
    if (!cancelTarget) return
    cancelMutation.mutate(cancelTarget.id, {
      onSuccess: () => {
        setCancelDialogOpen(false)
        setCancelTarget(null)
        setCancelReason("")
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">From</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="w-full lg:w-40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">To</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="w-full lg:w-40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Doctor</label>
          <Select value={doctorId} onValueChange={(v) => { setDoctorId(v); setPage(1) }}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="All doctors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All doctors</SelectItem>
              {doctors?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
            <SelectTrigger className="w-full lg:w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="h-8 w-8 opacity-50" />
                    <p className="mt-2 text-sm">No appointments found.</p>
                    {hasFilters && (
                      <Button variant="link" size="sm" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appt) => (
                <TableRow key={appt.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDate(appt.startsAt)}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(appt.startsAt)} – {formatTime(appt.endsAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <PawPrint className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <Link
                          to="/appointments/$id"
                          params={{ id: appt.id }}
                          className="text-sm font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {appt.patient?.name ?? "Unknown"}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {appt.patient?.species ?? "Pet"} · {appt.owner?.name ?? "Unknown owner"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm text-foreground">
                      <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                      {appt.doctor?.name ?? "Unassigned"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(appt.status)}>
                      {appt.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      {appt.reason ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to="/appointments/$id" params={{ id: appt.id }}>View details</Link>
                        </DropdownMenuItem>
                        {appt.status === "scheduled" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(appt.id, "confirmed")}
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Mark as arrived
                          </DropdownMenuItem>
                        )}
                        {(appt.status === "scheduled" || appt.status === "confirmed") && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(appt.id, "completed")}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark as completed
                          </DropdownMenuItem>
                        )}
                        {appt.status !== "cancelled" && appt.status !== "completed" && (
                          <DropdownMenuItem
                            onClick={() => openCancel(appt)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(meta.page - 1) * meta.limit + 1}–
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} appointments
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the appointment for{" "}
              <strong>{cancelTarget?.patient?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Cancellation reason (optional)</label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep appointment
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

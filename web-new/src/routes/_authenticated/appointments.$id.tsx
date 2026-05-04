import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import {
  ArrowLeft,
  Calendar,
  Clock,
  PawPrint,
  Stethoscope,
  FileText,
  User,
  MapPin,
  Edit3,
  CheckCircle2,
  Ban,
  Save,
  X,
  ClipboardList,
  Loader2,
  UserX,
  CalendarX,
} from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Skeleton } from "../../components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import {
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_DOT_COLORS,
  isTerminal,
  isPast,
  normalizeStatus,
  type AppointmentStatus,
} from "../../lib/appointment-status"
import { cn } from "../../lib/utils"

export const Route = createFileRoute("/_authenticated/appointments/$id")({
  component: AppointmentDetailPage,
})

interface Appointment {
  id: string
  patientId: string
  ownerId: string
  doctorId: string | null
  startsAt: string
  endsAt: string
  reason: string | null
  status: string
  checkedInAt: string | null
  checkedOutAt: string | null
  room: string | null
  notes: string | null
  cancelledAt: string | null
  cancelledBy: string | null
  cancellationReason: string | null
  patient: { id: string; name: string; species: string }
  owner: { id: string; name: string; phone?: string; email?: string }
  doctor: { id: string; name: string; email: string } | null
  createdAt: string
  updatedAt: string
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  })
}

function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status)
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
      STATUS_COLORS[normalized]
    )}>
      <span className={cn("h-2 w-2 rounded-full", STATUS_DOT_COLORS[normalized])} />
      {STATUS_LABELS[normalized]}
    </span>
  )
}

function useAppointment(id: string) {
  return useQuery({
    queryKey: ["appointments", "detail", id],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/appointments/${id}`)
      return (res as { data?: Appointment }).data!
    },
  })
}

function useUpdateAppointment(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetchWithAuth(`/v1/appointments/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      return res.data as Appointment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", "detail", id] })
      queryClient.invalidateQueries({ queryKey: ["appointments", "list"] })
      queryClient.invalidateQueries({ queryKey: ["appointments", "calendar"] })
    },
  })
}

function AppointmentDetailPage() {
  const { id } = Route.useParams()
  const { data: appointment, isLoading } = useAppointment(id)
  const updateMutation = useUpdateAppointment(id)

  const [isEditing, setIsEditing] = useState(false)
  const [editNotes, setEditNotes] = useState("")
  const [editReason, setEditReason] = useState("")
  const [editRoom, setEditRoom] = useState("")

  const [cancelExpanded, setCancelExpanded] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [rescheduleExpanded, setRescheduleExpanded] = useState(false)

  function startEditing() {
    if (!appointment) return
    setEditNotes(appointment.notes ?? "")
    setEditReason(appointment.reason ?? "")
    setEditRoom(appointment.room ?? "")
    setIsEditing(true)
  }

  function saveChanges() {
    const data: Record<string, unknown> = {}
    if (editNotes !== (appointment?.notes ?? "")) data.notes = editNotes || null
    if (editReason !== (appointment?.reason ?? "")) data.reason = editReason || null
    if (editRoom !== (appointment?.room ?? "")) data.room = editRoom || null
    if (Object.keys(data).length === 0) { setIsEditing(false); return }
    updateMutation.mutate(data, { onSuccess: () => setIsEditing(false) })
  }

  function transition(status: AppointmentStatus, extra?: Record<string, unknown>) {
    updateMutation.mutate({ status, ...extra })
  }

  if (isLoading || !appointment) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  const status = normalizeStatus(appointment.status)
  const terminal = isTerminal(status)
  const pastStart = isPast(appointment.startsAt)

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/appointments">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to appointments
        </Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">Appointment Details</h1>
          <div className="flex items-center gap-3">
            <StatusBadge status={appointment.status} />
            <span className="text-xs text-muted-foreground">ID: {appointment.id}</span>
          </div>
        </div>
        {!terminal && !isEditing && (
          <Button variant="outline" size="sm" onClick={startEditing}>
            <Edit3 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button size="sm" onClick={saveChanges} disabled={updateMutation.isPending}>
              {updateMutation.isPending
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-primary" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{formatDate(appointment.startsAt)}</p>
                  <p className="text-xs text-muted-foreground">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {formatTime(appointment.startsAt)} – {formatTime(appointment.endsAt)}
                  </p>
                </div>
              </div>
              {appointment.room && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Room {appointment.room}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient & Owner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PawPrint className="h-4 w-4 text-primary" />
                Patient & Owner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <PawPrint className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{appointment.patient.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{appointment.patient.species}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{appointment.owner.name}</p>
                  {appointment.owner.phone && (
                    <p className="text-xs text-muted-foreground">{appointment.owner.phone}</p>
                  )}
                  {appointment.owner.email && (
                    <p className="text-xs text-muted-foreground">{appointment.owner.email}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="h-4 w-4 text-primary" />
                Doctor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{appointment.doctor?.name ?? "Unassigned"}</p>
                  {appointment.doctor?.email && (
                    <p className="text-xs text-muted-foreground">{appointment.doctor.email}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reason & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Reason & Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isEditing ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-reason">Reason</Label>
                    <Input id="edit-reason" value={editReason} onChange={(e) => setEditReason(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-notes">Notes</Label>
                    <Textarea id="edit-notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-room">Room</Label>
                    <Input id="edit-room" value={editRoom} onChange={(e) => setEditRoom(e.target.value)} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reason</p>
                    <p className="mt-1 text-sm">{appointment.reason ?? <span className="italic text-muted-foreground">No reason provided</span>}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</p>
                    <p className="mt-1 text-sm">{appointment.notes ?? <span className="italic text-muted-foreground">No notes</span>}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          {!terminal && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!cancelExpanded && !rescheduleExpanded && (
                  <>
                    {status === "scheduled" && (
                      <Button
                        className="w-full"
                        onClick={() => transition("arrived")}
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending
                          ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Mark Arrived
                      </Button>
                    )}

                    {status === "arrived" && (
                      <Button
                        className="w-full"
                        onClick={() => transition("completed")}
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending
                          ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Complete Visit
                      </Button>
                    )}

                    {status === "scheduled" && pastStart && (
                      <Button
                        variant="outline"
                        className="w-full text-muted-foreground"
                        onClick={() => transition("no_show")}
                        disabled={updateMutation.isPending}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Mark No Show
                      </Button>
                    )}

                    {status === "scheduled" && (
                      <Button
                        variant="outline"
                        className="w-full text-muted-foreground"
                        onClick={() => { setRescheduleExpanded(true); setCancelExpanded(false) }}
                      >
                        <CalendarX className="mr-2 h-4 w-4" />
                        Reschedule
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:bg-destructive/10"
                      onClick={() => { setCancelExpanded(true); setRescheduleExpanded(false); setCancelReason("") }}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Cancel Appointment
                    </Button>
                  </>
                )}

                {cancelExpanded && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Cancel appointment</p>
                    <Textarea
                      placeholder="Reason (optional)"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={2}
                      className="resize-none text-sm"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setCancelExpanded(false)}>
                        Keep
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        disabled={updateMutation.isPending}
                        onClick={() => transition("cancelled", cancelReason ? { cancellationReason: cancelReason } : undefined)}
                      >
                        {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Confirm
                      </Button>
                    </div>
                  </div>
                )}

                {rescheduleExpanded && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Mark as rescheduled?</p>
                    <p className="text-xs text-muted-foreground">
                      This appointment will be marked rescheduled. You can then book a new one for {appointment.patient.name}.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setRescheduleExpanded(false)}>
                        Keep
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={updateMutation.isPending}
                        onClick={() => transition("rescheduled")}
                      >
                        {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Confirm
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Medical records */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Medical Record</CardTitle>
              <CardDescription>Link to visit record</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/medical-records" search={{ patientId: appointment.patientId }}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  View Medical Records
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Metadata */}
          <div className="rounded-lg border bg-card p-4 space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Created</span>
              <span>{new Date(appointment.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Last updated</span>
              <span>{new Date(appointment.updatedAt).toLocaleString()}</span>
            </div>
            {appointment.checkedInAt && (
              <div className="flex justify-between text-blue-600">
                <span>Arrived</span>
                <span>{new Date(appointment.checkedInAt).toLocaleString()}</span>
              </div>
            )}
            {appointment.checkedOutAt && (
              <div className="flex justify-between text-emerald-600">
                <span>Completed</span>
                <span>{new Date(appointment.checkedOutAt).toLocaleString()}</span>
              </div>
            )}
            {appointment.cancelledAt && (
              <div className="flex justify-between text-destructive/80">
                <span>Cancelled</span>
                <span>{new Date(appointment.cancelledAt).toLocaleString()}</span>
              </div>
            )}
            {appointment.cancellationReason && (
              <p className="text-destructive/70 pt-1 border-t">
                Reason: {appointment.cancellationReason}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

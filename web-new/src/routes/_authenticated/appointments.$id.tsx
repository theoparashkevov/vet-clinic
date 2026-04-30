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
} from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"


export const Route = createFileRoute("/_authenticated/appointments/$id")({
  component: AppointmentDetailPage,
})

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
]

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

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
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
    },
  })
}

function AppointmentDetailPage() {
  const { id } = Route.useParams()
  const { data: appointment, isLoading } = useAppointment(id)
  const updateMutation = useUpdateAppointment(id)

  const [isEditing, setIsEditing] = useState(false)
  const [editStatus, setEditStatus] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editReason, setEditReason] = useState("")
  const [editRoom, setEditRoom] = useState("")

  function startEditing() {
    if (!appointment) return
    setEditStatus(appointment.status)
    setEditNotes(appointment.notes ?? "")
    setEditReason(appointment.reason ?? "")
    setEditRoom(appointment.room ?? "")
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
  }

  function saveChanges() {
    const data: Record<string, unknown> = {}
    if (editStatus !== appointment?.status) data.status = editStatus
    if (editNotes !== (appointment?.notes ?? "")) data.notes = editNotes || null
    if (editReason !== (appointment?.reason ?? "")) data.reason = editReason || null
    if (editRoom !== (appointment?.room ?? "")) data.room = editRoom || null

    if (Object.keys(data).length === 0) {
      setIsEditing(false)
      return
    }

    updateMutation.mutate(data, {
      onSuccess: () => setIsEditing(false),
    })
  }

  function handleQuickStatus(newStatus: string) {
    updateMutation.mutate({ status: newStatus })
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

  const canEdit = appointment.status !== "cancelled" && appointment.status !== "completed"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/appointments">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to appointments
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Appointment Details
          </h1>
          <p className="text-sm text-muted-foreground">
            ID: {appointment.id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && canEdit && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {isEditing && (
            <>
              <Button variant="outline" size="sm" onClick={cancelEditing}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button size="sm" onClick={saveChanges} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
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
                  Room: {appointment.room}
                </div>
              )}
            </CardContent>
          </Card>

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
                  <p className="text-xs text-muted-foreground">{appointment.patient.species}</p>
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
                  <p className="text-sm font-medium">
                    {appointment.doctor?.name ?? "Unassigned"}
                  </p>
                  {appointment.doctor?.email && (
                    <p className="text-xs text-muted-foreground">{appointment.doctor.email}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
                  <div className="space-y-2">
                    <Label htmlFor="edit-reason">Reason</Label>
                    <Input
                      id="edit-reason"
                      value={editReason}
                      onChange={(e) => setEditReason(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-notes">Notes</Label>
                    <Textarea
                      id="edit-notes"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-room">Room</Label>
                    <Input
                      id="edit-room"
                      value={editRoom}
                      onChange={(e) => setEditRoom(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Reason
                    </p>
                    <p className="mt-1 text-sm">
                      {appointment.reason ?? "No reason provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Notes
                    </p>
                    <p className="mt-1 text-sm">
                      {appointment.notes ?? "No notes"}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isEditing ? (
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={getStatusBadgeVariant(appointment.status)} className="text-sm">
                  {appointment.status}
                </Badge>
              )}

              {!isEditing && canEdit && (
                <div className="space-y-2 pt-2">
                  {appointment.status === "scheduled" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleQuickStatus("confirmed")}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as arrived
                    </Button>
                  )}
                  {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleQuickStatus("completed")}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as completed
                    </Button>
                  )}
                  {appointment.status !== "cancelled" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleQuickStatus("cancelled")}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Cancel appointment
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

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

          <div className="rounded-lg border bg-card p-4 space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Created</span>
              <span>{new Date(appointment.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Last updated</span>
              <span>{new Date(appointment.updatedAt).toLocaleString()}</span>
            </div>
            {appointment.cancelledAt && (
              <div className="flex justify-between text-destructive">
                <span>Cancelled</span>
                <span>{new Date(appointment.cancelledAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Calendar,
  Clock,
  PawPrint,
  Stethoscope,
  User,
  MapPin,
  FileText,
  CheckCircle2,
  Ban,
  CalendarX,
  UserX,
  ExternalLink,
  Loader2,
  Phone,
  Mail,
} from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Textarea } from "../ui/textarea"
import { Skeleton } from "../ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet"
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

interface Appointment {
  id: string
  patientId: string
  ownerId: string
  startsAt: string
  endsAt: string
  status: string
  reason: string | null
  room: string | null
  notes: string | null
  checkedInAt: string | null
  checkedOutAt: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  patient: { id: string; name: string; species: string; breed?: string | null }
  owner: { id: string; name: string; phone?: string; email?: string | null }
  doctor: { id: string; name: string } | null
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function StatusBadge({ status }: { status: string }) {
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

function useAppointment(id: string | null) {
  return useQuery({
    queryKey: ["appointments", "detail", id],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/appointments/${id}`)
      return (res as { data?: Appointment }).data!
    },
    enabled: !!id,
  })
}

function useTransitionStatus(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, cancellationReason }: { id: string; status: string; cancellationReason?: string }) => {
      const body: Record<string, unknown> = { status }
      if (cancellationReason) body.cancellationReason = cancellationReason
      const res = await fetchWithAuth(`/v1/appointments/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      })
      return res.data as Appointment
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["appointments", "detail", vars.id] })
      queryClient.invalidateQueries({ queryKey: ["appointments", "list"] })
      queryClient.invalidateQueries({ queryKey: ["appointments", "calendar"] })
      onSuccess?.()
    },
  })
}

type InlineAction = "cancel" | "reschedule" | null

interface AppointmentDetailSheetProps {
  appointmentId: string | null
  onClose: () => void
}

export function AppointmentDetailSheet({ appointmentId, onClose }: AppointmentDetailSheetProps) {
  const { data: appointment, isLoading } = useAppointment(appointmentId)
  const transition = useTransitionStatus()
  const [inlineAction, setInlineAction] = useState<InlineAction>(null)
  const [cancelReason, setCancelReason] = useState("")

  const status = appointment ? normalizeStatus(appointment.status) : null
  const terminal = status ? isTerminal(status) : false
  const pastStart = appointment ? isPast(appointment.startsAt) : false

  function handleTransition(nextStatus: AppointmentStatus, cancelReason?: string) {
    if (!appointment) return
    transition.mutate(
      { id: appointment.id, status: nextStatus, cancellationReason: cancelReason },
      { onSuccess: () => setInlineAction(null) }
    )
  }

  function openCancel() {
    setCancelReason("")
    setInlineAction("cancel")
  }

  return (
    <Sheet open={!!appointmentId} onOpenChange={(open) => { if (!open) { onClose(); setInlineAction(null) } }}>
      <SheetContent className="flex flex-col p-0 overflow-hidden">
        {isLoading || !appointment ? (
          <div className="flex flex-col gap-4 p-6">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Separator />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : (
          <>
            {/* Header */}
            <SheetHeader className="border-b bg-card">
              <div className="flex items-start justify-between pr-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <PawPrint className="h-4 w-4 text-primary" />
                    </div>
                    <SheetTitle className="text-lg">
                      {appointment.patient.name}
                    </SheetTitle>
                  </div>
                  <SheetDescription className="flex items-center gap-2">
                    <span className="capitalize">{appointment.patient.species}</span>
                    {appointment.patient.breed && (
                      <span className="text-muted-foreground/60">· {appointment.patient.breed}</span>
                    )}
                  </SheetDescription>
                </div>
                <StatusBadge status={appointment.status} />
              </div>

              <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(appointment.startsAt)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(appointment.startsAt)} – {formatTime(appointment.endsAt)}
                </div>
              </div>
            </SheetHeader>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-5 p-6">

                {/* People */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Owner</p>
                      <p className="text-sm font-medium">{appointment.owner.name}</p>
                      {appointment.owner.phone && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {appointment.owner.phone}
                        </p>
                      )}
                      {appointment.owner.email && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {appointment.owner.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Stethoscope className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Doctor</p>
                      <p className="text-sm font-medium">{appointment.doctor?.name ?? "Unassigned"}</p>
                    </div>
                  </div>

                  {appointment.room && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MapPin className="ml-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>Room {appointment.room}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Reason & Notes */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reason</p>
                      <p className="mt-0.5 text-sm">{appointment.reason ?? <span className="text-muted-foreground/60 italic">Not specified</span>}</p>
                    </div>
                  </div>
                  {appointment.notes && (
                    <div className="ml-6 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                      {appointment.notes}
                    </div>
                  )}
                </div>

                {/* Timestamps */}
                {(appointment.checkedInAt || appointment.checkedOutAt || appointment.cancelledAt) && (
                  <>
                    <Separator />
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      {appointment.checkedInAt && (
                        <div className="flex justify-between">
                          <span>Arrived</span>
                          <span>{new Date(appointment.checkedInAt).toLocaleString()}</span>
                        </div>
                      )}
                      {appointment.checkedOutAt && (
                        <div className="flex justify-between">
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
                        <p className="text-destructive/70">Reason: {appointment.cancellationReason}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions footer */}
            <div className="border-t bg-card p-4 space-y-3">
              {!terminal && inlineAction === null && (
                <div className="space-y-2">
                  {status === "scheduled" && (
                    <Button
                      className="w-full"
                      onClick={() => handleTransition("arrived")}
                      disabled={transition.isPending}
                    >
                      {transition.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Mark Arrived
                    </Button>
                  )}

                  {status === "arrived" && (
                    <Button
                      className="w-full"
                      onClick={() => handleTransition("completed")}
                      disabled={transition.isPending}
                    >
                      {transition.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Complete Visit
                    </Button>
                  )}

                  <div className="flex gap-2">
                    {status === "scheduled" && pastStart && (
                      <Button
                        variant="outline"
                        className="flex-1 text-muted-foreground"
                        onClick={() => handleTransition("no_show")}
                        disabled={transition.isPending}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        No Show
                      </Button>
                    )}
                    {status === "scheduled" && (
                      <Button
                        variant="outline"
                        className="flex-1 text-muted-foreground"
                        onClick={() => setInlineAction("reschedule")}
                        disabled={transition.isPending}
                      >
                        <CalendarX className="mr-2 h-4 w-4" />
                        Reschedule
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="flex-1 text-destructive hover:bg-destructive/10"
                      onClick={openCancel}
                      disabled={transition.isPending}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Inline cancel form */}
              {inlineAction === "cancel" && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Cancel appointment</p>
                  <Textarea
                    placeholder="Reason for cancellation (optional)"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={2}
                    className="resize-none text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setInlineAction(null)}
                      disabled={transition.isPending}
                    >
                      Keep
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleTransition("cancelled", cancelReason || undefined)}
                      disabled={transition.isPending}
                    >
                      {transition.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Confirm Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Inline reschedule confirmation */}
              {inlineAction === "reschedule" && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Mark as rescheduled?</p>
                  <p className="text-xs text-muted-foreground">
                    This appointment will be marked as rescheduled. You can then book a new appointment for {appointment.patient.name}.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setInlineAction(null)}
                      disabled={transition.isPending}
                    >
                      Keep
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleTransition("rescheduled")}
                      disabled={transition.isPending}
                    >
                      {transition.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Confirm
                    </Button>
                  </div>
                </div>
              )}

              <Link
                to="/appointments/$id"
                params={{ id: appointment.id }}
                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={onClose}
              >
                <ExternalLink className="h-3 w-3" />
                View full details
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

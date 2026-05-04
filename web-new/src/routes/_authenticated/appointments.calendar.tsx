import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
  PawPrint,
  Stethoscope,
} from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"
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
import { cn } from "../../lib/utils"

export const Route = createFileRoute("/_authenticated/appointments/calendar")({
  component: AppointmentsCalendarPage,
})

interface Appointment {
  id: string
  startsAt: string
  endsAt: string
  status: string
  reason: string | null
  room: string | null
  patient: { id: string; name: string; species: string }
  owner: { id: string; name: string }
  doctor: { id: string; name: string } | null
}

interface Doctor {
  id: string
  name: string
}

const HOURS = Array.from({ length: 18 - 9 }, (_, i) => i + 9)

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "scheduled", label: STATUS_LABELS.scheduled },
  { value: "arrived", label: STATUS_LABELS.arrived },
  { value: "completed", label: STATUS_LABELS.completed },
  { value: "cancelled", label: STATUS_LABELS.cancelled },
  { value: "no_show", label: STATUS_LABELS.no_show },
  { value: "rescheduled", label: STATUS_LABELS.rescheduled },
]

function getStartOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatTimeLabel(hour: number) {
  const period = hour >= 12 ? "PM" : "AM"
  const h = hour > 12 ? hour - 12 : hour
  return `${h} ${period}`
}

function getCalendarColor(status: string) {
  const normalized = normalizeStatus(status)
  return STATUS_COLORS[normalized]
}

function useWeekAppointments(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6)
  return useQuery({
    queryKey: ["appointments", "calendar", formatDateKey(weekStart)],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set("dateFrom", formatDateKey(weekStart))
      params.set("dateTo", formatDateKey(weekEnd))
      params.set("limit", "500")
      const res = await fetchWithAuth(`/v1/appointments?${params.toString()}`)
      return (res as { data?: Appointment[] }).data ?? []
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

function AppointmentsCalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const today = new Date()
  const weekStart = getStartOfWeek(addDays(today, weekOffset * 7))
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const { data: appointments, isLoading } = useWeekAppointments(weekStart)
  const { data: doctors } = useDoctors()

  const [selectedDoctor, setSelectedDoctor] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filteredAppointments = useMemo(() => {
    let result = appointments ?? []
    if (selectedDoctor !== "all") result = result.filter((a) => a.doctor?.id === selectedDoctor)
    if (selectedStatus !== "all") {
      result = result.filter((a) => normalizeStatus(a.status) === selectedStatus)
    }
    return result
  }, [appointments, selectedDoctor, selectedStatus])

  const appointmentsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {}
    for (const day of weekDays) map[formatDateKey(day)] = []
    for (const appt of filteredAppointments) {
      const key = appt.startsAt.slice(0, 10)
      if (map[key]) map[key].push(appt)
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    }
    return map
  }, [filteredAppointments, weekDays])

  function slotTime(date: Date, hour: number, minute: number) {
    const d = new Date(date)
    d.setHours(hour, minute, 0, 0)
    return d
  }

  function isSlotBooked(day: Date, hour: number, minute: number) {
    const start = slotTime(day, hour, minute)
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + 30)
    const key = formatDateKey(day)
    return appointmentsByDay[key]?.find((appt) => {
      const aStart = new Date(appt.startsAt)
      const aEnd = new Date(appt.endsAt)
      return start < aEnd && end > aStart
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((w) => w - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[200px] text-center text-sm font-medium">
            {weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} –{" "}
            {addDays(weekStart, 6).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((w) => w + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {weekOffset !== 0 && (
            <Button variant="ghost" size="sm" className="h-8" onClick={() => setWeekOffset(0)}>
              Today
            </Button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-8 w-36 text-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="h-8 w-40 text-sm">
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
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <div className="min-w-[700px]">
            {/* Day headers */}
            <div className="grid grid-cols-8 border-b">
              <div className="border-r p-2" />
              {weekDays.map((day) => {
                const isToday = formatDateKey(day) === formatDateKey(today)
                return (
                  <div
                    key={day.toISOString()}
                    className={cn("p-2 text-center", isToday && "bg-primary/5")}
                  >
                    <div className="text-xs text-muted-foreground">
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div
                      className={cn(
                        "mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                        isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                      )}
                    >
                      {day.getDate()}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Time grid */}
            <div className="grid grid-cols-8">
              <div className="border-r">
                {HOURS.map((hour) => (
                  <div key={hour} className="flex h-16 items-start justify-end px-2 pt-1 text-xs text-muted-foreground">
                    {formatTimeLabel(hour)}
                  </div>
                ))}
              </div>

              {weekDays.map((day) => {
                const dayKey = formatDateKey(day)
                const isToday = dayKey === formatDateKey(today)

                return (
                  <div key={day.toISOString()} className={cn("relative border-r last:border-r-0", isToday && "bg-primary/5")}>
                    {HOURS.map((hour) => (
                      <div key={hour} className="h-16 border-b last:border-b-0">
                        {[0, 30].map((minute) => {
                          const booked = isSlotBooked(day, hour, minute)
                          const slotStart = slotTime(day, hour, minute)

                          if (booked) {
                            const isFirstHalf =
                              new Date(booked.startsAt).getTime() === slotStart.getTime()
                            if (!isFirstHalf) return null
                            const durationMinutes =
                              (new Date(booked.endsAt).getTime() - new Date(booked.startsAt).getTime()) / 60000
                            const heightRem = (durationMinutes / 60) * 4
                            const startLabel = new Date(booked.startsAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
                            const endLabel = new Date(booked.endsAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })

                            return (
                              <TooltipProvider key={`${hour}-${minute}`} delayDuration={500}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedId(booked.id)}
                                      className={cn(
                                        "absolute left-0.5 right-0.5 rounded-md border px-1.5 py-1 text-xs text-left transition-all hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ring",
                                        getCalendarColor(booked.status)
                                      )}
                                      style={{
                                        top: `${(hour - 9) * 4 + (minute === 30 ? 2 : 0)}rem`,
                                        height: `${Math.max(heightRem, 1.75)}rem`,
                                      }}
                                    >
                                      <div className="flex items-center gap-1 font-medium truncate leading-tight">
                                        <PawPrint className="h-3 w-3 shrink-0" />
                                        {booked.patient?.name}
                                      </div>
                                      {durationMinutes >= 45 && (
                                        <div className="flex items-center gap-1 truncate opacity-75 leading-tight mt-0.5">
                                          <Stethoscope className="h-3 w-3 shrink-0" />
                                          {booked.doctor?.name ?? "Unassigned"}
                                        </div>
                                      )}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="space-y-1">
                                    <p className="font-medium">{booked.patient?.name} · {booked.owner?.name}</p>
                                    <p className="text-muted-foreground">{startLabel} – {endLabel}</p>
                                    {booked.doctor && <p className="text-muted-foreground">{booked.doctor.name}</p>}
                                    {booked.reason && <p className="text-muted-foreground italic">{booked.reason}</p>}
                                    <p className="capitalize opacity-70">{normalizeStatus(booked.status)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )
                          }

                          return (
                            <Link
                              key={`${hour}-${minute}`}
                              to="/appointments/new"
                              search={{ date: dayKey, time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` }}
                              className="group flex h-8 items-center justify-center hover:bg-accent/60 rounded-sm"
                            >
                              <CalendarPlus className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Status legend */}
      <div className="flex flex-wrap gap-3">
        {(["scheduled", "arrived", "completed", "no_show", "cancelled", "rescheduled"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSelectedStatus(selectedStatus === s ? "all" : s)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-opacity",
              STATUS_COLORS[s],
              selectedStatus !== "all" && selectedStatus !== s && "opacity-40"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_COLORS[s])} />
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <AppointmentDetailSheet
        appointmentId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}

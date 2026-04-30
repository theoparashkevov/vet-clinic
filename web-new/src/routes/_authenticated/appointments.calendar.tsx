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
  doctor: { id: string; name: string } | null
}

interface Doctor {
  id: string
  name: string
}

const HOURS = Array.from({ length: 18 - 9 }, (_, i) => i + 9)

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

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short" })
}

function formatDayNumber(date: Date) {
  return date.getDate()
}

function formatTimeLabel(hour: number) {
  const period = hour >= 12 ? "PM" : "AM"
  const h = hour > 12 ? hour - 12 : hour
  return `${h} ${period}`
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200"
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "scheduled":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200"
    case "no_show":
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-muted text-muted-foreground"
  }
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

  const [selectedDoctor, setSelectedDoctor] = useState<string>("all")

  const filteredAppointments = useMemo(() => {
    if (selectedDoctor === "all") return appointments ?? []
    return (appointments ?? []).filter((a) => a.doctor?.id === selectedDoctor)
  }, [appointments, selectedDoctor])

  const appointmentsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {}
    for (const day of weekDays) {
      map[formatDateKey(day)] = []
    }
    for (const appt of filteredAppointments) {
      const key = appt.startsAt.slice(0, 10)
      if (map[key]) {
        map[key].push(appt)
      }
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[200px] text-center text-sm font-medium">
            {weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} –{" "}
            {addDays(weekStart, 6).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((w) => w + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekOffset(0)}
            className={cn(weekOffset === 0 && "hidden")}
          >
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All doctors</option>
            {doctors?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 border-b">
              <div className="border-r p-3 text-xs font-medium text-muted-foreground"></div>
              {weekDays.map((day) => {
                const isToday = formatDateKey(day) === formatDateKey(today)
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "p-3 text-center",
                      isToday && "bg-primary/5"
                    )}
                  >
                    <div className="text-xs text-muted-foreground">{formatDayLabel(day)}</div>
                    <div
                      className={cn(
                        "mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                        isToday
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground"
                      )}
                    >
                      {formatDayNumber(day)}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-8">
              <div className="border-r">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="flex h-16 items-start justify-end px-2 pt-1 text-xs text-muted-foreground"
                  >
                    {formatTimeLabel(hour)}
                  </div>
                ))}
              </div>

              {weekDays.map((day) => {
                const dayKey = formatDateKey(day)
                const dayAppointments = appointmentsByDay[dayKey] ?? []
                const isToday = dayKey === formatDateKey(today)

                return (
                  <div
                    key={day.toISOString()}
                    className={cn("relative", isToday && "bg-primary/5")}
                  >
                    {HOURS.map((hour) => (
                      <div key={hour} className="h-16 border-b">
                        {[0, 30].map((minute) => {
                          const booked = isSlotBooked(day, hour, minute)
                          const slotStart = slotTime(day, hour, minute)
                          if (booked) {
                            const isFirstHalf =
                              new Date(booked.startsAt).getTime() === slotStart.getTime()
                            if (!isFirstHalf) return null
                            const durationMinutes =
                              (new Date(booked.endsAt).getTime() -
                                new Date(booked.startsAt).getTime()) /
                              60000
                            const spanHours = durationMinutes / 60
                            return (
                              <Link
                                key={`${hour}-${minute}`}
                                to="/appointments/$id"
                                params={{ id: booked.id }}
                                className={cn(
                                  "block rounded-md border px-1.5 py-1 text-xs transition-colors hover:opacity-90",
                                  getStatusColor(booked.status)
                                )}
                                style={{
                                  height: `${spanHours * 8}rem`,
                                  marginTop: minute === 30 ? "4rem" : "0",
                                }}
                              >
                                <div className="flex items-center gap-1 font-medium truncate">
                                  <PawPrint className="h-3 w-3 shrink-0" />
                                  {booked.patient?.name}
                                </div>
                                <div className="flex items-center gap-1 truncate opacity-80">
                                  <Stethoscope className="h-3 w-3 shrink-0" />
                                  {booked.doctor?.name ?? "Unassigned"}
                                </div>
                                {booked.reason && (
                                  <div className="truncate opacity-70">{booked.reason}</div>
                                )}
                              </Link>
                            )
                          }
                          return (
                            <Link
                              key={`${hour}-${minute}`}
                              to="/appointments/new"
                              search={{ date: dayKey, time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` }}
                              className="group flex h-8 items-center justify-center rounded-sm hover:bg-accent"
                              style={{ marginTop: minute === 30 ? "0" : "0" }}
                            >
                              <CalendarPlus className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            </Link>
                          )
                        })}
                      </div>
                    ))}

                    {dayAppointments.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground/50">No appointments</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

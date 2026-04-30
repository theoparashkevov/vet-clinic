import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  CalendarDays,
  Clock,
  PawPrint,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Skeleton } from "../../components/ui/skeleton"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { cn } from "../../lib/utils"

export const Route = createFileRoute("/_authenticated/appointments/new")({
  component: NewAppointmentPage,
})

interface Doctor {
  id: string
  name: string
  email: string
}

interface Patient {
  id: string
  name: string
  species: string
  owner: { id: string; name: string }
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

function useSlots(date: string, doctorId?: string) {
  return useQuery({
    queryKey: ["appointments", "slots", date, doctorId],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set("date", date)
      if (doctorId) params.set("doctorId", doctorId)
      const res = await fetchWithAuth(`/v1/appointments/slots?${params.toString()}`)
      return (res as { slots?: string[] }).slots ?? []
    },
    enabled: !!date,
  })
}

function usePatients(search: string) {
  return useQuery({
    queryKey: ["patients", "search", search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      params.set("limit", "20")
      const res = await fetchWithAuth(`/v1/patients?${params.toString()}`)
      return (res as { data?: Patient[] }).data ?? []
    },
    enabled: search.length >= 2,
  })
}

function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      patientId: string
      ownerId: string
      doctorId?: string
      startsAt: string
      endsAt: string
      reason?: string
    }) => {
      const res = await fetchWithAuth("/v1/appointments", {
        method: "POST",
        body: JSON.stringify(data),
      })
      return res.data as { id: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
    },
  })
}

function formatSlotLabel(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function getSlotEnd(iso: string) {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() + 30)
  return d.toISOString()
}

function NewAppointmentPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: "/_authenticated/appointments/new" }) as {
    date?: string
    time?: string
    doctorId?: string
  }

  const [step, setStep] = useState(1)
  const [doctorId, setDoctorId] = useState(search.doctorId ?? "")
  const [date, setDate] = useState(search.date ?? "")
  const [slot, setSlot] = useState("")
  const [patientId, setPatientId] = useState("")
  const [reason, setReason] = useState("")
  const [patientSearch, setPatientSearch] = useState("")

  const { data: doctors, isLoading: doctorsLoading } = useDoctors()
  const { data: slots, isLoading: slotsLoading } = useSlots(date, doctorId || undefined)
  const { data: patients, isLoading: patientsLoading } = usePatients(patientSearch)
  const createMutation = useCreateAppointment()

  const selectedDoctor = doctors?.find((d) => d.id === doctorId)
  const selectedPatient = patients?.find((p) => p.id === patientId)

  function handleNext() {
    if (step < 3) setStep(step + 1)
  }

  function handleBack() {
    if (step > 1) setStep(step - 1)
  }

  async function handleSubmit() {
    if (!selectedPatient || !slot) return
    const startsAt = slot
    const endsAt = getSlotEnd(slot)
    const result = await createMutation.mutateAsync({
      patientId: selectedPatient.id,
      ownerId: selectedPatient.owner.id,
      doctorId: doctorId || undefined,
      startsAt,
      endsAt,
      reason: reason || undefined,
    })
    navigate({ to: `/appointments/${result.id}` })
  }

  const stepLabels = ["Select Doctor", "Choose Date & Time", "Patient & Reason"]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/appointments" })}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Book Appointment</h2>
        <p className="text-muted-foreground">Follow the steps to schedule a new appointment.</p>
      </div>

      <div className="flex items-center gap-2">
        {stepLabels.map((label, i) => {
          const s = i + 1
          const isActive = s === step
          const isDone = s < step
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
              {s < stepLabels.length && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          )
        })}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Select a Doctor</h3>
          {doctorsLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Card
                className={cn(
                  "cursor-pointer transition-colors hover:bg-accent",
                  doctorId === "" && "border-primary ring-1 ring-primary"
                )}
                onClick={() => setDoctorId("")}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Stethoscope className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Any doctor</p>
                    <p className="text-xs text-muted-foreground">No preference</p>
                  </div>
                </CardContent>
              </Card>
              {doctors?.map((doctor) => (
                <Card
                  key={doctor.id}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-accent",
                    doctorId === doctor.id && "border-primary ring-1 ring-primary"
                  )}
                  onClick={() => setDoctorId(doctor.id)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{doctor.name}</p>
                      <p className="text-xs text-muted-foreground">{doctor.email}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Choose Date & Time</h3>
          {selectedDoctor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Stethoscope className="h-4 w-4" />
              Doctor: <strong className="text-foreground">{selectedDoctor.name}</strong>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
                setSlot("")
              }}
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>

          {date && slotsLoading ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : date && slots && slots.length > 0 ? (
            <div className="space-y-2">
              <Label>Available Slots</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      slot === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-card hover:bg-accent"
                    )}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {formatSlotLabel(s)}
                  </button>
                ))}
              </div>
            </div>
          ) : date ? (
            <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
              <CalendarDays className="mx-auto h-8 w-8 opacity-50" />
              <p className="mt-2">No available slots for this date.</p>
              <p className="text-xs">Try selecting a different date or doctor.</p>
            </div>
          ) : null}

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleNext} disabled={!slot}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Patient & Reason</h3>
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>{date}</span>
              <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
              <span>{slot ? formatSlotLabel(slot) : ""}</span>
            </div>
            {selectedDoctor && (
              <div className="mt-1 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <span>{selectedDoctor.name}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="patient-search">Search Patient</Label>
            <Input
              id="patient-search"
              placeholder="Type at least 2 characters..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
            />
            {patientsLoading && (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            {patientSearch.length >= 2 && patients && patients.length > 0 && (
              <div className="space-y-1">
                {patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPatientId(p.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      patientId === p.id
                        ? "border-primary bg-primary/5"
                        : "border-input bg-card hover:bg-accent"
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <PawPrint className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.species} · Owner: {p.owner.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {patientSearch.length >= 2 && patients && patients.length === 0 && !patientsLoading && (
              <p className="text-sm text-muted-foreground">No patients found.</p>
            )}
          </div>

          {selectedPatient && (
            <Badge variant="secondary" className="w-fit">
              Selected: {selectedPatient.name} ({selectedPatient.species})
            </Badge>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for visit</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Annual checkup, vaccination, follow-up..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedPatient || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Book Appointment
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

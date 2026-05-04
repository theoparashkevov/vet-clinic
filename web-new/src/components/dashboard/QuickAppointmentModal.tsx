import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
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
import { toast } from "sonner"
import { fetchWithAuth } from "../../lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Skeleton } from "../ui/skeleton"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"

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

interface Props {
  open: boolean
  onClose: () => void
  prefilledDate?: string
  prefilledSlot?: string
  prefilledDoctorId?: string
}

function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async (): Promise<Doctor[]> => {
      const res = await fetchWithAuth("/v1/doctors")
      return (res as { data?: Doctor[] }).data ?? []
    },
  })
}

function useSlots(date: string, doctorId?: string) {
  return useQuery({
    queryKey: ["appointments", "slots", date, doctorId],
    queryFn: async (): Promise<string[]> => {
      const params = new URLSearchParams({ date })
      if (doctorId) params.set("doctorId", doctorId)
      const res = await fetchWithAuth(`/v1/appointments/slots?${params}`)
      return (res as { slots?: string[] }).slots ?? []
    },
    enabled: !!date,
  })
}

function usePatientSearch(search: string) {
  return useQuery({
    queryKey: ["patients", "search", search],
    queryFn: async (): Promise<Patient[]> => {
      const params = new URLSearchParams({ search, limit: "20" })
      const res = await fetchWithAuth(`/v1/patients?${params}`)
      return (res as { data?: Patient[] }).data ?? []
    },
    enabled: search.length >= 2,
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function slotEnd(iso: string) {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() + 30)
  return d.toISOString()
}

const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
  }),
}

export function QuickAppointmentModal({
  open,
  onClose,
  prefilledDate,
  prefilledSlot,
  prefilledDoctorId,
}: Props) {
  const queryClient = useQueryClient()
  const today = new Date().toISOString().slice(0, 10)

  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [doctorId, setDoctorId] = useState(prefilledDoctorId ?? "")
  const [date, setDate] = useState(prefilledDate ?? today)
  const [slot, setSlot] = useState(prefilledSlot ?? "")
  const [patientId, setPatientId] = useState("")
  const [reason, setReason] = useState("")
  const [patientSearch, setPatientSearch] = useState("")

  useEffect(() => {
    if (open) {
      setStep(1)
      setDirection(1)
      setDoctorId(prefilledDoctorId ?? "")
      setDate(prefilledDate ?? today)
      setSlot(prefilledSlot ?? "")
      setPatientId("")
      setReason("")
      setPatientSearch("")
    }
  }, [open, prefilledDate, prefilledSlot, prefilledDoctorId, today])

  const { data: doctors, isLoading: doctorsLoading } = useDoctors()
  const { data: slots, isLoading: slotsLoading } = useSlots(date, doctorId || undefined)
  const { data: patients, isLoading: patientsLoading } = usePatientSearch(patientSearch)

  const selectedDoctor = doctors?.find((d) => d.id === doctorId)
  const selectedPatient = patients?.find((p) => p.id === patientId)

  const createMutation = useMutation({
    mutationFn: async () => {
      return fetchWithAuth("/v1/appointments", {
        method: "POST",
        body: JSON.stringify({
          patientId: selectedPatient!.id,
          ownerId: selectedPatient!.owner.id,
          doctorId: doctorId || undefined,
          startsAt: slot,
          endsAt: slotEnd(slot),
          reason: reason || undefined,
        }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast.success("Appointment booked successfully!")
      onClose()
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to book appointment.")
    },
  })

  function goNext() {
    setDirection(1)
    setStep((s) => s + 1)
  }

  function goBack() {
    setDirection(-1)
    setStep((s) => s - 1)
  }

  const stepLabels = ["Doctor", "Date & Time", "Patient"]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            New Appointment
          </DialogTitle>
          <DialogDescription>Quick booking for walk-in patients</DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-1.5">
          {stepLabels.map((label, i) => {
            const s = i + 1
            const isActive = s === step
            const isDone = s < step
            return (
              <div key={label} className="flex items-center gap-1.5">
                <motion.div
                  animate={{
                    backgroundColor: isDone
                      ? "hsl(var(--primary) / 0.2)"
                      : isActive
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted))",
                  }}
                  transition={{ duration: 0.25 }}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    color: isDone
                      ? "hsl(var(--primary))"
                      : isActive
                      ? "hsl(var(--primary-foreground))"
                      : "hsl(var(--muted-foreground))",
                  }}
                >
                  {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : s}
                </motion.div>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:inline",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
                {s < stepLabels.length && (
                  <div className="mx-1 h-px w-6 flex-shrink-0 bg-border" />
                )}
              </div>
            )
          })}
        </div>

        {/* Step content */}
        <div className="relative min-h-[280px] overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="space-y-3"
              >
                <p className="text-sm font-medium text-foreground">Select a doctor</p>
                {doctorsLoading ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Card
                      className={cn(
                        "cursor-pointer transition-all hover:bg-accent hover:shadow-sm",
                        doctorId === "" && "border-primary ring-1 ring-primary"
                      )}
                      onClick={() => setDoctorId("")}
                    >
                      <CardContent className="flex items-center gap-3 p-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Any doctor</p>
                          <p className="text-xs text-muted-foreground">No preference</p>
                        </div>
                      </CardContent>
                    </Card>
                    {doctors?.map((doctor) => (
                      <Card
                        key={doctor.id}
                        className={cn(
                          "cursor-pointer transition-all hover:bg-accent hover:shadow-sm",
                          doctorId === doctor.id && "border-primary ring-1 ring-primary"
                        )}
                        onClick={() => setDoctorId(doctor.id)}
                      >
                        <CardContent className="flex items-center gap-3 p-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Stethoscope className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{doctor.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{doctor.email}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                <div className="flex justify-end pt-1">
                  <Button size="sm" onClick={goNext}>
                    Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="space-y-4"
              >
                {selectedDoctor && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Stethoscope className="h-3.5 w-3.5" />
                    <span className="font-medium text-foreground">{selectedDoctor.name}</span>
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="appt-date" className="text-sm">Date</Label>
                  <Input
                    id="appt-date"
                    type="date"
                    value={date}
                    min={today}
                    onChange={(e) => {
                      setDate(e.target.value)
                      setSlot("")
                    }}
                    className="h-9"
                  />
                </div>

                {date && slotsLoading ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-9 w-full" />
                    ))}
                  </div>
                ) : date && slots && slots.length > 0 ? (
                  <div className="space-y-1.5">
                    <Label className="text-sm">Available slots</Label>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {slots.map((s) => (
                        <motion.button
                          key={s}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSlot(s)}
                          className={cn(
                            "flex items-center justify-center gap-1 rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                            slot === s
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input bg-card hover:bg-accent"
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          {formatTime(s)}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : date ? (
                  <div className="rounded-lg border bg-muted/40 p-5 text-center text-sm text-muted-foreground">
                    <CalendarDays className="mx-auto h-7 w-7 opacity-40" />
                    <p className="mt-1.5">No slots available for this date.</p>
                    <p className="text-xs">Try a different date or doctor.</p>
                  </div>
                ) : null}

                <div className="flex justify-between pt-1">
                  <Button size="sm" variant="outline" onClick={goBack}>
                    <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Back
                  </Button>
                  <Button size="sm" onClick={goNext} disabled={!slot}>
                    Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="space-y-4"
              >
                {/* Summary pill */}
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" /> {date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {slot ? formatTime(slot) : ""}
                  </span>
                  {selectedDoctor && (
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-3.5 w-3.5" /> {selectedDoctor.name}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="patient-search-modal" className="text-sm">Search patient</Label>
                  <Input
                    id="patient-search-modal"
                    placeholder="Type at least 2 characters…"
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value)
                      if (patientId) setPatientId("")
                    }}
                    className="h-9"
                    autoFocus
                  />

                  {patientsLoading && (
                    <div className="space-y-1.5">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  )}

                  {patientSearch.length >= 2 && !patientsLoading && patients && patients.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-h-40 space-y-1 overflow-y-auto"
                    >
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
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <PawPrint className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{p.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {p.species} · {p.owner.name}
                            </p>
                          </div>
                          {patientId === p.id && (
                            <CheckCircle2 className="ml-auto h-4 w-4 flex-shrink-0 text-primary" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {patientSearch.length >= 2 && !patientsLoading && patients?.length === 0 && (
                    <p className="text-xs text-muted-foreground">No patients found.</p>
                  )}

                  {selectedPatient && (
                    <Badge variant="secondary" className="mt-1">
                      <PawPrint className="mr-1 h-3 w-3" />
                      {selectedPatient.name} ({selectedPatient.species})
                    </Badge>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="appt-reason" className="text-sm">Reason for visit</Label>
                  <Textarea
                    id="appt-reason"
                    rows={2}
                    placeholder="e.g. Annual checkup, vaccination, follow-up…"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="resize-none"
                  />
                </div>

                <div className="flex justify-between pt-1">
                  <Button size="sm" variant="outline" onClick={goBack}>
                    <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => createMutation.mutate()}
                    disabled={!selectedPatient || createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Booking…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Book Appointment
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

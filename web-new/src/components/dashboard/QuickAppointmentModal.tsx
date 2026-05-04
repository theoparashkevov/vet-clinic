import { useState, useEffect, useRef } from "react"
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
  Search,
  UserPlus,
  Users,
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface Doctor {
  id: string
  name: string
  email: string
}

interface Patient {
  id: string
  name: string
  species: string
  breed?: string | null
  owner: { id: string; name: string; phone?: string }
}

interface Props {
  open: boolean
  onClose: () => void
  prefilledDate?: string
  prefilledSlot?: string
  prefilledDoctorId?: string
}

const SPECIES = ["Dog", "Cat", "Rabbit", "Bird", "Hamster", "Guinea Pig", "Reptile", "Other"]

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async (): Promise<Doctor[]> => {
      const res = await fetchWithAuth("/v1/doctors")
      return Array.isArray(res) ? res : []
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
}

// ─── Step 3: Patient panel ────────────────────────────────────────────────────

interface PatientPanelProps {
  reason: string
  onReasonChange: (v: string) => void
  onPatientReady: (patientId: string, ownerId: string) => void
  isPending: boolean
}

function PatientPanel({ reason, onReasonChange, onPatientReady, isPending }: PatientPanelProps) {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<"search" | "new">("search")

  // ── Search mode ──────────────────────────────────────────────────────────
  const [searchText, setSearchText] = useState("")
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

  const { data: patients, isLoading: searchLoading } = usePatientSearch(searchText)
  const selectedPatient = patients?.find((p) => p.id === selectedPatientId)

  // ── New patient mode ─────────────────────────────────────────────────────
  const [ownerMode, setOwnerMode] = useState<"search" | "new">("new")

  // New owner fields
  const [ownerName, setOwnerName] = useState("")
  const [ownerPhone, setOwnerPhone] = useState("")

  // Existing owner search
  const [ownerSearch, setOwnerSearch] = useState("")
  const [selectedOwnerId, setSelectedOwnerId] = useState("")
  const [selectedOwnerName, setSelectedOwnerName] = useState("")
  const { data: ownerResults, isLoading: ownersLoading } = useQuery({
    queryKey: ["owners", "search", ownerSearch],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/owners?search=${encodeURIComponent(ownerSearch)}&limit=8`)
      return (res as { data?: { id: string; name: string; phone: string }[] }).data ?? []
    },
    enabled: ownerSearch.length >= 2,
  })

  // New patient fields
  const [patientName, setPatientName] = useState("")
  const [species, setSpecies] = useState("")
  const [breed, setBreed] = useState("")

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Create owner + patient mutations
  const createOwner = useMutation({
    mutationFn: (data: { name: string; phone: string }) =>
      fetchWithAuth("/v1/owners", { method: "POST", body: JSON.stringify(data) }),
  })
  const createPatient = useMutation({
    mutationFn: (data: { ownerId: string; name: string; species: string; breed?: string }) => {
      const payload: Record<string, unknown> = { ownerId: data.ownerId, name: data.name, species: data.species }
      if (data.breed) payload.breed = data.breed
      return fetchWithAuth("/v1/patients", { method: "POST", body: JSON.stringify(payload) })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  })

  function switchMode(m: "search" | "new") {
    setMode(m)
    setSelectedPatientId("")
    setSearchText("")
    setErrors({})
  }

  async function handleBook() {
    if (mode === "search") {
      if (!selectedPatient) {
        setErrors({ patient: "Select a patient to continue" })
        return
      }
      onPatientReady(selectedPatient.id, selectedPatient.owner.id)
      return
    }

    // New patient mode — validate
    const errs: Record<string, string> = {}
    if (!patientName.trim()) errs.patientName = "Patient name is required"
    if (!species) errs.species = "Species is required"
    if (ownerMode === "new") {
      if (!ownerName.trim()) errs.ownerName = "Owner name is required"
      if (!ownerPhone.trim()) errs.ownerPhone = "Phone number is required"
    } else {
      if (!selectedOwnerId) errs.owner = "Select an owner to continue"
    }
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    try {
      let ownerId = selectedOwnerId
      if (ownerMode === "new") {
        const ownerRes = await createOwner.mutateAsync({ name: ownerName.trim(), phone: ownerPhone.trim() })
        ownerId = (ownerRes as { data: { id: string } }).data.id
      }
      const patientRes = await createPatient.mutateAsync({
        ownerId,
        name: patientName.trim(),
        species,
        breed: breed.trim() || undefined,
      })
      const newPatientId = (patientRes as { data: { id: string } }).data.id
      onPatientReady(newPatientId, ownerId)
    } catch {
      // errors handled by the outer mutation's onError
    }
  }

  const busy = isPending || createOwner.isPending || createPatient.isPending

  useEffect(() => {
    if (mode === "search") {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [mode])

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex rounded-lg border p-1 gap-1">
        <button
          onClick={() => switchMode("search")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "search"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Search className="h-3.5 w-3.5" />
          Find Patient
        </button>
        <button
          onClick={() => switchMode("new")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "new"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <UserPlus className="h-3.5 w-3.5" />
          New Patient
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === "search" ? (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                placeholder="Search by patient or owner name…"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value)
                  if (selectedPatientId) setSelectedPatientId("")
                }}
                className="h-9 pl-9"
              />
            </div>

            {searchLoading && (
              <div className="space-y-1.5">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            )}

            {!searchLoading && searchText.length >= 2 && patients && patients.length > 0 && (
              <div className="max-h-44 space-y-1 overflow-y-auto">
                {patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      selectedPatientId === p.id
                        ? "border-primary bg-primary/5"
                        : "border-input bg-card hover:bg-accent"
                    )}
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <PawPrint className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.species}{p.breed ? ` · ${p.breed}` : ""} — {p.owner.name}
                      </p>
                    </div>
                    {selectedPatientId === p.id && (
                      <CheckCircle2 className="ml-auto h-4 w-4 flex-shrink-0 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {!searchLoading && searchText.length >= 2 && patients?.length === 0 && (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                <PawPrint className="mx-auto mb-1.5 h-6 w-6 opacity-30" />
                <p>No patients found.</p>
                <button
                  onClick={() => switchMode("new")}
                  className="mt-1.5 text-xs text-primary underline-offset-2 hover:underline"
                >
                  Register as new patient →
                </button>
              </div>
            )}

            {searchText.length < 2 && (
              <p className="text-center text-xs text-muted-foreground">
                Type at least 2 characters to search
              </p>
            )}

            {errors.patient && <p className="text-xs text-destructive">{errors.patient}</p>}

            {selectedPatient && (
              <Badge variant="secondary">
                <PawPrint className="mr-1 h-3 w-3" />
                {selectedPatient.name} ({selectedPatient.species}) — {selectedPatient.owner.name}
              </Badge>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="new"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {/* Owner section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Owner
                </Label>
                <div className="flex rounded-md border text-xs">
                  <button
                    onClick={() => { setOwnerMode("new"); setSelectedOwnerId(""); setSelectedOwnerName(""); setOwnerSearch("") }}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 transition-colors rounded-l-sm",
                      ownerMode === "new" ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <UserPlus className="h-3 w-3" /> New
                  </button>
                  <button
                    onClick={() => { setOwnerMode("search"); setOwnerName(""); setOwnerPhone("") }}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 transition-colors rounded-r-sm border-l",
                      ownerMode === "search" ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Users className="h-3 w-3" /> Existing
                  </button>
                </div>
              </div>

              {ownerMode === "new" ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="owner-name" className="text-xs">Full name *</Label>
                    <Input
                      id="owner-name"
                      placeholder="e.g. John Smith"
                      value={ownerName}
                      onChange={(e) => { setOwnerName(e.target.value); setErrors((p) => { const n = {...p}; delete n.ownerName; return n }) }}
                      className={cn("h-8 text-sm", errors.ownerName && "border-destructive")}
                    />
                    {errors.ownerName && <p className="text-xs text-destructive">{errors.ownerName}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="owner-phone" className="text-xs">Phone *</Label>
                    <Input
                      id="owner-phone"
                      placeholder="+1 555 000 0000"
                      value={ownerPhone}
                      onChange={(e) => { setOwnerPhone(e.target.value); setErrors((p) => { const n = {...p}; delete n.ownerPhone; return n }) }}
                      className={cn("h-8 text-sm", errors.ownerPhone && "border-destructive")}
                    />
                    {errors.ownerPhone && <p className="text-xs text-destructive">{errors.ownerPhone}</p>}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search existing owner…"
                      value={selectedOwnerName || ownerSearch}
                      onChange={(e) => {
                        setOwnerSearch(e.target.value)
                        setSelectedOwnerId("")
                        setSelectedOwnerName("")
                      }}
                      className={cn("h-8 pl-9 text-sm", errors.owner && "border-destructive")}
                    />
                  </div>
                  {ownersLoading && <Skeleton className="h-8 w-full" />}
                  {!ownersLoading && ownerSearch.length >= 2 && !selectedOwnerId && ownerResults && ownerResults.length > 0 && (
                    <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
                      {ownerResults.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => { setSelectedOwnerId(o.id); setSelectedOwnerName(o.name); setOwnerSearch(""); setErrors((p) => { const n = {...p}; delete n.owner; return n }) }}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-accent"
                        >
                          <Users className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                          <span className="font-medium">{o.name}</span>
                          <span className="text-muted-foreground">{o.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.owner && <p className="text-xs text-destructive">{errors.owner}</p>}
                </div>
              )}
            </div>

            {/* Patient fields */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Patient
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="patient-name" className="text-xs">Name *</Label>
                  <Input
                    id="patient-name"
                    placeholder="e.g. Rex"
                    value={patientName}
                    onChange={(e) => { setPatientName(e.target.value); setErrors((p) => { const n = {...p}; delete n.patientName; return n }) }}
                    className={cn("h-8 text-sm", errors.patientName && "border-destructive")}
                  />
                  {errors.patientName && <p className="text-xs text-destructive">{errors.patientName}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="species" className="text-xs">Species *</Label>
                  <select
                    id="species"
                    value={species}
                    onChange={(e) => { setSpecies(e.target.value); setErrors((p) => { const n = {...p}; delete n.species; return n }) }}
                    className={cn(
                      "flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      errors.species && "border-destructive"
                    )}
                  >
                    <option value="">Select…</option>
                    {SPECIES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.species && <p className="text-xs text-destructive">{errors.species}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="breed" className="text-xs">Breed <span className="text-muted-foreground">(optional)</span></Label>
                <Input
                  id="breed"
                  placeholder="e.g. Golden Retriever"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {(createOwner.isError || createPatient.isError) && (
              <p className="text-xs text-destructive">
                {(createOwner.error || createPatient.error)?.message}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reason — shared between both modes */}
      <div className="space-y-1.5">
        <Label htmlFor="appt-reason" className="text-sm">Reason for visit</Label>
        <Textarea
          id="appt-reason"
          rows={2}
          placeholder="e.g. Annual checkup, vaccination, follow-up…"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          className="resize-none"
        />
      </div>

      <Button
        className="w-full"
        onClick={handleBook}
        disabled={busy}
      >
        {busy ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {createOwner.isPending ? "Creating owner…" : createPatient.isPending ? "Creating patient…" : "Booking…"}</>
        ) : (
          <><CheckCircle2 className="mr-2 h-4 w-4" /> Book Appointment</>
        )}
      </Button>
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

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
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (open) {
      setStep(1)
      setDirection(1)
      setDoctorId(prefilledDoctorId ?? "")
      setDate(prefilledDate ?? today)
      setSlot(prefilledSlot ?? "")
      setReason("")
    }
  }, [open, prefilledDate, prefilledSlot, prefilledDoctorId, today])

  const { data: doctors, isLoading: doctorsLoading } = useDoctors()
  const { data: slots, isLoading: slotsLoading } = useSlots(date, doctorId || undefined)
  const selectedDoctor = doctors?.find((d) => d.id === doctorId)

  const createAppointment = useMutation({
    mutationFn: async (args: { patientId: string; ownerId: string }) => {
      return fetchWithAuth("/v1/appointments", {
        method: "POST",
        body: JSON.stringify({
          patientId: args.patientId,
          ownerId: args.ownerId,
          doctorId: doctorId || undefined,
          startsAt: slot,
          endsAt: slotEnd(slot),
          reason: reason || undefined,
        }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast.success("Appointment booked!")
      onClose()
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to book appointment.")
    },
  })

  function goNext() { setDirection(1); setStep((s) => s + 1) }
  function goBack() { setDirection(-1); setStep((s) => s - 1) }

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
                <span className={cn("hidden text-xs font-medium sm:inline", isActive ? "text-foreground" : "text-muted-foreground")}>
                  {label}
                </span>
                {s < stepLabels.length && <div className="mx-1 h-px w-6 flex-shrink-0 bg-border" />}
              </div>
            )
          })}
        </div>

        {/* Step content */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>

            {/* Step 1 – Doctor */}
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
                <p className="text-sm font-medium">Select a doctor</p>
                {doctorsLoading ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Card
                      className={cn("cursor-pointer transition-all hover:bg-accent hover:shadow-sm", doctorId === "" && "border-primary ring-1 ring-primary")}
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
                        className={cn("cursor-pointer transition-all hover:bg-accent hover:shadow-sm", doctorId === doctor.id && "border-primary ring-1 ring-primary")}
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

            {/* Step 2 – Date & Time */}
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
                    onChange={(e) => { setDate(e.target.value); setSlot("") }}
                    className="h-9"
                  />
                </div>

                {date && slotsLoading ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
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
                            slot === s ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card hover:bg-accent"
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

            {/* Step 3 – Patient */}
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
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {slot ? formatTime(slot) : ""}</span>
                  {selectedDoctor && <span className="flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" /> {selectedDoctor.name}</span>}
                </div>

                <PatientPanel
                  reason={reason}
                  onReasonChange={setReason}
                  onPatientReady={(patientId, ownerId) => createAppointment.mutate({ patientId, ownerId })}
                  isPending={createAppointment.isPending}
                />

                <Button size="sm" variant="ghost" className="-mt-2" onClick={goBack}>
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Back
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { useState, useEffect, useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { X, PawPrint, UserPlus, Users } from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Separator } from "../../components/ui/separator"
import { OwnerSearch } from "./OwnerSearch"
import { cn } from "../../lib/utils"
import type { Patient, CreatePatientInput, UpdatePatientInput } from "./types"

interface PatientFormModalProps {
  patient?: Patient | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const SPECIES_OPTIONS = ["Dog", "Cat", "Rabbit", "Bird", "Hamster", "Guinea Pig", "Reptile", "Other"]
const SEX_OPTIONS = ["Male", "Female", "Unknown"]
const STATUS_OPTIONS = ["active", "inactive", "deceased"]

export function PatientFormModal({ patient, open, onClose, onSuccess }: PatientFormModalProps) {
  const queryClient = useQueryClient()
  const isEditing = !!patient

  // Owner mode — only relevant when creating
  const [ownerMode, setOwnerMode] = useState<"existing" | "new">("existing")
  const [newOwnerName, setNewOwnerName] = useState("")
  const [newOwnerPhone, setNewOwnerPhone] = useState("")

  const [form, setForm] = useState<CreatePatientInput>({
    ownerId: "", name: "", species: "", breed: "", birthdate: "",
    sex: "", isNeutered: false, color: "", microchipId: "",
    status: "active", notes: "", allergies: "", chronicConditions: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (patient) {
      setOwnerMode("existing")
      setForm({
        ownerId: patient.ownerId,
        name: patient.name,
        species: patient.species,
        breed: patient.breed ?? "",
        birthdate: patient.birthdate ? patient.birthdate.slice(0, 10) : "",
        sex: patient.sex ?? "",
        isNeutered: patient.isNeutered ?? false,
        color: patient.color ?? "",
        microchipId: patient.microchipId ?? "",
        status: patient.status,
        notes: patient.notes ?? "",
        allergies: patient.allergies ?? "",
        chronicConditions: patient.chronicConditions ?? "",
      })
    } else {
      setOwnerMode("existing")
      setNewOwnerName("")
      setNewOwnerPhone("")
      setForm({
        ownerId: "", name: "", species: "", breed: "", birthdate: "",
        sex: "", isNeutered: false, color: "", microchipId: "",
        status: "active", notes: "", allergies: "", chronicConditions: "",
      })
    }
    setErrors({})
  }, [patient, open])

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Name is required"
    if (!form.species) errs.species = "Species is required"
    if (isEditing || ownerMode === "existing") {
      if (!form.ownerId) errs.ownerId = "Owner is required"
    } else {
      if (!newOwnerName.trim()) errs.newOwnerName = "Owner name is required"
      if (!newOwnerPhone.trim()) errs.newOwnerPhone = "Phone is required"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [form, isEditing, ownerMode, newOwnerName, newOwnerPhone])

  const createOwnerMutation = useMutation({
    mutationFn: (data: { name: string; phone: string }) =>
      fetchWithAuth("/v1/owners", { method: "POST", body: JSON.stringify(data) }),
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreatePatientInput) => {
      const payload = { ...data }
      const optionals = ["breed","birthdate","sex","color","microchipId","notes","allergies","chronicConditions"] as const
      optionals.forEach((k) => { if (!payload[k]) delete (payload as Record<string, unknown>)[k] })
      return fetchWithAuth("/v1/patients", { method: "POST", body: JSON.stringify(payload) })
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["patients"] }); onSuccess(); onClose() },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: UpdatePatientInput) => {
      const payload = { ...data }
      Object.keys(payload).forEach((k) => {
        if ((payload as Record<string, unknown>)[k] === "") delete (payload as Record<string, unknown>)[k]
      })
      return fetchWithAuth(`/v1/patients/${patient!.id}`, { method: "PUT", body: JSON.stringify(payload) })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
      queryClient.invalidateQueries({ queryKey: ["patients", patient!.id] })
      onSuccess(); onClose()
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending || createOwnerMutation.isPending

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    if (isEditing) {
      updateMutation.mutate(form)
      return
    }

    let ownerId = form.ownerId
    if (ownerMode === "new") {
      const res = await createOwnerMutation.mutateAsync({ name: newOwnerName.trim(), phone: newOwnerPhone.trim() })
      ownerId = (res as { data: { id: string } }).data.id
    }
    createMutation.mutate({ ...form, ownerId })
  }, [form, isEditing, ownerMode, newOwnerName, newOwnerPhone, validate, createOwnerMutation, createMutation, updateMutation])

  const updateField = useCallback(<K extends keyof CreatePatientInput>(field: K, value: CreatePatientInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next })
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <Card className="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PawPrint className="h-5 w-5 text-primary" />
            {isEditing ? "Edit Patient" : "New Patient"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Owner section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Owner</Label>
                {!isEditing && (
                  <div className="flex rounded-md border text-xs">
                    <button
                      type="button"
                      onClick={() => { setOwnerMode("existing"); setNewOwnerName(""); setNewOwnerPhone("") }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-l-sm transition-colors",
                        ownerMode === "existing" ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Users className="h-3 w-3" /> Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => { setOwnerMode("new"); setForm((p) => ({ ...p, ownerId: "" })) }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-r-sm border-l transition-colors",
                        ownerMode === "new" ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <UserPlus className="h-3 w-3" /> New
                    </button>
                  </div>
                )}
              </div>

              {isEditing || ownerMode === "existing" ? (
                <>
                  <OwnerSearch
                    value={form.ownerId}
                    onChange={(ownerId) => updateField("ownerId", ownerId)}
                    disabled={isPending}
                  />
                  {errors.ownerId && <p className="text-xs text-destructive">{errors.ownerId}</p>}
                </>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-owner-name" className="text-sm">Full name *</Label>
                    <Input
                      id="new-owner-name"
                      placeholder="e.g. John Smith"
                      value={newOwnerName}
                      onChange={(e) => { setNewOwnerName(e.target.value); setErrors((p) => { const n = {...p}; delete n.newOwnerName; return n }) }}
                      className={cn(errors.newOwnerName && "border-destructive")}
                      disabled={isPending}
                    />
                    {errors.newOwnerName && <p className="text-xs text-destructive">{errors.newOwnerName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="new-owner-phone" className="text-sm">Phone *</Label>
                    <Input
                      id="new-owner-phone"
                      placeholder="+1 555 000 0000"
                      value={newOwnerPhone}
                      onChange={(e) => { setNewOwnerPhone(e.target.value); setErrors((p) => { const n = {...p}; delete n.newOwnerPhone; return n }) }}
                      className={cn(errors.newOwnerPhone && "border-destructive")}
                      disabled={isPending}
                    />
                    {errors.newOwnerPhone && <p className="text-xs text-destructive">{errors.newOwnerPhone}</p>}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Patient fields */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Patient</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} disabled={isPending} className={cn(errors.name && "border-destructive")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="species">Species *</Label>
                  <select id="species" value={form.species} onChange={(e) => updateField("species", e.target.value)} disabled={isPending}
                    className={cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50", errors.species && "border-destructive")}>
                    <option value="">Select species</option>
                    {SPECIES_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.species && <p className="text-xs text-destructive">{errors.species}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input id="breed" value={form.breed} onChange={(e) => updateField("breed", e.target.value)} disabled={isPending} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Birth Date</Label>
                  <Input id="birthdate" type="date" value={form.birthdate} onChange={(e) => updateField("birthdate", e.target.value)} disabled={isPending} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">Sex</Label>
                  <select id="sex" value={form.sex} onChange={(e) => updateField("sex", e.target.value)} disabled={isPending}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50">
                    <option value="">Select sex</option>
                    {SEX_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" value={form.color} onChange={(e) => updateField("color", e.target.value)} disabled={isPending} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="microchipId">Microchip ID</Label>
                  <Input id="microchipId" value={form.microchipId} onChange={(e) => updateField("microchipId", e.target.value)} disabled={isPending} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select id="status" value={form.status} onChange={(e) => updateField("status", e.target.value)} disabled={isPending}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50">
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input id="isNeutered" type="checkbox" checked={form.isNeutered} onChange={(e) => updateField("isNeutered", e.target.checked)} disabled={isPending} className="h-4 w-4 rounded border-border" />
                <Label htmlFor="isNeutered" className="font-normal">Neutered / Spayed</Label>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input id="allergies" value={form.allergies} onChange={(e) => updateField("allergies", e.target.value)} placeholder="e.g. Penicillin, Chicken" disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                <Input id="chronicConditions" value={form.chronicConditions} onChange={(e) => updateField("chronicConditions", e.target.value)} placeholder="e.g. Asthma, Hip dysplasia" disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea id="notes" value={form.notes} onChange={(e) => updateField("notes", e.target.value)} rows={3} disabled={isPending}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50" />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : isEditing ? "Save Changes" : "Create Patient"}
              </Button>
            </div>

            {(createMutation.isError || updateMutation.isError || createOwnerMutation.isError) && (
              <p className="text-sm text-destructive text-right">
                {(createMutation.error || updateMutation.error || createOwnerMutation.error)?.message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

import { useState, useEffect, useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { X, PawPrint } from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Separator } from "../../components/ui/separator"
import { OwnerSearch } from "./OwnerSearch"
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

  const [form, setForm] = useState<CreatePatientInput>({
    ownerId: "",
    name: "",
    species: "",
    breed: "",
    birthdate: "",
    sex: "",
    isNeutered: false,
    color: "",
    microchipId: "",
    status: "active",
    notes: "",
    allergies: "",
    chronicConditions: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (patient) {
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
      setForm({
        ownerId: "",
        name: "",
        species: "",
        breed: "",
        birthdate: "",
        sex: "",
        isNeutered: false,
        color: "",
        microchipId: "",
        status: "active",
        notes: "",
        allergies: "",
        chronicConditions: "",
      })
    }
    setErrors({})
  }, [patient, open])

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    if (!form.ownerId) newErrors.ownerId = "Owner is required"
    if (!form.name.trim()) newErrors.name = "Name is required"
    if (!form.species) newErrors.species = "Species is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form])

  const createMutation = useMutation({
    mutationFn: async (data: CreatePatientInput) => {
      const payload = { ...data }
      if (!payload.breed) delete (payload as Record<string, unknown>).breed
      if (!payload.birthdate) delete (payload as Record<string, unknown>).birthdate
      if (!payload.sex) delete (payload as Record<string, unknown>).sex
      if (!payload.color) delete (payload as Record<string, unknown>).color
      if (!payload.microchipId) delete (payload as Record<string, unknown>).microchipId
      if (!payload.notes) delete (payload as Record<string, unknown>).notes
      if (!payload.allergies) delete (payload as Record<string, unknown>).allergies
      if (!payload.chronicConditions) delete (payload as Record<string, unknown>).chronicConditions
      return fetchWithAuth("/v1/patients", { method: "POST", body: JSON.stringify(payload) })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
      onSuccess()
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: UpdatePatientInput) => {
      const payload = { ...data }
      Object.keys(payload).forEach((key) => {
        const val = (payload as Record<string, unknown>)[key]
        if (val === "" || val === undefined) delete (payload as Record<string, unknown>)[key]
      })
      return fetchWithAuth(`/v1/patients/${patient!.id}`, { method: "PUT", body: JSON.stringify(payload) })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
      queryClient.invalidateQueries({ queryKey: ["patients", patient!.id] })
      onSuccess()
      onClose()
    },
  })

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!validate()) return
      if (isEditing) {
        updateMutation.mutate(form)
      } else {
        createMutation.mutate(form)
      }
    },
    [form, isEditing, validate, createMutation, updateMutation]
  )

  const updateField = useCallback(<K extends keyof CreatePatientInput>(field: K, value: CreatePatientInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
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
            <div className="space-y-4">
              <OwnerSearch
                value={form.ownerId}
                onChange={(ownerId, _ownerName) => updateField("ownerId", ownerId)}
                disabled={createMutation.isPending || updateMutation.isPending}
              />
              {errors.ownerId && <p className="text-xs text-destructive">{errors.ownerId}</p>}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="species">Species *</Label>
                  <select
                    id="species"
                    value={form.species}
                    onChange={(e) => updateField("species", e.target.value)}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select species</option>
                    {SPECIES_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.species && <p className="text-xs text-destructive">{errors.species}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    value={form.breed}
                    onChange={(e) => updateField("breed", e.target.value)}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthdate">Birth Date</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={form.birthdate}
                    onChange={(e) => updateField("birthdate", e.target.value)}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sex">Sex</Label>
                  <select
                    id="sex"
                    value={form.sex}
                    onChange={(e) => updateField("sex", e.target.value)}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select sex</option>
                    {SEX_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={form.color}
                    onChange={(e) => updateField("color", e.target.value)}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="microchipId">Microchip ID</Label>
                  <Input
                    id="microchipId"
                    value={form.microchipId}
                    onChange={(e) => updateField("microchipId", e.target.value)}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isNeutered"
                  type="checkbox"
                  checked={form.isNeutered}
                  onChange={(e) => updateField("isNeutered", e.target.checked)}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                />
                <Label htmlFor="isNeutered" className="font-normal">Neutered / Spayed</Label>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  value={form.allergies}
                  onChange={(e) => updateField("allergies", e.target.value)}
                  placeholder="e.g. Penicillin, Chicken"
                  disabled={createMutation.isPending || updateMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                <Input
                  id="chronicConditions"
                  value={form.chronicConditions}
                  onChange={(e) => updateField("chronicConditions", e.target.value)}
                  placeholder="e.g. Asthma, Hip dysplasia"
                  disabled={createMutation.isPending || updateMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={3}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={createMutation.isPending || updateMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Patient"}
              </Button>
            </div>

            {(createMutation.isError || updateMutation.isError) && (
              <p className="text-sm text-destructive text-right">
                {(createMutation.error || updateMutation.error)?.message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

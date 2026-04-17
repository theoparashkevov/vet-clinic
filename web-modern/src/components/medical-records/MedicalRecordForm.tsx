import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Card, CardContent } from "../ui/card"
import { Calendar, Stethoscope, Pill, Clipboard, FileText } from "lucide-react"
import type { CreateMedicalRecordData } from "../../lib/api/medical-records"

interface MedicalRecordFormProps {
  initialData?: Partial<CreateMedicalRecordData>
  onSubmit: (data: CreateMedicalRecordData) => void
  onCancel: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function MedicalRecordForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Save Record",
}: MedicalRecordFormProps) {
  const [formData, setFormData] = useState<CreateMedicalRecordData>({
    visitDate: initialData?.visitDate?.split("T")[0] || new Date().toISOString().split("T")[0],
    summary: initialData?.summary || "",
    diagnoses: initialData?.diagnoses || "",
    treatments: initialData?.treatments || "",
    prescriptions: initialData?.prescriptions || "",
    appointmentId: initialData?.appointmentId,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CreateMedicalRecordData, string>>>({})

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateMedicalRecordData, string>> = {}

    if (!formData.visitDate) {
      newErrors.visitDate = "Visit date is required"
    }

    if (!formData.summary.trim()) {
      newErrors.summary = "Summary is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  const updateField = (field: keyof CreateMedicalRecordData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="visitDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Visit Date *
            </Label>
            <Input
              id="visitDate"
              type="date"
              value={formData.visitDate}
              onChange={(e) => updateField("visitDate", e.target.value)}
              className={errors.visitDate ? "border-destructive" : ""}
            />
            {errors.visitDate && (
              <p className="text-sm text-destructive">{errors.visitDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Visit Summary *
            </Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              placeholder="Enter a summary of the visit..."
              rows={3}
              className={errors.summary ? "border-destructive" : ""}
            />
            {errors.summary && (
              <p className="text-sm text-destructive">{errors.summary}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diagnoses" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Diagnoses
            </Label>
            <Textarea
              id="diagnoses"
              value={formData.diagnoses}
              onChange={(e) => updateField("diagnoses", e.target.value)}
              placeholder="Enter diagnoses (optional)..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatments" className="flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              Treatments
            </Label>
            <Textarea
              id="treatments"
              value={formData.treatments}
              onChange={(e) => updateField("treatments", e.target.value)}
              placeholder="Enter treatments performed (optional)..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prescriptions" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Prescriptions
            </Label>
            <Textarea
              id="prescriptions"
              value={formData.prescriptions}
              onChange={(e) => updateField("prescriptions", e.target.value)}
              placeholder="Enter prescriptions (optional)..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}

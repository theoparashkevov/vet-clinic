import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { MedicalRecordForm } from "./MedicalRecordForm"
import type { MedicalRecord, UpdateMedicalRecordData } from "../../lib/api/medical-records"

interface EditMedicalRecordDialogProps {
  record: MedicalRecord | null
  patientName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: UpdateMedicalRecordData) => void
  isSubmitting?: boolean
}

export function EditMedicalRecordDialog({
  record,
  patientName,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: EditMedicalRecordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Medical Record</DialogTitle>
          <DialogDescription>
            Update medical record for {patientName}.
          </DialogDescription>
        </DialogHeader>
        {record && (
          <MedicalRecordForm
            initialData={{
              visitDate: record.visitDate,
              summary: record.summary,
              diagnoses: record.diagnoses,
              treatments: record.treatments,
              prescriptions: record.prescriptions,
            }}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
            submitLabel="Update Record"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { MedicalRecordForm } from "./MedicalRecordForm"
import type { CreateMedicalRecordData } from "../../lib/api/medical-records"

interface AddMedicalRecordDialogProps {
  patientName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateMedicalRecordData) => void
  isSubmitting?: boolean
}

export function AddMedicalRecordDialog({
  patientName,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AddMedicalRecordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Medical Record</DialogTitle>
          <DialogDescription>
            Create a new medical record for {patientName}.
          </DialogDescription>
        </DialogHeader>
        <MedicalRecordForm
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          submitLabel="Create Record"
        />
      </DialogContent>
    </Dialog>
  )
}

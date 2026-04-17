import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Loader2, FileText, Plus, Calendar, Stethoscope, Pill, Clipboard } from "lucide-react"
import { format } from "date-fns"
import type { MedicalRecord } from "../../lib/api/medical-records"

interface MedicalRecordsListProps {
  records: MedicalRecord[]
  isLoading?: boolean
  onViewDetail?: (record: MedicalRecord) => void
  onAddNew?: () => void
}

export function MedicalRecordsList({ records, isLoading, onViewDetail, onAddNew }: MedicalRecordsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No medical records yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Medical records will appear here when added
          </p>
          {onAddNew && (
            <Button onClick={onAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Medical Record
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card
          key={record.id}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => onViewDetail?.(record)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">
                    Visit on {format(new Date(record.visitDate), "MMM d, yyyy")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Created {format(new Date(record.createdAt), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              </div>
              {record.appointmentId && (
                <Badge variant="outline">Appointment</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-foreground mb-4">{record.summary}</p>
            
            <div className="flex flex-wrap gap-2">
              {record.diagnoses && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clipboard className="h-3 w-3" />
                  Diagnoses
                </Badge>
              )}
              {record.treatments && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Treatments
                </Badge>
              )}
              {record.prescriptions && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Pill className="h-3 w-3" />
                  Prescriptions
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

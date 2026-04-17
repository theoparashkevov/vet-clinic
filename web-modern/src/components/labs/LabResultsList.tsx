import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Loader2, FileText, AlertCircle, CheckCircle2, ChevronRight, Plus } from "lucide-react"
import { format } from "date-fns"
import type { LabResult } from "../../lib/api/labs"

interface LabResultsListProps {
  results: LabResult[]
  isLoading?: boolean
  onViewDetail?: (result: LabResult) => void
  onAddNew?: () => void
}

export function LabResultsList({ results, isLoading, onViewDetail, onAddNew }: LabResultsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800 border-green-200"
      case "abnormal":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "abnormal":
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

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

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No lab results yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Lab results will appear here when added
          </p>
          {onAddNew && (
            <Button onClick={onAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Lab Result
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <Card
          key={result.id}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => onViewDetail?.(result)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{result.panel?.name || "Unknown Panel"}</h4>
                    <Badge variant="outline" className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(result.testDate), "MMM d, yyyy")}
                    {result.externalLab && ` • ${result.externalLab}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {result.abnormalCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {result.abnormalCount} abnormal
                  </Badge>
                )}
                {result.criticalCount > 0 && (
                  <Badge variant="destructive" className="bg-red-600 text-xs">
                    {result.criticalCount} critical
                  </Badge>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            {result.values && result.values.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {result.values.slice(0, 4).map((value) => (
                    <div key={value.id} className="text-sm">
                      <span className="text-muted-foreground">{value.test?.abbreviation || value.test?.name}:</span>{" "}
                      <span className={
                        value.status === "critical" ? "text-red-600 font-semibold" :
                        value.status === "abnormal" ? "text-yellow-600" :
                        "text-green-600"
                      }>
                        {value.value} {value.test?.unit}
                      </span>
                    </div>
                  ))}
                  {result.values.length > 4 && (
                    <div className="text-sm text-muted-foreground">
                      +{result.values.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
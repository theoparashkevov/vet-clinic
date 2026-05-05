import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import {
  FlaskConical,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Calendar,
  User,
} from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { PatientSearch } from "../../components/patients/PatientSearch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"

export const Route = createFileRoute("/_authenticated/lab-results")({
  component: LabResultsPage,
})

interface Patient {
  id: string
  name: string
  species: string
}

interface LabPanel {
  id: string
  name: string
  category: string
}

interface LabTest {
  id: string
  name: string
  abbreviation?: string
  unit: string
}

interface LabResultValue {
  id: string
  testId: string
  value: number
  displayValue: string
  status: string
  refRangeMin?: number
  refRangeMax?: number
  notes?: string
  test: LabTest
}

interface LabResult {
  id: string
  patientId: string
  patient: Patient
  panelId: string
  panel: LabPanel
  testDate: string
  status: string
  abnormalCount: number
  criticalCount: number
  values: LabResultValue[]
  notes?: string
  interpretation?: string
  externalLab?: string
  reviewedBy?: string
  reviewedDate?: string
}

interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

function usePatients() {
  return useQuery({
    queryKey: ["patients", "list"],
    queryFn: async (): Promise<Patient[]> => {
      const res = (await fetchWithAuth("/v1/patients?limit=100")) as PaginatedResponse<Patient>
      return res.data ?? []
    },
  })
}

function useLabResults(patientId?: string) {
  return useQuery({
    queryKey: ["lab-results", "list", patientId],
    queryFn: async (): Promise<LabResult[]> => {
      const url = patientId
        ? `/v1/lab-results?patientId=${patientId}&limit=100`
        : "/v1/lab-results?limit=100"
      const res = (await fetchWithAuth(url)) as PaginatedResponse<LabResult>
      return res.data ?? []
    },
  })
}

function useLabResultDetail(id: string | null) {
  return useQuery({
    queryKey: ["lab-results", "detail", id],
    queryFn: async (): Promise<LabResult> => {
      const res = await fetchWithAuth(`/v1/lab-results/${id}`)
      return res.data as LabResult
    },
    enabled: !!id,
  })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "normal":
      return "default"
    case "abnormal":
      return "secondary"
    case "critical":
    case "critical_low":
    case "critical_high":
      return "destructive"
    default:
      return "outline"
  }
}

function getValueStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "normal":
      return "text-emerald-600 dark:text-emerald-400"
    case "low":
    case "high":
      return "text-amber-600 dark:text-amber-400"
    case "critical_low":
    case "critical_high":
    case "critical":
      return "text-red-600 dark:text-red-400"
    default:
      return "text-foreground"
  }
}

function getValueStatusBg(status: string) {
  switch (status.toLowerCase()) {
    case "normal":
      return "bg-emerald-50 dark:bg-emerald-900/20"
    case "low":
    case "high":
      return "bg-amber-50 dark:bg-amber-900/20"
    case "critical_low":
    case "critical_high":
    case "critical":
      return "bg-red-50 dark:bg-red-900/20"
    default:
      return "bg-transparent"
  }
}

function LabResultsPage() {
  const [view, setView] = useState<"list" | "detail">("list")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [patientFilter, setPatientFilter] = useState<string>("")

  const { data: patients } = usePatients()
  const { data: results, isLoading } = useLabResults(patientFilter || undefined)
  const { data: detail } = useLabResultDetail(selectedId)

  const handleViewDetail = (id: string) => {
    setSelectedId(id)
    setView("detail")
  }

  const handleBack = () => {
    setView("list")
    setSelectedId(null)
  }

  if (view === "detail" && detail) {
    return <LabResultDetail result={detail} onBack={handleBack} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Lab Results
          </h1>
          <p className="mt-1 text-muted-foreground">
            View and review laboratory test results.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <PatientSearch
          patients={patients ?? []}
          value={patientFilter}
          onChange={setPatientFilter}
          placeholder="Filter by patient…"
          className="max-w-sm flex-1"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lab Results</CardTitle>
          <CardDescription>
            {results?.length ?? 0} result{results?.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : results && results.length > 0 ? (
            <div className="divide-y">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex cursor-pointer items-center justify-between py-4 transition-colors hover:bg-accent/50"
                  onClick={() => handleViewDetail(result.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <FlaskConical className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {result.panel.name}
                        </p>
                        <Badge variant={getStatusBadgeVariant(result.status)} className="text-xs">
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {result.patient.name} · {formatDate(result.testDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {result.criticalCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {result.criticalCount} critical
                      </div>
                    )}
                    {result.abnormalCount > 0 && result.criticalCount === 0 && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <Activity className="h-3.5 w-3.5" />
                        {result.abnormalCount} abnormal
                      </div>
                    )}
                    {result.abnormalCount === 0 && result.criticalCount === 0 && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        All normal
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FlaskConical className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                No lab results found.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function LabResultDetail({
  result,
  onBack,
}: {
  result: LabResult
  onBack: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to list
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {result.panel.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {result.patient.name} · {formatDate(result.testDate)}
          </p>
        </div>
        <Badge
          variant={getStatusBadgeVariant(result.status)}
          className="w-fit text-sm px-3 py-1"
        >
          {result.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Test Values</CardTitle>
              <CardDescription>
                Color-coded results with reference ranges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Reference Range</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.values.map((val) => (
                    <TableRow
                      key={val.id}
                      className={getValueStatusBg(val.status)}
                    >
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{val.test.name}</p>
                          {val.test.abbreviation && (
                            <p className="text-xs text-muted-foreground">
                              {val.test.abbreviation}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-sm font-semibold ${getValueStatusColor(
                            val.status
                          )}`}
                        >
                          {val.displayValue} {val.test.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {val.refRangeMin !== null && val.refRangeMin !== undefined
                            ? val.refRangeMin
                            : "—"}{" "}
                          –{" "}
                          {val.refRangeMax !== null && val.refRangeMax !== undefined
                            ? val.refRangeMax
                            : "—"}{" "}
                          {val.test.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(val.status)}
                          className="text-xs capitalize"
                        >
                          {val.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {result.interpretation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Interpretation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {result.interpretation}
                </p>
              </CardContent>
            </Card>
          )}

          {result.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {result.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Result Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{result.patient.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{formatDate(result.testDate)}</span>
              </div>
              {result.externalLab && (
                <div className="flex items-center gap-3">
                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{result.externalLab}</span>
                </div>
              )}
              {result.reviewedBy && (
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    Reviewed by {result.reviewedBy}
                    {result.reviewedDate && ` on ${formatDate(result.reviewedDate)}`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Tests</span>
                <span className="text-sm font-medium">{result.values.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Normal</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {result.values.filter((v) => v.status === "normal").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Abnormal</span>
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {result.values.filter(
                    (v) => v.status === "low" || v.status === "high"
                  ).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Critical</span>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {result.values.filter(
                    (v) =>
                      v.status === "critical_low" ||
                      v.status === "critical_high" ||
                      v.status === "critical"
                  ).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

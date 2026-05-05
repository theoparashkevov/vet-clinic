import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import {
  FlaskConical,
  X,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Calendar,
  User,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { fetchWithAuth } from "../../lib/api"
import { PatientSearch } from "../../components/patients/PatientSearch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { Separator } from "../../components/ui/separator"
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

// Also always fetch the full unfiltered list so we can count per patient
function useAllLabResults() {
  return useQuery({
    queryKey: ["lab-results", "list", undefined],
    queryFn: async (): Promise<LabResult[]> => {
      const res = (await fetchWithAuth("/v1/lab-results?limit=100")) as PaginatedResponse<LabResult>
      return res.data ?? []
    },
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
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [patientFilter, setPatientFilter] = useState<string>("")

  const { data: patients } = usePatients()
  const { data: results, isLoading } = useLabResults(patientFilter || undefined)
  const { data: allResults } = useAllLabResults()

  const countsByPatientId = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {}
    allResults?.forEach((r) => {
      counts[r.patientId] = (counts[r.patientId] ?? 0) + 1
    })
    return counts
  }, [allResults])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Lab Results</h1>
          <p className="mt-1 text-muted-foreground">View and review laboratory test results.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <PatientSearch
          patients={patients ?? []}
          value={patientFilter}
          onChange={setPatientFilter}
          placeholder="Filter by patient…"
          className="max-w-sm flex-1"
          counts={countsByPatientId}
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
                  className="flex cursor-pointer items-center justify-between py-4 transition-colors hover:bg-accent/50 -mx-6 px-6"
                  onClick={() => setSelectedId(result.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <FlaskConical className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{result.panel.name}</p>
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
              <p className="mt-3 text-sm text-muted-foreground">No lab results found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <LabResultDrawer selectedId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}

function LabResultDrawer({
  selectedId,
  onClose,
}: {
  selectedId: string | null
  onClose: () => void
}) {
  const { data: result, isLoading } = useLabResultDetail(selectedId)

  return (
    <AnimatePresence>
      {selectedId && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b px-5 py-4">
              {isLoading || !result ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <FlaskConical className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold leading-tight">{result.panel.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {result.patient.name} · {formatDate(result.testDate)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                {result && (
                  <Badge variant={getStatusBadgeVariant(result.status)} className="capitalize">
                    {result.status}
                  </Badge>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {isLoading || !result ? (
                <div className="space-y-3 p-5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-5 px-5 py-4">

                  {/* Summary stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <StatTile
                      label="Normal"
                      value={result.values.filter((v) => v.status === "normal").length}
                      colorClass="text-emerald-600 dark:text-emerald-400"
                    />
                    <StatTile
                      label="Abnormal"
                      value={result.abnormalCount}
                      colorClass="text-amber-600 dark:text-amber-400"
                    />
                    <StatTile
                      label="Critical"
                      value={result.criticalCount}
                      colorClass="text-red-600 dark:text-red-400"
                    />
                  </div>

                  <Separator />

                  {/* Test values */}
                  <section>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Test Values
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Test</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Ref Range</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.values.map((val) => (
                          <TableRow key={val.id} className={getValueStatusBg(val.status)}>
                            <TableCell>
                              <p className="text-sm font-medium">{val.test.name}</p>
                              {val.test.abbreviation && (
                                <p className="text-xs text-muted-foreground">{val.test.abbreviation}</p>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={`text-sm font-semibold ${getValueStatusColor(val.status)}`}>
                                {val.displayValue} {val.test.unit}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {val.refRangeMin ?? "—"} – {val.refRangeMax ?? "—"} {val.test.unit}
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
                  </section>

                  {(result.interpretation || result.notes) && <Separator />}

                  {result.interpretation && (
                    <section>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Interpretation
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {result.interpretation}
                      </p>
                    </section>
                  )}

                  {result.notes && (
                    <section>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Notes
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{result.notes}</p>
                    </section>
                  )}

                  <Separator />

                  {/* Meta */}
                  <section>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Info
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4 shrink-0" />
                        <span>{result.patient.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>{formatDate(result.testDate)}</span>
                      </div>
                      {result.externalLab && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FlaskConical className="h-4 w-4 shrink-0" />
                          <span>{result.externalLab}</span>
                        </div>
                      )}
                      {result.reviewedBy && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Activity className="h-4 w-4 shrink-0" />
                          <span>
                            Reviewed by {result.reviewedBy}
                            {result.reviewedDate ? ` · ${formatDate(result.reviewedDate)}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </section>

                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function StatTile({
  label,
  value,
  colorClass,
}: {
  label: string
  value: number
  colorClass: string
}) {
  return (
    <div className="rounded-lg border bg-card px-3 py-3 text-center">
      <p className={`text-2xl font-bold tabular-nums ${colorClass}`}>{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import {
  FileText,
  Plus,
  ArrowLeft,
  Calendar,
  Stethoscope,
  Heart,
  Thermometer,
  Activity,
  Weight,
  ClipboardList,
  User,
  FlaskConical,
  Pill,
  X,
  RefreshCcw,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Info,
  TrendingUp,
  Printer,
  Share2,
  Mail,
  Link2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { fetchWithAuth } from "../../lib/api"
import { PatientSearch } from "../../components/patients/PatientSearch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Skeleton } from "../../components/ui/skeleton"
import { Separator } from "../../components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { toast } from "sonner"

export const Route = createFileRoute("/_authenticated/medical-records")({
  component: MedicalHistoryPage,
})

// ─── types ───────────────────────────────────────────────────────────────────

interface Patient {
  id: string
  name: string
  species: string
  owner?: { name: string }
}

interface VitalSigns {
  temperature?: number
  heartRate?: number
  respiratoryRate?: number
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  weight?: number
  bodyConditionScore?: number
  notes?: string
}

interface MedicalRecord {
  id: string
  patientId: string
  patient: Patient
  visitDate: string
  summary: string
  diagnoses?: string
  treatments?: string
  prescriptions?: string
  bodyConditionScore?: number
  nextVisitRecommended?: string
  createdBy?: { name: string }
  vitalSigns?: VitalSigns
  createdAt: string
}

interface LabResult {
  id: string
  patientId: string
  patient: Patient
  panel: { id: string; name: string; category: string }
  testDate: string
  status: string
  abnormalCount: number
  criticalCount: number
  externalLab?: string
  reviewedBy?: string
  reviewedDate?: string
  interpretation?: string
  notes?: string
  values: Array<{
    id: string
    displayValue: string
    status: string
    refRangeMin?: number
    refRangeMax?: number
    test: { id: string; name: string; abbreviation?: string; unit: string }
  }>
}

interface Prescription {
  id: string
  patientId: string
  patient: { name: string; species: string }
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  prescribedAt: string
  expiresAt: string
  refillsTotal: number
  refillsRemaining: number
  isControlled: boolean
  veterinarian?: string
  notes?: string
}

interface PaginatedResponse<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

// ─── hooks ───────────────────────────────────────────────────────────────────

function usePatients() {
  return useQuery({
    queryKey: ["patients", "list"],
    queryFn: async (): Promise<Patient[]> => {
      const res = (await fetchWithAuth("/v1/patients?limit=100")) as PaginatedResponse<Patient>
      return res.data ?? []
    },
  })
}

function useMedicalRecords(patientId?: string) {
  return useQuery({
    queryKey: ["medical-records", "list", patientId],
    queryFn: async (): Promise<MedicalRecord[]> => {
      const url = patientId
        ? `/v1/medical-records?patientId=${patientId}&limit=100`
        : "/v1/medical-records?limit=100"
      const res = (await fetchWithAuth(url)) as PaginatedResponse<MedicalRecord>
      return res.data ?? []
    },
  })
}

function useMedicalRecordDetail(id: string | null) {
  return useQuery({
    queryKey: ["medical-records", "detail", id],
    queryFn: async (): Promise<MedicalRecord> => {
      const res = await fetchWithAuth(`/v1/medical-records/${id}`)
      return res.data as MedicalRecord
    },
    enabled: !!id,
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

function usePrescriptions(patientId?: string) {
  return useQuery({
    queryKey: ["prescriptions", "list", patientId],
    queryFn: async (): Promise<Prescription[]> => {
      const url = patientId
        ? `/v1/prescriptions?patientId=${patientId}&limit=100`
        : "/v1/prescriptions?limit=100"
      const res = (await fetchWithAuth(url)) as PaginatedResponse<Prescription>
      return res.data ?? []
    },
  })
}

function usePrescriptionDetail(id: string | null) {
  return useQuery({
    queryKey: ["prescriptions", "detail", id],
    queryFn: async (): Promise<Prescription> => {
      const res = await fetchWithAuth(`/v1/prescriptions/${id}`)
      return res.data as Prescription
    },
    enabled: !!id,
  })
}

function useRefillPrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/v1/prescriptions/${id}/refill`, { method: "POST" })
      return res.data as Prescription
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
      toast.success("Prescription refilled")
    },
    onError: (err: Error) => toast.error(err.message || "Failed to refill"),
  })
}

function useCreateMedicalRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: {
      patientId: string
      visitDate: string
      summary: string
      diagnoses?: string
      treatments?: string
      prescriptions?: string
      bodyConditionScore?: number
      nextVisitRecommended?: string
      vitalSigns?: {
        temperature?: number
        heartRate?: number
        respiratoryRate?: number
        bloodPressureSystolic?: number
        bloodPressureDiastolic?: number
        weight?: number
        bodyConditionScore?: number
        notes?: string
      }
    }) => {
      const res = await fetchWithAuth("/v1/medical-records", {
        method: "POST",
        body: JSON.stringify(dto),
      })
      return res.data as MedicalRecord
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] })
      toast.success("Medical record created")
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create record"),
  })
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function isExpired(expiresAt: string) {
  return new Date(expiresAt) < new Date()
}

function getLabStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case "normal": return "default"
    case "abnormal": return "secondary"
    case "critical":
    case "critical_low":
    case "critical_high": return "destructive"
    default: return "outline"
  }
}

function getValueStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "normal": return "text-emerald-600 dark:text-emerald-400"
    case "low":
    case "high": return "text-amber-600 dark:text-amber-400"
    case "critical_low":
    case "critical_high":
    case "critical": return "text-red-600 dark:text-red-400"
    default: return "text-foreground"
  }
}

function getValueStatusBg(status: string) {
  switch (status.toLowerCase()) {
    case "normal": return "bg-emerald-50 dark:bg-emerald-900/20"
    case "low":
    case "high": return "bg-amber-50 dark:bg-amber-900/20"
    case "critical_low":
    case "critical_high":
    case "critical": return "bg-red-50 dark:bg-red-900/20"
    default: return "bg-transparent"
  }
}

function TabCount({ n }: { n: number }) {
  if (!n) return null
  return (
    <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-xs leading-none tabular-nums">
      {n}
    </span>
  )
}

// ─── print utilities ─────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

const PRINT_CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:11pt;color:#111;padding:20mm;line-height:1.5}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6mm;padding-bottom:4mm;border-bottom:2pt solid #111}
  .clinic{font-size:15pt;font-weight:700}.clinic-sub{font-size:9pt;color:#666;margin-top:2px}
  .meta{font-size:9pt;color:#666;text-align:right;line-height:1.8}
  h1{font-size:17pt;font-weight:700;margin-bottom:1mm}
  .subtitle{font-size:11pt;color:#555;margin-bottom:6mm}
  .pbox{display:flex;flex-wrap:wrap;gap:6mm;background:#f5f5f5;border:0.5pt solid #ddd;border-radius:3pt;padding:3.5mm 5mm;margin-bottom:6mm}
  .pf-l{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#888}
  .pf-v{font-size:11pt;font-weight:500;margin-top:.5mm}
  .vitals{display:flex;flex-wrap:wrap;gap:3mm;margin-bottom:5mm}
  .vc{border:.5pt solid #ddd;border-radius:20pt;padding:1.5mm 4mm;font-size:10pt;background:#fafafa}
  .sl{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#888;margin-bottom:1.5mm}
  .sc{font-size:11pt;white-space:pre-wrap;line-height:1.6}
  .sec{margin-bottom:5mm}
  hr{border:none;border-top:.5pt solid #ddd;margin:4mm 0}
  .footer{margin-top:8mm;padding-top:3mm;border-top:.5pt solid #ddd;font-size:8pt;color:#bbb;display:flex;justify-content:space-between}
  .tl-item{display:flex;gap:5mm;margin-bottom:6mm}
  .tl-date{min-width:26mm;font-size:9pt;font-weight:700;font-family:monospace;color:#555;padding-top:1mm}
  .tl-body{flex:1;border-left:.5pt solid #ddd;padding-left:5mm}
  .tl-summary{font-size:11pt;margin-bottom:2mm}
  .tl-sub{font-size:9.5pt;color:#555;margin-bottom:1.5mm}
  .badge{display:inline-block;border:.5pt solid #ddd;border-radius:20pt;padding:1mm 3.5mm;font-size:9pt;margin-right:2mm;margin-bottom:2mm}
  @media print{@page{margin:0;size:A4}body{padding:15mm 20mm}}
`

function openPrintWindow(html: string) {
  const win = window.open("", "_blank")
  if (!win) {
    toast.error("Pop-up blocked — please allow pop-ups to print.")
    return
  }
  win.document.write(html)
  win.document.close()
  setTimeout(() => win.print(), 400)
}

function printRecord(record: MedicalRecord) {
  const d = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  const vchip = (label: string, val: number | undefined, unit: string) =>
    val != null ? `<span class="vc">${label} ${val}${unit}</span>` : ""

  const sec = (label: string, content: string | undefined) =>
    content
      ? `<hr><div class="sec"><div class="sl">${label}</div><div class="sc">${esc(content)}</div></div>`
      : ""

  const vitalsHTML = record.vitalSigns
    ? `<div class="vitals">
        ${vchip("T", record.vitalSigns.temperature, "°C")}
        ${vchip("HR", record.vitalSigns.heartRate, " bpm")}
        ${vchip("W", record.vitalSigns.weight, " kg")}
        ${vchip("RR", record.vitalSigns.respiratoryRate, " /min")}
        ${record.vitalSigns.bloodPressureSystolic != null && record.vitalSigns.bloodPressureDiastolic != null
          ? `<span class="vc">BP ${record.vitalSigns.bloodPressureSystolic}/${record.vitalSigns.bloodPressureDiastolic} mmHg</span>`
          : ""}
      </div>`
    : ""

  openPrintWindow(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Medical Record — ${esc(record.patient.name)}</title>
<style>${PRINT_CSS}</style></head><body>
<div class="hdr">
  <div><div class="clinic">Vet Clinic</div><div class="clinic-sub">Medical Record</div></div>
  <div class="meta">Printed: ${d(new Date().toISOString())}<br>Visit Date: ${d(record.visitDate)}</div>
</div>
<h1>${esc(record.patient.name)}</h1>
<div class="subtitle">${esc(record.patient.species)}${record.patient.owner ? ` &middot; Owner: ${esc(record.patient.owner.name)}` : ""}</div>
<div class="pbox">
  <div><div class="pf-l">Visit Date</div><div class="pf-v">${d(record.visitDate)}</div></div>
  ${record.createdBy ? `<div><div class="pf-l">Veterinarian</div><div class="pf-v">${esc(record.createdBy.name)}</div></div>` : ""}
  ${record.bodyConditionScore != null ? `<div><div class="pf-l">BCS</div><div class="pf-v">${record.bodyConditionScore}/9</div></div>` : ""}
  ${record.nextVisitRecommended ? `<div><div class="pf-l">Next Visit</div><div class="pf-v">${d(record.nextVisitRecommended)}</div></div>` : ""}
</div>
${vitalsHTML}
<div class="sec"><div class="sl">Summary</div><div class="sc">${esc(record.summary)}</div></div>
${sec("Diagnoses", record.diagnoses)}
${sec("Treatments", record.treatments)}
${sec("Prescriptions", record.prescriptions)}
<div class="footer"><span>Vet Clinic Management System</span><span>Confidential — For clinical use only</span></div>
</body></html>`)
}

function printHistory(
  patient: Patient,
  records: MedicalRecord[],
  labResults: LabResult[],
  prescriptions: Prescription[]
) {
  const d = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  const sorted = [...records].sort(
    (a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime()
  )

  const recordsHTML = sorted.length
    ? sorted
        .map(
          (r) => `
      <div class="tl-item">
        <div class="tl-date">${r.visitDate.slice(0, 10)}</div>
        <div class="tl-body">
          ${r.vitalSigns
            ? `<div class="vitals" style="margin-bottom:2mm">
                ${r.vitalSigns.temperature != null ? `<span class="badge">T ${r.vitalSigns.temperature}°C</span>` : ""}
                ${r.vitalSigns.heartRate != null ? `<span class="badge">HR ${r.vitalSigns.heartRate} bpm</span>` : ""}
                ${r.vitalSigns.weight != null ? `<span class="badge">W ${r.vitalSigns.weight} kg</span>` : ""}
              </div>`
            : ""}
          <div class="tl-summary">${esc(r.summary)}</div>
          ${r.diagnoses ? `<div class="tl-sub"><strong>Diagnoses:</strong> ${esc(r.diagnoses)}</div>` : ""}
          ${r.treatments ? `<div class="tl-sub"><strong>Treatments:</strong> ${esc(r.treatments)}</div>` : ""}
        </div>
      </div>`
        )
        .join("")
    : "<p style='color:#888;font-size:10pt'>No records.</p>"

  const labHTML = labResults.length
    ? labResults
        .map(
          (lr) =>
            `<div style="display:flex;gap:4mm;margin-bottom:3mm">
              <div style="min-width:26mm;font-size:9pt;color:#555">${lr.testDate.slice(0, 10)}</div>
              <div>${esc(lr.panel.name)} &nbsp;
                <span class="badge">${esc(lr.status)}</span>
                ${lr.criticalCount > 0 ? `<span class="badge" style="color:#b91c1c">${lr.criticalCount} critical</span>` : ""}
                ${lr.abnormalCount > 0 ? `<span class="badge" style="color:#d97706">${lr.abnormalCount} abnormal</span>` : ""}
              </div>
            </div>`
        )
        .join("")
    : "<p style='color:#888;font-size:10pt'>No lab results.</p>"

  const rxHTML = prescriptions.length
    ? prescriptions
        .map((rx) => {
          const expired = new Date(rx.expiresAt) < new Date()
          return `<div style="display:flex;gap:4mm;margin-bottom:3mm">
            <div style="min-width:26mm;font-size:9pt;color:#555">${rx.prescribedAt.slice(0, 10)}</div>
            <div>${esc(rx.medication)}
              <span class="badge" style="color:${expired ? "#b91c1c" : "#065f46"}">${expired ? "Expired" : "Active"}</span>
              <div style="font-size:9.5pt;color:#555;margin-top:1mm">${esc(rx.dosage)} &middot; ${esc(rx.frequency)} &middot; ${esc(rx.duration)}</div>
            </div>
          </div>`
        })
        .join("")
    : "<p style='color:#888;font-size:10pt'>No prescriptions.</p>"

  openPrintWindow(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Medical History — ${esc(patient.name)}</title>
<style>${PRINT_CSS}</style></head><body>
<div class="hdr">
  <div><div class="clinic">Vet Clinic</div><div class="clinic-sub">Complete Medical History</div></div>
  <div class="meta">Printed: ${d(new Date().toISOString())}</div>
</div>
<h1>${esc(patient.name)}</h1>
<div class="subtitle">${esc(patient.species)}${patient.owner ? ` &middot; Owner: ${esc(patient.owner.name)}` : ""}</div>
<div class="pbox">
  <div><div class="pf-l">Records</div><div class="pf-v">${records.length}</div></div>
  <div><div class="pf-l">Lab Results</div><div class="pf-v">${labResults.length}</div></div>
  <div><div class="pf-l">Prescriptions</div><div class="pf-v">${prescriptions.length}</div></div>
</div>
<div class="sec"><div class="sl" style="font-size:11pt;margin-bottom:4mm">Visit Records</div>${recordsHTML}</div>
<hr>
<div class="sec"><div class="sl" style="font-size:11pt;margin-bottom:4mm">Lab Results</div>${labHTML}</div>
<hr>
<div class="sec"><div class="sl" style="font-size:11pt;margin-bottom:4mm">Prescriptions</div>${rxHTML}</div>
<div class="footer"><span>Vet Clinic Management System</span><span>Confidential — For clinical use only</span></div>
</body></html>`)
}

// ─── page ────────────────────────────────────────────────────────────────────

type Selected =
  | { type: "record"; id: string }
  | { type: "lab"; id: string }
  | { type: "rx"; id: string }
  | { type: "patient-info" }
  | null

function MedicalHistoryPage() {
  const [view, setView] = useState<"list" | "create">("list")
  const [patientFilter, setPatientFilter] = useState("")
  const [selected, setSelected] = useState<Selected>(null)

  const { data: patients } = usePatients()
  const { data: records, isLoading: recordsLoading } = useMedicalRecords(patientFilter || undefined)
  const { data: labResults, isLoading: labLoading } = useLabResults(patientFilter || undefined)
  const { data: prescriptions, isLoading: rxLoading } = usePrescriptions(patientFilter || undefined)
  const createMutation = useCreateMedicalRecord()

  if (view === "create") {
    return (
      <CreateMedicalRecordForm
        patients={patients ?? []}
        onCancel={() => setView("list")}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data)
          setView("list")
        }}
        isSubmitting={createMutation.isPending}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Medical History</h1>
          <p className="text-muted-foreground">
            Complete patient history — visit records, lab results, and prescriptions.
          </p>
        </div>
        <Button onClick={() => setView("create")}>
          <Plus className="mr-2 h-4 w-4" />
          New Record
        </Button>
      </div>

      {/* Patient filter + info button */}
      <div className="flex items-center gap-3">
        <PatientSearch
          patients={patients ?? []}
          value={patientFilter}
          onChange={setPatientFilter}
          placeholder="Filter by patient…"
          className="max-w-sm"
        />
        {patientFilter && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelected({ type: "patient-info" })}
            >
              <Info className="mr-2 h-4 w-4" />
              Patient Info
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const patient = patients?.find((p) => p.id === patientFilter)
                if (patient) {
                  printHistory(patient, records ?? [], labResults ?? [], prescriptions ?? [])
                }
              }}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Records
            <TabCount n={records?.length ?? 0} />
          </TabsTrigger>
          <TabsTrigger value="lab" className="gap-1.5">
            <FlaskConical className="h-3.5 w-3.5" />
            Lab Results
            <TabCount n={labResults?.length ?? 0} />
          </TabsTrigger>
          <TabsTrigger value="rx" className="gap-1.5">
            <Pill className="h-3.5 w-3.5" />
            Prescriptions
            <TabCount n={prescriptions?.length ?? 0} />
          </TabsTrigger>
        </TabsList>

        {/* ── Records ── */}
        <TabsContent value="records" className="mt-4">
          {recordsLoading ? (
            <div className="space-y-6 pl-10">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : records && records.length > 0 ? (
            <RecordsTimeline
              records={records}
              onSelect={(id) => setSelected({ type: "record", id })}
            />
          ) : (
            <EmptyState icon={FileText} text="No medical records found." action={
              <Button variant="outline" size="sm" onClick={() => setView("create")}>
                <Plus className="mr-2 h-4 w-4" />Create first record
              </Button>
            } />
          )}
        </TabsContent>

        {/* ── Lab Results ── */}
        <TabsContent value="lab" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {labLoading ? (
                <div className="space-y-3 p-5">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : labResults && labResults.length > 0 ? (
                <div className="divide-y">
                  {labResults.map((lr) => (
                    <div
                      key={lr.id}
                      className="flex cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-accent/50"
                      onClick={() => setSelected({ type: "lab", id: lr.id })}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <FlaskConical className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{lr.panel.name}</p>
                            <Badge variant={getLabStatusVariant(lr.status)} className="text-xs">{lr.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{lr.patient.name} · {formatDate(lr.testDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        {lr.criticalCount > 0 && (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <Activity className="h-3.5 w-3.5" />{lr.criticalCount} critical
                          </span>
                        )}
                        {lr.abnormalCount > 0 && lr.criticalCount === 0 && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <Activity className="h-3.5 w-3.5" />{lr.abnormalCount} abnormal
                          </span>
                        )}
                        {lr.abnormalCount === 0 && lr.criticalCount === 0 && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />All normal
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={FlaskConical} text="No lab results found." />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Prescriptions ── */}
        <TabsContent value="rx" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {rxLoading ? (
                <div className="space-y-3 p-5">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : prescriptions && prescriptions.length > 0 ? (
                <div className="divide-y">
                  {prescriptions.map((rx) => {
                    const expired = isExpired(rx.expiresAt)
                    return (
                      <div
                        key={rx.id}
                        className="flex cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-accent/50"
                        onClick={() => setSelected({ type: "rx", id: rx.id })}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Pill className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{rx.medication}</p>
                              {rx.isControlled && <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {rx.patient.name} · {formatDate(rx.prescribedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {expired ? (
                            <span className="text-red-600 dark:text-red-400">Expired</span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">Active</span>
                          )}
                          {rx.refillsRemaining > 0 && (
                            <span className="text-muted-foreground">
                              · {rx.refillsRemaining} refill{rx.refillsRemaining !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState icon={Pill} text="No prescriptions found." />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drawers */}
      <MedicalRecordDrawer
        selectedId={selected?.type === "record" ? selected.id : null}
        onClose={() => setSelected(null)}
      />
      <LabResultDrawer
        selectedId={selected?.type === "lab" ? selected.id : null}
        onClose={() => setSelected(null)}
      />
      <PrescriptionDrawer
        selectedId={selected?.type === "rx" ? selected.id : null}
        onClose={() => setSelected(null)}
      />
      <PatientInfoDrawer
        open={selected?.type === "patient-info"}
        onClose={() => setSelected(null)}
        patient={patients?.find((p) => p.id === patientFilter)}
        records={records ?? []}
        labCount={labResults?.length ?? 0}
        rxCount={prescriptions?.length ?? 0}
      />
    </div>
  )
}

// ─── list row components ──────────────────────────────────────────────────────

function MedicalRecordRow({ record, onClick }: { record: MedicalRecord; onClick: () => void }) {
  return (
    <div
      className="flex cursor-pointer items-start gap-4 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:bg-accent/50"
      onClick={onClick}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
        <Calendar className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium">{formatDate(record.visitDate)}</p>
          <Badge variant="secondary" className="text-xs">{record.patient.name}</Badge>
          {record.diagnoses && (
            <Badge variant="outline" className="text-xs">
              <Stethoscope className="mr-1 h-3 w-3" />Diagnosis
            </Badge>
          )}
          {record.vitalSigns?.temperature && (
            <Badge variant="outline" className="text-xs">
              <Thermometer className="mr-1 h-3 w-3" />{record.vitalSigns.temperature}°C
            </Badge>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{record.summary}</p>
      </div>
      {record.nextVisitRecommended && (
        <div className="shrink-0 text-right text-xs text-muted-foreground">
          <p className="font-medium">Next visit</p>
          <p>{formatDate(record.nextVisitRecommended)}</p>
        </div>
      )}
    </div>
  )
}

function EmptyState({
  icon: Icon,
  text,
  action,
}: {
  icon: React.ElementType
  text: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
      <Icon className="h-10 w-10 opacity-30" />
      <p className="mt-3 text-sm">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── timeline ────────────────────────────────────────────────────────────────

function RecordsTimeline({
  records,
  onSelect,
}: {
  records: MedicalRecord[]
  onSelect: (id: string) => void
}) {
  const sorted = useMemo(
    () => [...records].sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime()),
    [records]
  )

  return (
    <div>
      {sorted.map((record, idx) => (
        <div key={record.id} className="flex gap-4">
          {/* Left: dot + connecting line */}
          <div className="flex flex-col items-center">
            <div className="mt-3.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background z-10">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
            {idx < sorted.length - 1 && (
              <div className="mt-1 w-px flex-1 bg-border" style={{ minHeight: "1.5rem" }} />
            )}
          </div>

          {/* Right: date label + card */}
          <div className="flex-1 min-w-0 pb-5">
            <p className="mt-2 mb-2 font-mono text-xs font-semibold tracking-wider text-muted-foreground">
              {record.visitDate.slice(0, 10)}
            </p>
            <MedicalRecordRow record={record} onClick={() => onSelect(record.id)} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── patient info drawer ──────────────────────────────────────────────────────

function WeightChart({ points }: { points: { date: string; weight: number }[] }) {
  if (points.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">No weight data recorded.</p>
    )
  }

  if (points.length === 1) {
    return (
      <div className="flex items-baseline gap-2 py-2">
        <span className="text-3xl font-bold tabular-nums">{points[0].weight}</span>
        <span className="text-sm text-muted-foreground">kg · {points[0].date}</span>
      </div>
    )
  }

  const W = 400, H = 130
  const pl = 36, pr = 8, pt = 10, pb = 22
  const iW = W - pl - pr, iH = H - pt - pb

  const weights = points.map((p) => p.weight)
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  const pad = (maxW - minW) * 0.12 || 1
  const lo = minW - pad, hi = maxW + pad

  const cx = (i: number) => pl + (i / (points.length - 1)) * iW
  const cy = (w: number) => pt + iH - ((w - lo) / (hi - lo)) * iH

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${cx(i).toFixed(1)},${cy(p.weight).toFixed(1)}`)
    .join(" ")
  const areaPath = `${linePath} L${cx(points.length - 1).toFixed(1)},${pt + iH} L${pl},${pt + iH} Z`

  const midIdx = Math.floor(points.length / 2)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full text-muted-foreground"
      role="img"
      aria-label="Weight history chart"
    >
      <path d={areaPath} className="fill-primary/10" />
      <path
        d={linePath}
        className="stroke-primary"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle key={i} cx={cx(i)} cy={cy(p.weight)} r="3.5" className="fill-primary" />
      ))}
      {/* axes */}
      <line x1={pl} y1={pt} x2={pl} y2={pt + iH} stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <line x1={pl} y1={pt + iH} x2={pl + iW} y2={pt + iH} stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      {/* y labels: max and min */}
      <text x={pl - 4} y={cy(maxW) + 4} textAnchor="end" fontSize="9" fill="currentColor">
        {maxW % 1 === 0 ? maxW : maxW.toFixed(1)}
      </text>
      <text x={pl - 4} y={cy(minW) + 4} textAnchor="end" fontSize="9" fill="currentColor">
        {minW % 1 === 0 ? minW : minW.toFixed(1)}
      </text>
      {/* x labels */}
      <text x={pl} y={H - 4} fontSize="9" fill="currentColor">
        {points[0].date}
      </text>
      {points.length > 2 && (
        <text x={cx(midIdx)} y={H - 4} textAnchor="middle" fontSize="9" fill="currentColor">
          {points[midIdx].date}
        </text>
      )}
      <text x={pl + iW} y={H - 4} textAnchor="end" fontSize="9" fill="currentColor">
        {points[points.length - 1].date}
      </text>
    </svg>
  )
}

function PatientInfoDrawer({
  open,
  onClose,
  patient,
  records,
  labCount,
  rxCount,
}: {
  open: boolean | undefined
  onClose: () => void
  patient: Patient | undefined
  records: MedicalRecord[]
  labCount: number
  rxCount: number
}) {
  const weightPoints = useMemo(
    () =>
      records
        .filter((r) => r.vitalSigns?.weight != null)
        .map((r) => ({ date: r.visitDate.slice(0, 10), weight: r.vitalSigns!.weight! }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [records]
  )

  const latestRecord = useMemo(
    () =>
      records.length > 0
        ? [...records].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())[0]
        : null,
    [records]
  )

  return (
    <DrawerShell open={!!open} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        {patient ? (
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">{patient.name}</h2>
              <p className="text-sm capitalize text-muted-foreground">
                {patient.species}
                {patient.owner ? ` · ${patient.owner.name}` : ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {/* Counts */}
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Records" value={records.length} colorClass="text-foreground" />
          <StatTile label="Lab Results" value={labCount} colorClass="text-foreground" />
          <StatTile label="Prescriptions" value={rxCount} colorClass="text-foreground" />
        </div>

        {/* Latest vitals */}
        {latestRecord?.vitalSigns && (
          <>
            <Separator />
            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Latest Vitals · {latestRecord.visitDate.slice(0, 10)}
              </p>
              <div className="flex flex-wrap gap-2">
                {latestRecord.vitalSigns.temperature != null && (
                  <span className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs">
                    <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />
                    {latestRecord.vitalSigns.temperature}°C
                  </span>
                )}
                {latestRecord.vitalSigns.heartRate != null && (
                  <span className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs">
                    <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                    {latestRecord.vitalSigns.heartRate} bpm
                  </span>
                )}
                {latestRecord.vitalSigns.weight != null && (
                  <span className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs">
                    <Weight className="h-3.5 w-3.5 text-muted-foreground" />
                    {latestRecord.vitalSigns.weight} kg
                  </span>
                )}
                {latestRecord.vitalSigns.respiratoryRate != null && (
                  <span className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    {latestRecord.vitalSigns.respiratoryRate} /min
                  </span>
                )}
                {latestRecord.vitalSigns.bodyConditionScore != null && (
                  <span className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs">
                    BCS {latestRecord.vitalSigns.bodyConditionScore}/9
                  </span>
                )}
              </div>
            </section>
          </>
        )}

        {/* Weight history chart */}
        <Separator />
        <section>
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            Weight History (kg)
          </p>
          <WeightChart points={weightPoints} />
        </section>

        {/* Next recommended visit */}
        {latestRecord?.nextVisitRecommended && (
          <>
            <Separator />
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Next Visit
              </p>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate(latestRecord.nextVisitRecommended)}
              </div>
            </section>
          </>
        )}
      </div>
    </DrawerShell>
  )
}

// ─── drawers ─────────────────────────────────────────────────────────────────

function DrawerShell({
  open,
  onClose,
  width = "max-w-xl",
  children,
}: {
  open: boolean
  onClose: () => void
  width?: string
  children: React.ReactNode
}) {
  return (
    <AnimatePresence>
      {open && (
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
            className={`fixed right-0 top-0 z-50 flex h-full w-full ${width} flex-col bg-background shadow-2xl`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function MedicalRecordDrawer({
  selectedId,
  onClose,
}: {
  selectedId: string | null
  onClose: () => void
}) {
  const { data: record, isLoading } = useMedicalRecordDetail(selectedId)
  const [shareOpen, setShareOpen] = useState(false)

  return (
    <DrawerShell open={!!selectedId} onClose={onClose}>
      {/* Header */}
      <div className="flex items-start justify-between border-b px-5 py-4">
        {isLoading || !record ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-1.5"><Skeleton className="h-5 w-36" /><Skeleton className="h-4 w-24" /></div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">{formatDate(record.visitDate)}</h2>
              <p className="text-sm text-muted-foreground">{record.patient.name}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1 shrink-0">
          {!isLoading && record && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Print record" onClick={() => printRecord(record)}>
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Share" onClick={() => setShareOpen(true)}>
                <Share2 className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={record ? `${record.patient.name} — ${formatDate(record.visitDate)}` : "Medical Record"}
      />

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {isLoading || !record ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : (
          <div className="space-y-5 px-5 py-4">
            {/* Vitals chips */}
            {record.vitalSigns && (
              <div className="flex flex-wrap gap-2">
                {record.vitalSigns.temperature != null && (
                  <span className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs">
                    <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />{record.vitalSigns.temperature}°C
                  </span>
                )}
                {record.vitalSigns.heartRate != null && (
                  <span className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs">
                    <Heart className="h-3.5 w-3.5 text-muted-foreground" />{record.vitalSigns.heartRate} bpm
                  </span>
                )}
                {record.vitalSigns.weight != null && (
                  <span className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs">
                    <Weight className="h-3.5 w-3.5 text-muted-foreground" />{record.vitalSigns.weight} kg
                  </span>
                )}
                {record.vitalSigns.respiratoryRate != null && (
                  <span className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />{record.vitalSigns.respiratoryRate} /min
                  </span>
                )}
              </div>
            )}

            {/* Summary */}
            <section>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Summary</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{record.summary}</p>
            </section>

            {record.diagnoses && (
              <>
                <Separator />
                <section>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><ClipboardList className="h-3 w-3" />Diagnoses</span>
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{record.diagnoses}</p>
                </section>
              </>
            )}

            {record.treatments && (
              <>
                <Separator />
                <section>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Stethoscope className="h-3 w-3" />Treatments</span>
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{record.treatments}</p>
                </section>
              </>
            )}

            {record.prescriptions && (
              <>
                <Separator />
                <section>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Pill className="h-3 w-3" />Prescriptions</span>
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{record.prescriptions}</p>
                </section>
              </>
            )}

            <Separator />

            {/* Meta */}
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Info</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><User className="h-4 w-4 shrink-0" />{record.patient.name}</div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 shrink-0" />{formatDate(record.visitDate)}</div>
                {record.createdBy && (
                  <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4 shrink-0" />{record.createdBy.name}</div>
                )}
                {record.bodyConditionScore != null && (
                  <div className="flex items-center gap-2"><Weight className="h-4 w-4 shrink-0" />BCS {record.bodyConditionScore}/9</div>
                )}
                {record.nextVisitRecommended && (
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 shrink-0" />Next visit: {formatDate(record.nextVisitRecommended)}</div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </DrawerShell>
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
    <DrawerShell open={!!selectedId} onClose={onClose} width="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between border-b px-5 py-4">
        {isLoading || !result ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-1.5"><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-28" /></div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">{result.panel.name}</h2>
              <p className="text-sm text-muted-foreground">{result.patient.name} · {formatDate(result.testDate)}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 shrink-0">
          {result && (
            <Badge variant={getLabStatusVariant(result.status)} className="capitalize">{result.status}</Badge>
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
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <div className="space-y-5 px-5 py-4">
            <div className="grid grid-cols-3 gap-3">
              <StatTile label="Normal" value={result.values.filter(v => v.status === "normal").length} colorClass="text-emerald-600 dark:text-emerald-400" />
              <StatTile label="Abnormal" value={result.abnormalCount} colorClass="text-amber-600 dark:text-amber-400" />
              <StatTile label="Critical" value={result.criticalCount} colorClass="text-red-600 dark:text-red-400" />
            </div>

            <Separator />

            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Test Values</p>
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
                        {val.test.abbreviation && <p className="text-xs text-muted-foreground">{val.test.abbreviation}</p>}
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
                        <Badge variant={getLabStatusVariant(val.status)} className="text-xs capitalize">
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
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Interpretation</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{result.interpretation}</p>
              </section>
            )}
            {result.notes && (
              <section>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{result.notes}</p>
              </section>
            )}

            <Separator />

            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Info</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><User className="h-4 w-4 shrink-0" />{result.patient.name}</div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 shrink-0" />{formatDate(result.testDate)}</div>
                {result.externalLab && <div className="flex items-center gap-2"><FlaskConical className="h-4 w-4 shrink-0" />{result.externalLab}</div>}
                {result.reviewedBy && (
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 shrink-0" />
                    Reviewed by {result.reviewedBy}{result.reviewedDate ? ` · ${formatDate(result.reviewedDate)}` : ""}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </DrawerShell>
  )
}

function PrescriptionDrawer({
  selectedId,
  onClose,
}: {
  selectedId: string | null
  onClose: () => void
}) {
  const { data: rx, isLoading } = usePrescriptionDetail(selectedId)
  const refillMutation = useRefillPrescription()
  const expired = rx ? isExpired(rx.expiresAt) : false

  return (
    <DrawerShell open={!!selectedId} onClose={onClose}>
      {/* Header */}
      <div className="flex items-start justify-between border-b px-5 py-4">
        {isLoading || !rx ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-1.5"><Skeleton className="h-5 w-36" /><Skeleton className="h-4 w-24" /></div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Pill className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold leading-tight">{rx.medication}</h2>
                {rx.isControlled && <ShieldAlert className="h-4 w-4 text-amber-600" />}
              </div>
              <p className="text-sm text-muted-foreground">{rx.patient.name}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 shrink-0">
          {rx && (
            <Badge variant={expired ? "destructive" : "default"}>
              {expired ? "Expired" : "Active"}
            </Badge>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {isLoading || !rx ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : (
          <div className="space-y-5 px-5 py-4">
            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground">Dosage</p><p className="font-medium">{rx.dosage}</p></div>
              <div><p className="text-xs text-muted-foreground">Frequency</p><p className="font-medium">{rx.frequency}</p></div>
              <div><p className="text-xs text-muted-foreground">Duration</p><p className="font-medium">{rx.duration}</p></div>
              <div><p className="text-xs text-muted-foreground">Veterinarian</p><p className="font-medium">{rx.veterinarian ?? "—"}</p></div>
            </div>

            {rx.instructions && (
              <>
                <Separator />
                <section>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Instructions</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{rx.instructions}</p>
                </section>
              </>
            )}

            {rx.notes && (
              <>
                <Separator />
                <section>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{rx.notes}</p>
                </section>
              </>
            )}

            <Separator />

            {/* Dates + refills */}
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Info</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><User className="h-4 w-4 shrink-0" />{rx.patient.name}</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />Prescribed {formatDate(rx.prescribedAt)}
                </div>
                <div className={`flex items-center gap-2 ${expired ? "text-red-600 dark:text-red-400" : ""}`}>
                  <Clock className="h-4 w-4 shrink-0" />
                  {expired ? "Expired" : "Expires"} {formatDate(rx.expiresAt)}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>Refills</span>
                  <span className="font-medium text-foreground">{rx.refillsRemaining} / {rx.refillsTotal} remaining</span>
                </div>
              </div>
            </section>

            {rx.refillsRemaining > 0 && !expired && (
              <>
                <Separator />
                <Button
                  className="w-full"
                  onClick={() => refillMutation.mutate(rx.id)}
                  disabled={refillMutation.isPending}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  {refillMutation.isPending ? "Refilling…" : "Refill Prescription"}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </DrawerShell>
  )
}

function StatTile({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-3 text-center">
      <p className={`text-2xl font-bold tabular-nums ${colorClass}`}>{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

// ─── share modal ──────────────────────────────────────────────────────────────

const SHARE_CHANNELS = [
  { id: "slack",    name: "Slack",   abbr: "Sl", bg: "#4A154B", fg: "#fff" },
  { id: "teams",    name: "Teams",   abbr: "Te", bg: "#5B5EA6", fg: "#fff" },
  { id: "whatsapp", name: "WhatsApp",abbr: "WA", bg: "#25D366", fg: "#fff" },
  { id: "telegram", name: "Telegram",abbr: "Tg", bg: "#229ED9", fg: "#fff" },
] as const

function ShareModal({
  open,
  onClose,
  title,
}: {
  open: boolean
  onClose: () => void
  title: string
}) {
  function handleChannel(id: string) {
    toast.info(`${id.charAt(0).toUpperCase() + id.slice(1)} integration coming soon.`)
    onClose()
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success("Link copied to clipboard.")
    })
    onClose()
  }

  function handleEmail() {
    const subject = encodeURIComponent(`Medical Record: ${title}`)
    const body = encodeURIComponent(`Please find the medical record attached.\n\nRecord: ${title}\nLink: ${window.location.href}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            key="share-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            key="share-modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative z-10 w-full max-w-sm"
          >
            <div className="rounded-2xl border bg-card p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-foreground">Share Record</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[220px]">{title}</p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-sm opacity-60 transition-opacity hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Chat app channels (scaffolded) */}
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Send via
              </p>
              <div className="grid grid-cols-4 gap-3 mb-5">
                {SHARE_CHANNELS.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => handleChannel(ch.id)}
                    className="flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-colors hover:bg-accent/50"
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                      style={{ background: ch.bg, color: ch.fg }}
                    >
                      {ch.abbr}
                    </span>
                    {ch.name}
                  </button>
                ))}
              </div>

              <Separator className="mb-4" />

              {/* Implemented actions */}
              <div className="space-y-2">
                <button
                  onClick={handleEmail}
                  className="flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors hover:bg-accent/50"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Send via Email
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors hover:bg-accent/50"
                >
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  Copy Link
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Chat integrations can be configured in{" "}
                <span className="underline underline-offset-2 cursor-pointer hover:text-foreground">
                  Admin → Integrations
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ─── create form (unchanged) ──────────────────────────────────────────────────

function CreateMedicalRecordForm({
  patients,
  onCancel,
  onSubmit,
  isSubmitting,
}: {
  patients: Patient[]
  onCancel: () => void
  onSubmit: (data: {
    patientId: string
    visitDate: string
    summary: string
    diagnoses?: string
    treatments?: string
    prescriptions?: string
    bodyConditionScore?: number
    nextVisitRecommended?: string
    vitalSigns?: {
      temperature?: number
      heartRate?: number
      respiratoryRate?: number
      bloodPressureSystolic?: number
      bloodPressureDiastolic?: number
      weight?: number
      bodyConditionScore?: number
      notes?: string
      recordedAt?: string
    }
  }) => Promise<void>
  isSubmitting: boolean
}) {
  const [form, setForm] = useState({
    patientId: "",
    visitDate: new Date().toISOString().slice(0, 10),
    summary: "",
    diagnoses: "",
    treatments: "",
    prescriptions: "",
    bodyConditionScore: "",
    nextVisitRecommended: "",
    vitalSigns: {
      temperature: "",
      heartRate: "",
      respiratoryRate: "",
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      weight: "",
      bodyConditionScore: "",
      notes: "",
    },
  })

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateVital = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, vitalSigns: { ...prev.vitalSigns, [field]: value } }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      patientId: form.patientId,
      visitDate: form.visitDate,
      summary: form.summary,
      diagnoses: form.diagnoses || undefined,
      treatments: form.treatments || undefined,
      prescriptions: form.prescriptions || undefined,
      bodyConditionScore: form.bodyConditionScore ? parseInt(form.bodyConditionScore) : undefined,
      nextVisitRecommended: form.nextVisitRecommended || undefined,
      vitalSigns:
        form.vitalSigns.temperature || form.vitalSigns.heartRate || form.vitalSigns.respiratoryRate || form.vitalSigns.weight
          ? {
              temperature: form.vitalSigns.temperature ? parseFloat(form.vitalSigns.temperature) : undefined,
              heartRate: form.vitalSigns.heartRate ? parseInt(form.vitalSigns.heartRate) : undefined,
              respiratoryRate: form.vitalSigns.respiratoryRate ? parseInt(form.vitalSigns.respiratoryRate) : undefined,
              bloodPressureSystolic: form.vitalSigns.bloodPressureSystolic ? parseInt(form.vitalSigns.bloodPressureSystolic) : undefined,
              bloodPressureDiastolic: form.vitalSigns.bloodPressureDiastolic ? parseInt(form.vitalSigns.bloodPressureDiastolic) : undefined,
              weight: form.vitalSigns.weight ? parseFloat(form.vitalSigns.weight) : undefined,
              bodyConditionScore: form.vitalSigns.bodyConditionScore ? parseInt(form.vitalSigns.bodyConditionScore) : undefined,
              notes: form.vitalSigns.notes || undefined,
            }
          : undefined,
    }
    onSubmit(payload)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">New Medical Record</h1>
        <p className="mt-1 text-muted-foreground">Record a new patient visit.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visit Information</CardTitle>
            <CardDescription>Basic details about the visit</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Patient *</Label>
              <PatientSearch
                patients={patients}
                value={form.patientId}
                onChange={(id) => updateField("patientId", id)}
                placeholder="Select patient…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visitDate">Visit Date *</Label>
              <Input id="visitDate" type="date" required value={form.visitDate} onChange={(e) => updateField("visitDate", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="summary">Summary *</Label>
              <Textarea id="summary" required placeholder="Chief complaint and overall assessment..." value={form.summary} onChange={(e) => updateField("summary", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="diagnoses">Diagnoses</Label>
              <Textarea id="diagnoses" placeholder="Primary and secondary diagnoses..." value={form.diagnoses} onChange={(e) => updateField("diagnoses", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="treatments">Treatments</Label>
              <Textarea id="treatments" placeholder="Procedures, therapies, and treatments performed..." value={form.treatments} onChange={(e) => updateField("treatments", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="prescriptions">Prescriptions</Label>
              <Textarea id="prescriptions" placeholder="Medications prescribed..." value={form.prescriptions} onChange={(e) => updateField("prescriptions", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bodyConditionScore">Body Condition Score (1-9)</Label>
              <Input id="bodyConditionScore" type="number" min={1} max={9} value={form.bodyConditionScore} onChange={(e) => updateField("bodyConditionScore", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextVisitRecommended">Next Visit Recommended</Label>
              <Input id="nextVisitRecommended" type="date" value={form.nextVisitRecommended} onChange={(e) => updateField("nextVisitRecommended", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vital Signs</CardTitle>
            <CardDescription>Optional measurements taken during the visit</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="temp">Temperature (°C)</Label>
              <Input id="temp" type="number" step="0.1" placeholder="38.5" value={form.vitalSigns.temperature} onChange={(e) => updateVital("temperature", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hr">Heart Rate (bpm)</Label>
              <Input id="hr" type="number" placeholder="120" value={form.vitalSigns.heartRate} onChange={(e) => updateVital("heartRate", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rr">Respiratory Rate (/min)</Label>
              <Input id="rr" type="number" placeholder="20" value={form.vitalSigns.respiratoryRate} onChange={(e) => updateVital("respiratoryRate", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bps">BP Systolic (mmHg)</Label>
              <Input id="bps" type="number" placeholder="120" value={form.vitalSigns.bloodPressureSystolic} onChange={(e) => updateVital("bloodPressureSystolic", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bpd">BP Diastolic (mmHg)</Label>
              <Input id="bpd" type="number" placeholder="80" value={form.vitalSigns.bloodPressureDiastolic} onChange={(e) => updateVital("bloodPressureDiastolic", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" step="0.1" placeholder="25.0" value={form.vitalSigns.weight} onChange={(e) => updateVital("weight", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vitalBcs">Body Condition Score (1-9)</Label>
              <Input id="vitalBcs" type="number" min={1} max={9} value={form.vitalSigns.bodyConditionScore} onChange={(e) => updateVital("bodyConditionScore", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-3">
              <Label htmlFor="vitalNotes">Notes</Label>
              <Textarea id="vitalNotes" placeholder="Additional observations..." value={form.vitalSigns.notes} onChange={(e) => updateVital("notes", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Record"}</Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

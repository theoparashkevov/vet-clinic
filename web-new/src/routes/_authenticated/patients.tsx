import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Plus,
  PawPrint,
  Pencil,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAuth } from '../../lib/api'
import { PatientFormModal } from '../../components/patients/PatientFormModal'
import { PatientDrawer } from '../../components/patients/PatientDrawer'
import type { Patient, Owner, PaginatedResult } from '../../components/patients/types'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { cn } from '../../lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { modalVariants, backdropVariants } from '../../lib/animations'

export const Route = createFileRoute('/_authenticated/patients')({
  component: PatientsPage,
})

const SPECIES_FILTERS = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Hamster', 'Other']
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'deceased', label: 'Deceased' },
]

// ─── helpers ────────────────────────────────────────────────────────────────

function calculateAge(birthdate?: string | null): string {
  if (!birthdate) return '—'
  const birth = new Date(birthdate)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--
  if (years > 0) return `${years} yr`
  const months = Math.max(
    0,
    (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth(),
  )
  return months < 1 ? '< 1 mo' : `${months} mo`
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'active':   return 'default'
    case 'inactive': return 'secondary'
    case 'deceased': return 'destructive'
    default:         return 'outline'
  }
}

// ─── data hooks ─────────────────────────────────────────────────────────────

function usePatients(search: string, page: number, limit: number, species: string, status: string) {
  return useQuery({
    queryKey: ['patients', 'list', { search, page, limit, species, status }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (species) params.set('species', species)
      if (status) params.set('status', status)
      params.set('page', String(page))
      params.set('limit', String(limit))
      const res = await fetchWithAuth(`/v1/patients?${params.toString()}`)
      return res as PaginatedResult<Patient>
    },
  })
}

function useOwners(search: string, page: number, limit: number) {
  return useQuery({
    queryKey: ['owners', 'list', { search, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      params.set('page', String(page))
      params.set('limit', String(limit))
      const res = await fetchWithAuth(`/v1/owners?${params.toString()}`)
      return res as PaginatedResult<Owner & { _count?: { patients: number } }>
    },
  })
}

function useDeletePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchWithAuth(`/v1/patients/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  })
}

function useDeleteOwner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchWithAuth(`/v1/owners/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['owners'] }),
  })
}

function useOwnerPatients(ownerId: string | null) {
  return useQuery({
    queryKey: ['patients', 'byOwner', ownerId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/patients?ownerId=${ownerId}&limit=50`)
      return ((res as PaginatedResult<Patient>).data) ?? []
    },
    enabled: !!ownerId,
  })
}

// ─── pagination bar ──────────────────────────────────────────────────────────

function Pagination({
  meta,
  page,
  setPage,
  label,
}: {
  meta: PaginatedResult<unknown>['meta']
  page: number
  setPage: (p: number) => void
  label: string
}) {
  if (meta.totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} {label}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Page {meta.page} of {meta.totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => setPage(Math.min(meta.totalPages, page + 1))} disabled={page >= meta.totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── owner row expansion ────────────────────────────────────────────────────

function OwnerPatientsRow({
  ownerId,
  colSpan,
  onSelectPatient,
}: {
  ownerId: string
  colSpan: number
  onSelectPatient: (p: Patient) => void
}) {
  const { data: patients, isLoading } = useOwnerPatients(ownerId)

  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="border-t bg-muted/30 px-6 py-3">
            {isLoading ? (
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-40 rounded-lg" />)}
              </div>
            ) : !patients || patients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No animals registered for this owner.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {patients.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => onSelectPatient(patient)}
                    className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-left text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <PawPrint className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium leading-tight">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {patient.species}{patient.breed ? ` · ${patient.breed}` : ''}
                      </p>
                    </div>
                    <Badge
                      variant={statusBadgeVariant(patient.status)}
                      className="ml-1 shrink-0 text-xs capitalize"
                    >
                      {patient.status}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </td>
    </tr>
  )
}

// ─── page ────────────────────────────────────────────────────────────────────

function PatientsPage() {
  // patients tab state
  const [patientSearch, setPatientSearch] = useState('')
  const [patientPage, setPatientPage] = useState(1)
  const [speciesFilter, setSpeciesFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // owners tab state
  const [ownerSearch, setOwnerSearch] = useState('')
  const [ownerPage, setOwnerPage] = useState(1)
  const [expandedOwnerId, setExpandedOwnerId] = useState<string | null>(null)

  const limit = 10

  // modals / drawers
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const [deletePatientOpen, setDeletePatientOpen] = useState(false)
  const [deletePatientTarget, setDeletePatientTarget] = useState<Patient | null>(null)

  const [deleteOwnerOpen, setDeleteOwnerOpen] = useState(false)
  const [deleteOwnerTarget, setDeleteOwnerTarget] = useState<(Owner & { _count?: { patients: number } }) | null>(null)

  // queries
  const { data: patientData, isLoading: patientsLoading } = usePatients(patientSearch, patientPage, limit, speciesFilter, statusFilter)
  const { data: ownerData, isLoading: ownersLoading } = useOwners(ownerSearch, ownerPage, limit)
  const deletePatientMutation = useDeletePatient()
  const deleteOwnerMutation = useDeleteOwner()

  const patients = patientData?.data ?? []
  const owners = ownerData?.data ?? []

  // handlers — patients
  const handleOpenCreate = useCallback(() => { setEditingPatient(null); setModalOpen(true) }, [])
  const handleOpenEdit = useCallback((patient: Patient) => { setEditingPatient(patient); setSelectedPatient(null); setModalOpen(true) }, [])
  const handleCloseModal = useCallback(() => { setModalOpen(false); setEditingPatient(null) }, [])

  const handlePatientSearchChange = (v: string) => { setPatientSearch(v); setPatientPage(1) }
  const handleSpeciesFilter = (s: string) => { setSpeciesFilter((p) => (p === s ? '' : s)); setPatientPage(1) }
  const handleStatusFilter = (s: string) => { setStatusFilter(s); setPatientPage(1) }

  const handleConfirmDeletePatient = useCallback(() => {
    if (!deletePatientTarget) return
    deletePatientMutation.mutate(deletePatientTarget.id, {
      onSuccess: () => {
        setDeletePatientOpen(false)
        setDeletePatientTarget(null)
        if (selectedPatient?.id === deletePatientTarget.id) setSelectedPatient(null)
      },
    })
  }, [deletePatientMutation, deletePatientTarget, selectedPatient])

  // handlers — owners
  const handleOwnerSearchChange = (v: string) => { setOwnerSearch(v); setOwnerPage(1) }

  const handleConfirmDeleteOwner = useCallback(() => {
    if (!deleteOwnerTarget) return
    deleteOwnerMutation.mutate(deleteOwnerTarget.id, {
      onSuccess: () => { setDeleteOwnerOpen(false); setDeleteOwnerTarget(null) },
    })
  }, [deleteOwnerMutation, deleteOwnerTarget])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Manage patients and their owners.</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Patient
        </Button>
      </div>

      <Tabs defaultValue="animals">
        <TabsList>
          <TabsTrigger value="animals" className="gap-1.5">
            <PawPrint className="h-3.5 w-3.5" /> Animals
          </TabsTrigger>
          <TabsTrigger value="owners" className="gap-1.5">
            <User className="h-3.5 w-3.5" /> Owners
          </TabsTrigger>
        </TabsList>

        {/* ── Animals tab ─────────────────────────────────────────────────── */}
        <TabsContent value="animals" className="mt-4 space-y-4">
          {/* Search + status */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, species, or owner..."
                value={patientSearch}
                onChange={(e) => handlePatientSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter || '__all__'} onValueChange={(v) => handleStatusFilter(v === '__all__' ? '' : v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value || '__all__'}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Species pills */}
          <div className="flex flex-wrap gap-2">
            {SPECIES_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSpeciesFilter(s)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  speciesFilter === s
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
                )}
              >
                {s}
              </button>
            ))}
            {speciesFilter && (
              <button
                type="button"
                onClick={() => { setSpeciesFilter(''); setPatientPage(1) }}
                className="rounded-full border border-dashed border-muted-foreground px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full max-w-[120px]" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : patients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-8 w-8 opacity-50" />
                        <p className="mt-2 text-sm">No patients found.</p>
                        {(patientSearch || speciesFilter || statusFilter) && (
                          <Button variant="link" size="sm" onClick={() => { handlePatientSearchChange(''); setSpeciesFilter(''); setStatusFilter('') }}>
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient) => (
                    <TableRow key={patient.id} className="cursor-pointer" onClick={() => setSelectedPatient(patient)}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <PawPrint className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium">{patient.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{patient.species}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{patient.breed ?? '—'}</TableCell>
                      <TableCell className="text-sm">{patient.owner?.name ?? '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{calculateAge(patient.birthdate)}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(patient.status)} className="capitalize text-xs">
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleOpenEdit(patient)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { setDeletePatientTarget(patient); setDeletePatientOpen(true) }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {patientData?.meta && (
            <Pagination meta={patientData.meta} page={patientPage} setPage={setPatientPage} label="patients" />
          )}
        </TabsContent>

        {/* ── Owners tab ──────────────────────────────────────────────────── */}
        <TabsContent value="owners" className="mt-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, phone, or email..."
              value={ownerSearch}
              onChange={(e) => handleOwnerSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Patients</TableHead>
                  <TableHead className="w-[52px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ownersLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full max-w-[120px]" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : owners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-8 w-8 opacity-50" />
                        <p className="mt-2 text-sm">No owners found.</p>
                        {ownerSearch && (
                          <Button variant="link" size="sm" onClick={() => handleOwnerSearchChange('')}>
                            Clear search
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  owners.map((owner) => {
                    const isExpanded = expandedOwnerId === owner.id
                    return (
                      <AnimatePresence key={owner.id}>
                        <TableRow
                          className="cursor-pointer"
                          onClick={() => setExpandedOwnerId(isExpanded ? null : owner.id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                transition={{ duration: 0.15 }}
                                className="shrink-0"
                              >
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              </motion.div>
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="text-sm font-medium">{owner.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              {owner.phone}
                            </div>
                          </TableCell>
                          <TableCell>
                            {owner.email ? (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                {owner.email}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {owner.city ? (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                {owner.city}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {owner._count?.patients ?? 0}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { setDeleteOwnerTarget(owner); setDeleteOwnerOpen(true) }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <OwnerPatientsRow
                            key={`${owner.id}-patients`}
                            ownerId={owner.id}
                            colSpan={6}
                            onSelectPatient={setSelectedPatient}
                          />
                        )}
                      </AnimatePresence>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {ownerData?.meta && (
            <Pagination meta={ownerData.meta} page={ownerPage} setPage={setOwnerPage} label="owners" />
          )}
        </TabsContent>
      </Tabs>

      {/* Patient detail drawer */}
      <PatientDrawer
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onEdit={handleOpenEdit}
      />

      {/* Create / edit modal */}
      <PatientFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSuccess={() => { setModalOpen(false); setEditingPatient(null) }}
        patient={editingPatient}
      />

      {/* Delete patient confirmation */}
      <AnimatePresence>
        {deletePatientOpen && deletePatientTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-black/50"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setDeletePatientOpen(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="rounded-xl border bg-card p-6 shadow-2xl">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">Delete Patient</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">This action cannot be undone.</p>
                  </div>
                </div>
                <div className="mb-5 flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <PawPrint className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium leading-tight">{deletePatientTarget.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {deletePatientTarget.species}{deletePatientTarget.breed ? ` · ${deletePatientTarget.breed}` : ''}{deletePatientTarget.owner ? ` · ${deletePatientTarget.owner.name}` : ''}
                    </p>
                  </div>
                  <Badge variant={statusBadgeVariant(deletePatientTarget.status)} className="ml-auto shrink-0 capitalize text-xs">
                    {deletePatientTarget.status}
                  </Badge>
                </div>
                <p className="mb-6 text-sm text-muted-foreground">
                  Deleting <strong className="text-foreground">{deletePatientTarget.name}</strong> will permanently remove all associated records, appointments, and history.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setDeletePatientOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={handleConfirmDeletePatient} disabled={deletePatientMutation.isPending}>
                    {deletePatientMutation.isPending ? 'Deleting…' : 'Delete Patient'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete owner confirmation */}
      <AnimatePresence>
        {deleteOwnerOpen && deleteOwnerTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-black/50"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setDeleteOwnerOpen(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="rounded-xl border bg-card p-6 shadow-2xl">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">Delete Owner</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">This action cannot be undone.</p>
                  </div>
                </div>
                <div className="mb-5 flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium leading-tight">{deleteOwnerTarget.name}</p>
                    {deleteOwnerTarget._count?.patients != null && (
                      <p className="text-xs text-muted-foreground">
                        {deleteOwnerTarget._count.patients} linked patient{deleteOwnerTarget._count.patients !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <p className="mb-6 text-sm text-muted-foreground">
                  Deleting <strong className="text-foreground">{deleteOwnerTarget.name}</strong> will fail if they still have linked patients — remove or reassign those first.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setDeleteOwnerOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={handleConfirmDeleteOwner} disabled={deleteOwnerMutation.isPending}>
                    {deleteOwnerMutation.isPending ? 'Deleting…' : 'Delete Owner'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Plus,
  MoreHorizontal,
  PawPrint,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { fetchWithAuth } from '../../lib/api'
import { PatientFormModal } from '../../components/patients/PatientFormModal'
import type { Patient, PaginatedResult } from '../../components/patients/types'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'

export const Route = createFileRoute('/_authenticated/patients')({
  component: PatientsPage,
})

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
    (now.getFullYear() - birth.getFullYear()) * 12 +
      now.getMonth() -
      birth.getMonth()
  )
  return months < 1 ? '< 1 mo' : `${months} mo`
}

function usePatients(search: string, page: number, limit: number) {
  return useQuery({
    queryKey: ['patients', 'list', { search, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      params.set('page', String(page))
      params.set('limit', String(limit))
      const res = await fetchWithAuth(`/v1/patients?${params.toString()}`)
      return res as PaginatedResult<Patient>
    },
  })
}

function useDeletePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await fetchWithAuth(`/v1/patients/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

function PatientsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)

  const { data, isLoading } = usePatients(search, page, limit)
  const deleteMutation = useDeletePatient()

  const patients = data?.data ?? []
  const meta = data?.meta

  const handleOpenCreate = useCallback(() => {
    setEditingPatient(null)
    setModalOpen(true)
  }, [])

  const handleOpenEdit = useCallback((patient: Patient) => {
    setEditingPatient(patient)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setEditingPatient(null)
  }, [])

  const handleOpenDelete = useCallback((patient: Patient) => {
    setDeleteTarget(patient)
    setDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
      },
    })
  }, [deleteMutation, deleteTarget])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage your patients and their information.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Patient
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name, species, or owner..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Species</TableHead>
              <TableHead>Breed</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Age</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="h-8 w-8 opacity-50" />
                    <p className="mt-2 text-sm">No patients found.</p>
                    {search && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleSearchChange('')}
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <Link to="/patients/$id" params={{ id: patient.id }} className="flex items-center gap-2 hover:underline">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <PawPrint className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">
                        {patient.name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{patient.species}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {patient.breed ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {patient.owner?.name ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {calculateAge(patient.birthdate)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to="/patients/$id" params={{ id: patient.id }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleOpenEdit(patient)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleOpenDelete(patient)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(meta.page - 1) * meta.limit + 1}–
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}{' '}
            patients
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(meta.totalPages, p + 1))
              }
              disabled={page >= meta.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <PatientFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSuccess={() => {
          setModalOpen(false)
          setEditingPatient(null)
        }}
        patient={editingPatient}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Patient</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

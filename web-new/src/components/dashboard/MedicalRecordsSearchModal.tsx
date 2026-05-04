import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Search, PawPrint, ArrowRight, FileText } from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Skeleton } from "../ui/skeleton"

interface Patient {
  id: string
  name: string
  species: string
  breed?: string | null
  owner: { id: string; name: string }
}

interface Props {
  open: boolean
  onClose: () => void
}

function usePatientSearch(search: string) {
  return useQuery({
    queryKey: ["patients", "search", search],
    queryFn: async (): Promise<Patient[]> => {
      const params = new URLSearchParams({ search, limit: "10" })
      const res = await fetchWithAuth(`/v1/patients?${params}`)
      return (res as { data?: Patient[] }).data ?? []
    },
    enabled: search.length >= 2,
  })
}

export function MedicalRecordsSearchModal({ open, onClose }: Props) {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")

  const { data: patients, isLoading } = usePatientSearch(search)

  function handleSelect(patientId: string) {
    onClose()
    setSearch("")
    navigate({ to: "/patients/$id", params: { id: patientId }, search: { tab: "records" } })
  }

  function handleClose() {
    setSearch("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Medical Records
          </DialogTitle>
          <DialogDescription>Search for a patient to view their records</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Patient name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="min-h-[160px]">
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          )}

          {!isLoading && search.length >= 2 && patients && patients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1.5"
            >
              {patients.map((patient) => (
                <motion.button
                  key={patient.id}
                  whileHover={{ x: 2 }}
                  onClick={() => handleSelect(patient.id)}
                  className="group flex w-full items-center gap-3 rounded-lg border border-input bg-card px-3 py-3 text-left transition-colors hover:bg-accent"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <PawPrint className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{patient.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {patient.species}
                      {patient.breed ? ` · ${patient.breed}` : ""}
                      {" · "}
                      Owner: {patient.owner.name}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </motion.button>
              ))}
            </motion.div>
          )}

          {!isLoading && search.length >= 2 && patients?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground">
              <PawPrint className="mb-2 h-8 w-8 opacity-30" />
              <p>No patients found for "{search}"</p>
            </div>
          )}

          {search.length < 2 && (
            <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground">
              <Search className="mb-2 h-8 w-8 opacity-30" />
              <p>Type at least 2 characters to search</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

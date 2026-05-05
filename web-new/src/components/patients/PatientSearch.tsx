import { useState, useCallback } from "react"
import { PawPrint, X, Search } from "lucide-react"
import { Input } from "../ui/input"
import { Card, CardContent } from "../ui/card"
import { cn } from "../../lib/utils"

interface Patient {
  id: string
  name: string
  species: string
  owner?: { name: string }
}

interface PatientSearchProps {
  patients: Patient[]
  value: string
  onChange: (patientId: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  counts?: Record<string, number>
}

export function PatientSearch({
  patients,
  value,
  onChange,
  placeholder = "Search patients...",
  disabled,
  className,
  counts,
}: PatientSearchProps) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)

  const selectedPatient = patients.find((p) => p.id === value) ?? null

  const filtered = search.trim()
    ? patients.filter((p) => {
        const q = search.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.species.toLowerCase().includes(q) ||
          (p.owner?.name.toLowerCase().includes(q) ?? false)
        )
      })
    : patients.slice(0, 8)

  const handleSelect = useCallback(
    (patient: Patient) => {
      onChange(patient.id)
      setSearch("")
      setOpen(false)
    },
    [onChange]
  )

  const handleClear = useCallback(() => {
    onChange("")
    setSearch("")
    setOpen(false)
  }, [onChange])

  return (
    <div className={cn("relative", className)}>
      {selectedPatient ? (
        <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-transparent px-3 shadow-sm">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <PawPrint className="h-3 w-3 text-primary" />
          </div>
          <span className="flex-1 text-sm font-medium leading-tight truncate">
            {selectedPatient.name}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {selectedPatient.species}
            {selectedPatient.owner ? ` · ${selectedPatient.owner.name}` : ""}
          </span>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-1 shrink-0 rounded-sm opacity-60 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            disabled={disabled}
            className="pl-9"
          />
        </div>
      )}

      {open && !selectedPatient && (
        <>
          <Card className="absolute z-50 mt-1 w-full max-h-64 overflow-auto shadow-lg">
            <CardContent className="p-1">
              {filtered.length > 0 ? (
                filtered.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => handleSelect(patient)}
                    className="w-full text-left rounded-sm px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <PawPrint className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-tight">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {patient.species}
                          {patient.owner ? ` · ${patient.owner.name}` : ""}
                        </p>
                      </div>
                      {counts != null && counts[patient.id] != null && (
                        <span className="ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                          {counts[patient.id]}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  {patients.length === 0 ? "Loading patients…" : "No patients found."}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        </>
      )}
    </div>
  )
}

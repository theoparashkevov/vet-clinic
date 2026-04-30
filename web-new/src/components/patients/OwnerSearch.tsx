import { useState, useEffect, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, X } from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Input } from "../../components/ui/input"
import { Card, CardContent } from "../../components/ui/card"
import { cn } from "../../lib/utils"
import type { Owner, PaginatedResult } from "./types"

interface OwnerSearchProps {
  value: string | undefined
  onChange: (ownerId: string, ownerName: string) => void
  disabled?: boolean
}

export function OwnerSearch({ value, onChange, disabled }: OwnerSearchProps) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [selectedName, setSelectedName] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["owners", "search", search],
    queryFn: async (): Promise<PaginatedResult<Owner>> => {
      if (!search || search.length < 2) return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }
      const res = await fetchWithAuth(`/v1/owners?search=${encodeURIComponent(search)}&limit=10`)
      return res as PaginatedResult<Owner>
    },
    enabled: search.length >= 2,
  })

  useEffect(() => {
    if (!value) {
      setSelectedName("")
      setSearch("")
    }
  }, [value])

  const handleSelect = useCallback((owner: Owner) => {
    onChange(owner.id, owner.name)
    setSelectedName(owner.name)
    setOpen(false)
    setSearch("")
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange("", "")
    setSelectedName("")
    setSearch("")
    setOpen(false)
  }, [onChange])

  return (
    <div className="relative">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
        Owner *
      </label>
      {selectedName ? (
        <div className="flex items-center gap-2 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
          <span className="flex-1">{selectedName}</span>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            disabled={disabled}
            className="pl-9"
          />
          {open && search.length >= 2 && (
            <Card className="absolute z-50 mt-1 w-full max-h-60 overflow-auto shadow-lg">
              <CardContent className="p-1">
                {isLoading ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
                ) : data?.data && data.data.length > 0 ? (
                  data.data.map((owner) => (
                    <button
                      key={owner.id}
                      type="button"
                      onClick={() => handleSelect(owner)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-sm transition-colors",
                        "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <div className="font-medium">{owner.name}</div>
                      <div className="text-xs text-muted-foreground">{owner.phone}{owner.email ? ` · ${owner.email}` : ""}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No owners found.</div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}

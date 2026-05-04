import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useState, useEffect, useRef } from "react"
import { Users, Search, Phone, Mail, MapPin, PawPrint, X } from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Input } from "../../components/ui/input"
import { Skeleton } from "../../components/ui/skeleton"
import { Badge } from "../../components/ui/badge"
import { cn } from "../../lib/utils"

export const Route = createFileRoute("/_authenticated/owners")({
  component: OwnersPage,
})

interface Owner {
  id: string
  name: string
  phone: string
  email?: string | null
  address?: string | null
  city?: string | null
  isActive: boolean
  _count?: { patients: number }
}

function useOwners(search: string, page: number) {
  return useQuery({
    queryKey: ["owners", "list", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (search) params.set("search", search)
      const res = await fetchWithAuth(`/v1/owners?${params}`)
      return res as {
        data: Owner[]
        meta: { total: number; page: number; limit: number; totalPages: number }
      }
    },
  })
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function OwnersPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 350)

  const { data, isLoading } = useOwners(debouncedSearch, page)
  const owners = data?.data ?? []
  const meta = data?.meta

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    setPage(1)
  }, [debouncedSearch])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Owners</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {meta ? `${meta.total} owner${meta.total !== 1 ? "s" : ""}` : ""}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : owners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Users className="mb-3 h-10 w-10 opacity-25" />
          <p className="text-sm">No owners found.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {owners.map((owner) => (
            <Link
              key={owner.id}
              to="/owners/$id"
              params={{ id: owner.id }}
              className="group rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                      {owner.name}
                    </p>
                    <Badge
                      variant={owner.isActive ? "default" : "secondary"}
                      className="mt-0.5 text-xs"
                    >
                      {owner.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                {owner._count?.patients != null && (
                  <span className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground">
                    <PawPrint className="h-3.5 w-3.5" />
                    {owner._count.patients}
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{owner.phone}</span>
                </div>
                {owner.email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{owner.email}</span>
                  </div>
                )}
                {(owner.address || owner.city) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {[owner.address, owner.city].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs transition-colors",
                page <= 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-accent"
              )}
            >
              ←
            </button>
            <span className="px-3">{meta.page} / {meta.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs transition-colors",
                page >= meta.totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-accent"
              )}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

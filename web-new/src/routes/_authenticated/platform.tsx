import { createFileRoute, redirect } from "@tanstack/react-router"
import { useState, useMemo, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuthStore } from "../../stores/authStore"
import { fetchWithAuth } from "../../lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Separator } from "../../components/ui/separator"
import { Skeleton } from "../../components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
  UserPlus, Trash2, Search, X, ChevronDown, Check, Loader2,
  Pencil, KeyRound, Save, Palette, Users2, Layers, Bot, BrainCircuit, ScrollText,
} from "lucide-react"
import AIConfigTab from "../../components/admin/AIConfigTab"
import BotConfigTab from "../../components/admin/BotConfigTab"
import AuditLogsTab from "../../components/admin/AuditLogsTab"
import {
  applyPalette, savePalette, clearSavedPalette, loadSavedPalette,
  paletteFromPreset, PRESETS,
  LIGHT_DEFAULTS, DARK_DEFAULTS,
  type PaletteEntry,
} from "../../lib/themePalette"

export const Route = createFileRoute("/_authenticated/platform")({
  validateSearch: (s: Record<string, unknown>) => ({
    tab: (s.tab as string) ?? "platform",
  }),
  beforeLoad: () => {
    const { user } = useAuthStore.getState()
    if (!user?.isSuperAdmin) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: PlatformPage,
})

// ─── API types ────────────────────────────────────────────────────────────────

interface ApiRole { id: string; name: string; description?: string }
interface ApiUser {
  id: string
  name: string
  email: string
  isSuperAdmin: boolean
  isActive: boolean
  userRoles: { role: { id: string; name: string } }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_COLOR_MAP: Record<string, string> = {
  doctor:     "bg-blue-100   text-blue-800   border-blue-200   dark:bg-blue-900/30   dark:text-blue-300",
  nurse:      "bg-green-100  text-green-800  border-green-200  dark:bg-green-900/30  dark:text-green-300",
  registrar:  "bg-amber-100  text-amber-800  border-amber-200  dark:bg-amber-900/30  dark:text-amber-300",
  admin:      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
  superadmin: "bg-red-100    text-red-800    border-red-200    dark:bg-red-900/30    dark:text-red-300",
}
function roleColor(name: string) {
  return ROLE_COLOR_MAP[name.toLowerCase()] ??
    "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300"
}

// ─── Color palette ────────────────────────────────────────────────────────────

function ColorSwatch({ entry, onChange }: { entry: PaletteEntry; onChange: (val: string) => void }) {
  const id = `cp-${entry.key}`
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block cursor-pointer" title={entry.description}>
        <div
          className="h-14 w-full rounded-lg border-2 border-border cursor-pointer transition-transform hover:scale-[1.03] active:scale-[0.98]"
          style={{ backgroundColor: entry.value }}
        />
      </label>
      <input
        id={id}
        type="color"
        value={entry.value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
      <p className="text-center text-xs font-semibold">{entry.label}</p>
      <Input
        value={entry.value}
        onChange={(e) => {
          const v = e.target.value
          if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v)
        }}
        className="h-7 text-center font-mono text-xs"
        maxLength={7}
      />
      <p className="text-center text-[10px] text-muted-foreground leading-tight">{entry.description}</p>
    </div>
  )
}

// ─── Preset selector ─────────────────────────────────────────────────────────

function PresetSelector({
  activeId,
  onSelect,
}: {
  activeId: string | null
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = useState(false)

  const active = PRESETS.find((p) => p.id === activeId)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-accent ${open ? "bg-accent" : "bg-background"}`}
      >
        {active ? (
          <>
            <span className="flex gap-1">
              {active.preview.map((c) => (
                <span key={c} className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: c }} />
              ))}
            </span>
            <span className="font-medium">{active.name}</span>
          </>
        ) : (
          <span className="text-muted-foreground">Choose preset…</span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute left-0 top-11 z-40 w-[34rem] rounded-xl border bg-popover shadow-xl p-1.5"
            >
              <div className="grid grid-cols-2 gap-0.5">
                {PRESETS.map((preset) => {
                  const isActive = preset.id === activeId
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => { onSelect(preset.id); setOpen(false) }}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent ${isActive ? "bg-accent" : ""}`}
                    >
                      <span className="flex gap-1 shrink-0">
                        {preset.preview.map((c) => (
                          <span key={c} className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                        ))}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium leading-tight">{preset.name}</span>
                        <span className="block text-xs text-muted-foreground leading-tight truncate">{preset.description}</span>
                      </span>
                      {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Platform Info Tab ────────────────────────────────────────────────────────

function PlatformInfoTab() {
  const [saved, setSaved] = useState(false)
  const [identity, setIdentity] = useState({
    name: "Vet Clinic",
    tagline: "Caring for your pets like family",
    version: "1.0.0",
    supportEmail: "support@vetclinic.com",
  })

  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [lightPalette, setLightPalette] = useState<PaletteEntry[]>(
    () => loadSavedPalette()?.light ?? LIGHT_DEFAULTS
  )
  const [darkPalette, setDarkPalette] = useState<PaletteEntry[]>(
    () => loadSavedPalette()?.dark ?? DARK_DEFAULTS
  )

  // Apply to live CSS whenever either palette changes
  useEffect(() => {
    applyPalette(lightPalette, darkPalette)
  }, [lightPalette, darkPalette])

  function applyPreset(id: string) {
    const preset = PRESETS.find((p) => p.id === id)
    if (!preset) return
    setActivePreset(id)
    setLightPalette(paletteFromPreset(preset, 'light'))
    setDarkPalette(paletteFromPreset(preset, 'dark'))
  }

  function updateLight(key: string, value: string) {
    setActivePreset(null)
    setLightPalette((prev) => prev.map((e) => e.key === key ? { ...e, value } : e))
  }

  function updateDark(key: string, value: string) {
    setActivePreset(null)
    setDarkPalette((prev) => prev.map((e) => e.key === key ? { ...e, value } : e))
  }

  function save() {
    savePalette(lightPalette, darkPalette)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    toast.success("Platform settings saved")
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Identity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Layers className="h-4 w-4" /> Platform Identity
          </CardTitle>
          <CardDescription>Core information about this platform instance.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-xs">Platform name</Label>
            <Input
              value={identity.name}
              onChange={(e) => setIdentity((p) => ({ ...p, name: e.target.value }))}
              className="h-8 text-sm font-medium"
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-xs">Tagline</Label>
            <Input
              value={identity.tagline}
              onChange={(e) => setIdentity((p) => ({ ...p, tagline: e.target.value }))}
              className="h-8 text-sm"
              placeholder="Short description shown to users…"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Version</Label>
            <Input
              value={identity.version}
              onChange={(e) => setIdentity((p) => ({ ...p, version: e.target.value }))}
              className="h-8 text-sm font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Support email</Label>
            <Input
              type="email"
              value={identity.supportEmail}
              onChange={(e) => setIdentity((p) => ({ ...p, supportEmail: e.target.value }))}
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Colour Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Palette className="h-4 w-4" /> Colour Presets
          </CardTitle>
          <CardDescription>
            Apply a curated palette to both light and dark themes at once, then fine-tune individual colours below.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <PresetSelector activeId={activePreset} onSelect={applyPreset} />
        </CardContent>
      </Card>

      {/* Light theme palette */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Palette className="h-4 w-4" /> Light Theme Palette
              </CardTitle>
              <CardDescription className="mt-1">Colours used when the app is in light mode.</CardDescription>
            </div>
            <Button
              variant="ghost" size="sm"
              className="h-7 text-xs text-muted-foreground shrink-0"
              onClick={() => setLightPalette(LIGHT_DEFAULTS)}
            >
              Reset
            </Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-5">
          <div className="grid grid-cols-4 gap-4">
            {lightPalette.map((entry) => (
              <ColorSwatch key={entry.key} entry={entry} onChange={(v) => updateLight(entry.key, v)} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dark theme palette */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Palette className="h-4 w-4" /> Dark Theme Palette
              </CardTitle>
              <CardDescription className="mt-1">Colours used when the app is in dark mode.</CardDescription>
            </div>
            <Button
              variant="ghost" size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => setDarkPalette(DARK_DEFAULTS)}
            >
              Reset defaults
            </Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-5">
          <div className="grid grid-cols-4 gap-4">
            {darkPalette.map((entry) => (
              <ColorSwatch key={entry.key} entry={entry} onChange={(v) => updateDark(entry.key, v)} />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save} className="gap-2">
          <Save className="h-4 w-4" /> Save Changes
        </Button>
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => {
            clearSavedPalette()
            setLightPalette(LIGHT_DEFAULTS)
            setDarkPalette(DARK_DEFAULTS)
            toast.success("Palette reset to defaults")
          }}
        >
          Reset all colours
        </Button>
        {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved successfully.</span>}
      </div>
    </div>
  )
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function ActiveToggle({
  active,
  disabled,
  onToggle,
}: {
  active: boolean
  disabled?: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          active ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  )
}

function UsersTab() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

  const [addOpen, setAddOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", roleIds: [] as string[] })
  const [newUserError, setNewUserError] = useState("")

  const [editTarget, setEditTarget] = useState<ApiUser | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "" })
  const [editError, setEditError] = useState("")

  const [resetTarget, setResetTarget] = useState<ApiUser | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [resetError, setResetError] = useState("")

  const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null)
  const [rolePickerFor, setRolePickerFor] = useState<string | null>(null)

  // ── Queries ──
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["platform-users"],
    queryFn: () => fetchWithAuth("/v1/users?limit=500").then((r) => (r.data ?? []) as ApiUser[]),
  })
  const { data: allRoles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: () => fetchWithAuth("/v1/roles") as Promise<ApiRole[]>,
  })

  const users = usersData ?? []

  const filtered = useMemo(() =>
    users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && u.isActive) ||
        (filterStatus === "inactive" && !u.isActive)
      return matchSearch && matchStatus
    }),
  [users, search, filterStatus])

  // ── Mutations ──
  const updateUserMut = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; email?: string; isActive?: boolean }) =>
      fetchWithAuth(`/v1/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-users"] })
      toast.success("User updated")
      setEditTarget(null)
    },
    onError: (e: Error) => {
      setEditError(e.message)
    },
  })

  const toggleActiveMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      fetchWithAuth(`/v1/users/${id}`, { method: "PUT", body: JSON.stringify({ isActive }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platform-users"] }),
    onError: () => toast.error("Failed to update status"),
  })

  const resetPasswordMut = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      fetchWithAuth(`/v1/users/${id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      }),
    onSuccess: () => {
      toast.success("Password reset successfully")
      setResetTarget(null)
      setNewPassword("")
      setResetError("")
    },
    onError: (e: Error) => setResetError(e.message),
  })

  const addRoleMut = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      fetchWithAuth(`/v1/users/${userId}/roles`, {
        method: "POST",
        body: JSON.stringify({ roleIds: [roleId] }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platform-users"] }),
    onError: () => toast.error("Failed to assign role"),
  })

  const removeRoleMut = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      fetchWithAuth(`/v1/users/${userId}/roles/${roleId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platform-users"] }),
    onError: () => toast.error("Failed to remove role"),
  })

  const createUserMut = useMutation({
    mutationFn: async ({ name, email, password, roleIds }: typeof newUser) => {
      const created = await fetchWithAuth("/v1/users", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      }) as ApiUser
      if (roleIds.length > 0) {
        await fetchWithAuth(`/v1/users/${created.id}/roles`, {
          method: "POST",
          body: JSON.stringify({ roleIds }),
        })
      }
      return created
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-users"] })
      toast.success("User created")
      setAddOpen(false)
      setNewUser({ name: "", email: "", password: "", roleIds: [] })
      setNewUserError("")
    },
    onError: (e: Error) => setNewUserError(e.message),
  })

  const deleteUserMut = useMutation({
    mutationFn: (id: string) => fetchWithAuth(`/v1/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-users"] })
      toast.success("User deleted")
      setDeleteTarget(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // ── Helpers ──
  function userHasRole(u: ApiUser, roleId: string) {
    return u.userRoles.some((ur) => ur.role.id === roleId)
  }

  function toggleRole(u: ApiUser, role: ApiRole) {
    if (userHasRole(u, role.id)) {
      removeRoleMut.mutate({ userId: u.id, roleId: role.id })
    } else {
      addRoleMut.mutate({ userId: u.id, roleId: role.id })
    }
  }

  function openEdit(u: ApiUser) {
    setEditTarget(u)
    setEditForm({ name: u.name, email: u.email })
    setEditError("")
  }

  function submitEdit() {
    setEditError("")
    if (!editForm.name.trim()) { setEditError("Name is required."); return }
    if (!editForm.email.includes("@")) { setEditError("Valid email required."); return }
    updateUserMut.mutate({ id: editTarget!.id, name: editForm.name.trim(), email: editForm.email.trim() })
  }

  function submitReset() {
    setResetError("")
    if (newPassword.length < 6) { setResetError("Password must be at least 6 characters."); return }
    resetPasswordMut.mutate({ id: resetTarget!.id, newPassword })
  }

  function submitAdd() {
    setNewUserError("")
    if (!newUser.name.trim()) { setNewUserError("Name is required."); return }
    if (!newUser.email.includes("@")) { setNewUserError("Valid email required."); return }
    if (newUser.password.length < 6) { setNewUserError("Password must be at least 6 characters."); return }
    createUserMut.mutate(newUser)
  }

  const activeCount = users.filter((u) => u.isActive).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">All Users</h2>
          <p className="text-sm text-muted-foreground">
            {users.length} total · {activeCount} active
          </p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
          <UserPlus className="h-4 w-4" /> New User
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
        <div className="flex overflow-hidden rounded-md border text-xs">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 capitalize transition-colors ${
                filterStatus === s ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(5)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground text-sm">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {u.name}
                      {u.isSuperAdmin && (
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${roleColor("superadmin")}`}>
                          superadmin
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      {u.userRoles.map(({ role }) => (
                        <span key={role.id} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${roleColor(role.name)}`}>
                          {role.name}
                        </span>
                      ))}
                      {!u.isSuperAdmin && allRoles.length > 0 && (
                        <div className="relative">
                          <button
                            onClick={() => setRolePickerFor(rolePickerFor === u.id ? null : u.id)}
                            className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-muted-foreground/40 px-2 py-0.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                          <AnimatePresence>
                            {rolePickerFor === u.id && (
                              <motion.div
                                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                                className="absolute left-0 top-7 z-50 min-w-[8rem] rounded-lg border bg-popover shadow-lg p-1"
                              >
                                {allRoles.map((role) => {
                                  const has = userHasRole(u, role.id)
                                  const busy = addRoleMut.isPending || removeRoleMut.isPending
                                  return (
                                    <button
                                      key={role.id}
                                      disabled={busy}
                                      onClick={() => toggleRole(u, role)}
                                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs capitalize hover:bg-accent disabled:opacity-50"
                                    >
                                      <div className={`h-3.5 w-3.5 rounded-sm border flex items-center justify-center ${has ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                                        {has && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                                      </div>
                                      {role.name}
                                    </button>
                                  )
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ActiveToggle
                      active={u.isActive}
                      disabled={u.isSuperAdmin || toggleActiveMut.isPending}
                      onToggle={() => toggleActiveMut.mutate({ id: u.id, isActive: !u.isActive })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        title="Edit user"
                        onClick={() => openEdit(u)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        title="Reset password"
                        onClick={() => { setResetTarget(u); setNewPassword(""); setResetError("") }}
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        disabled={u.isSuperAdmin}
                        title="Delete user"
                        onClick={() => setDeleteTarget(u)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {rolePickerFor && <div className="fixed inset-0 z-30" onClick={() => setRolePickerFor(null)} />}

      {/* ── Edit user drawer ── */}
      <AnimatePresence>
        {editTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => !updateUserMut.isPending && setEditTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-background shadow-2xl"
            >
              <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
                <h2 className="font-semibold text-sm">Edit User</h2>
                <button onClick={() => setEditTarget(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Full name</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
                {editError && <p className="text-xs text-destructive">{editError}</p>}
              </div>
              <div className="border-t px-6 py-4 flex justify-end gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setEditTarget(null)} disabled={updateUserMut.isPending}>
                  Cancel
                </Button>
                <Button size="sm" onClick={submitEdit} disabled={updateUserMut.isPending} className="gap-1.5">
                  {updateUserMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Reset password modal ── */}
      <AnimatePresence>
        {resetTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setResetTarget(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-sm rounded-xl border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                  <h2 className="font-semibold text-sm">Reset Password</h2>
                  <button onClick={() => setResetTarget(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4 px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    Set a new password for <span className="font-medium text-foreground">{resetTarget.name}</span>.
                  </p>
                  <div className="space-y-1.5">
                    <Label className="text-xs">New password</Label>
                    <Input
                      type="password"
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-8 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && submitReset()}
                    />
                  </div>
                  {resetError && <p className="text-xs text-destructive">{resetError}</p>}
                </div>
                <Separator />
                <div className="flex justify-end gap-2 px-6 py-4">
                  <Button variant="ghost" size="sm" onClick={() => setResetTarget(null)} disabled={resetPasswordMut.isPending}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={submitReset} disabled={resetPasswordMut.isPending} className="gap-1.5">
                    {resetPasswordMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    Reset
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Add user modal ── */}
      <AnimatePresence>
        {addOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => !createUserMut.isPending && setAddOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md rounded-xl border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                  <h2 className="text-base font-semibold">New User</h2>
                  <button onClick={() => setAddOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4 px-6 py-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Full name</Label>
                    <Input
                      placeholder="e.g. Dr. Jane Smith"
                      value={newUser.name}
                      onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      placeholder="e.g. j.smith@vetclinic.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Password</Label>
                    <Input
                      type="password"
                      placeholder="Min. 6 characters"
                      value={newUser.password}
                      onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  {allRoles.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs">Roles</Label>
                      <div className="flex flex-wrap gap-2">
                        {allRoles.map((role) => {
                          const selected = newUser.roleIds.includes(role.id)
                          return (
                            <button
                              key={role.id}
                              onClick={() => setNewUser((prev) => ({
                                ...prev,
                                roleIds: selected
                                  ? prev.roleIds.filter((id) => id !== role.id)
                                  : [...prev.roleIds, role.id],
                              }))}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                                selected
                                  ? `${roleColor(role.name)} border-current`
                                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                              }`}
                            >
                              {selected && <Check className="h-3 w-3" />}
                              {role.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {newUserError && <p className="text-xs text-destructive">{newUserError}</p>}
                </div>
                <Separator />
                <div className="flex justify-end gap-2 px-6 py-4">
                  <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)} disabled={createUserMut.isPending}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={submitAdd} disabled={createUserMut.isPending} className="gap-1.5">
                    {createUserMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    Create
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Delete confirmation ── */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-sm rounded-xl border bg-card shadow-xl">
                <div className="px-6 py-5 space-y-2">
                  <h2 className="font-semibold">Delete user?</h2>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{deleteTarget.name}</span> will be permanently removed from the platform.
                  </p>
                </div>
                <Separator />
                <div className="flex justify-end gap-2 px-6 py-4">
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                  <Button
                    variant="destructive" size="sm"
                    disabled={deleteUserMut.isPending}
                    onClick={() => deleteUserMut.mutate(deleteTarget.id)}
                  >
                    {deleteUserMut.isPending
                      ? <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      : <Trash2 className="h-4 w-4 mr-1" />}
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function PlatformPage() {
  const { tab } = Route.useSearch()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Platform Administration</h1>
          <p className="mt-2 text-muted-foreground">
            Global platform configuration — visible to super admins only.
          </p>
        </div>

        <Tabs defaultValue={tab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="platform" className="gap-1.5">
              <Layers className="h-3.5 w-3.5" /> Platform
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5">
              <Users2 className="h-3.5 w-3.5" /> Users
            </TabsTrigger>
            <TabsTrigger value="ai-config" className="gap-1.5">
              <BrainCircuit className="h-3.5 w-3.5" /> AI Config
            </TabsTrigger>
            <TabsTrigger value="bot-config" className="gap-1.5">
              <Bot className="h-3.5 w-3.5" /> Bot Config
            </TabsTrigger>
            <TabsTrigger value="audit-logs" className="gap-1.5">
              <ScrollText className="h-3.5 w-3.5" /> Audit Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="platform"><PlatformInfoTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="ai-config"><AIConfigTab /></TabsContent>
          <TabsContent value="bot-config"><BotConfigTab /></TabsContent>
          <TabsContent value="audit-logs"><AuditLogsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

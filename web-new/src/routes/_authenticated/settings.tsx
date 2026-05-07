import { createFileRoute, redirect } from "@tanstack/react-router"
import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuthStore } from "../../stores/authStore"
import { fetchWithAuth } from "../../lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import { Skeleton } from "../../components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
  UserPlus, Trash2, Search, X, ChevronDown, Check, Loader2,
  Building2, Phone, Mail, Globe, MapPin, Clock, Save,
} from "lucide-react"

export const Route = createFileRoute("/_authenticated/settings")({
  validateSearch: (s: Record<string, unknown>) => ({
    tab: (s.tab as string) ?? "accounts",
  }),
  beforeLoad: () => {
    const { user } = useAuthStore.getState()
    if (!user?.roles?.includes("admin") && !user?.isSuperAdmin) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: SettingsPage,
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

// ─── Accounts Tab ─────────────────────────────────────────────────────────────

function AccountsTab() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", roleIds: [] as string[] })
  const [newUserError, setNewUserError] = useState("")
  const [rolePickerFor, setRolePickerFor] = useState<string | null>(null)

  // ── Queries ──
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchWithAuth("/v1/users?limit=200").then((r) => (r.data ?? []) as ApiUser[]),
  })
  const { data: allRoles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: () => fetchWithAuth("/v1/roles") as Promise<ApiRole[]>,
  })

  const users = usersData ?? []

  const filtered = useMemo(() =>
    users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    ), [users, search])

  // ── Mutations ──
  const addRoleMut = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      fetchWithAuth(`/v1/users/${userId}/roles`, {
        method: "POST",
        body: JSON.stringify({ roleIds: [roleId] }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
    onError: () => toast.error("Failed to assign role"),
  })

  const removeRoleMut = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      fetchWithAuth(`/v1/users/${userId}/roles/${roleId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
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
      qc.invalidateQueries({ queryKey: ["users"] })
      toast.success("Staff member added")
      setAddOpen(false)
      setNewUser({ name: "", email: "", password: "", roleIds: [] })
      setNewUserError("")
    },
    onError: (e: Error) => setNewUserError(e.message),
  })

  const deleteUserMut = useMutation({
    mutationFn: (id: string) => fetchWithAuth(`/v1/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] })
      toast.success("Staff member removed")
      setDeleteTarget(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // ── Role toggle helpers ──
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

  function toggleNewRole(roleId: string) {
    setNewUser((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId],
    }))
  }

  function submitAdd() {
    setNewUserError("")
    if (!newUser.name.trim()) { setNewUserError("Name is required."); return }
    if (!newUser.email.trim() || !newUser.email.includes("@")) { setNewUserError("Valid email required."); return }
    if (newUser.password.length < 6) { setNewUserError("Password must be at least 6 characters."); return }
    createUserMut.mutate(newUser)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Staff Accounts</h2>
          <p className="text-sm text-muted-foreground">Add or remove staff and assign their roles.</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
          <UserPlus className="h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search staff…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-sm" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(5)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground text-sm">No staff found.</TableCell>
                </TableRow>
              ) : filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      {u.userRoles.map(({ role }) => (
                        <span key={role.id} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${roleColor(role.name)}`}>
                          {role.name}
                        </span>
                      ))}
                      {u.isSuperAdmin && (
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${roleColor("superadmin")}`}>
                          superadmin
                        </span>
                      )}
                      {/* Role picker (skip for superadmins) */}
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
                    <Badge variant={u.isActive ? "default" : "secondary"} className="text-xs">
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      disabled={u.isSuperAdmin}
                      onClick={() => setDeleteTarget(u)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Role permissions are defined in <span className="font-medium text-foreground">Platform Administration</span>.
      </p>

      {/* Add user modal */}
      <AnimatePresence>
        {addOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => !createUserMut.isPending && setAddOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md rounded-xl border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                  <h2 className="text-base font-semibold">Add Staff Member</h2>
                  <button onClick={() => setAddOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-4 px-6 py-4">
                  <div className="space-y-1">
                    <Label>Full name</Label>
                    <Input placeholder="e.g. Dr. John Smith" value={newUser.name} onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <Input type="email" placeholder="e.g. j.smith@vetclinic.com" value={newUser.email} onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Password</Label>
                    <Input type="password" placeholder="Min. 6 characters" value={newUser.password} onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))} />
                  </div>
                  {allRoles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Roles</Label>
                      <div className="flex flex-wrap gap-2">
                        {allRoles.map((role) => {
                          const selected = newUser.roleIds.includes(role.id)
                          return (
                            <button key={role.id} onClick={() => toggleNewRole(role.id)}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${selected ? `${roleColor(role.name)} border-current` : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}
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
                  <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)} disabled={createUserMut.isPending}>Cancel</Button>
                  <Button size="sm" onClick={submitAdd} disabled={createUserMut.isPending} className="gap-1.5">
                    {createUserMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    Add
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
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
                  <h2 className="font-semibold">Remove staff member?</h2>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{deleteTarget.name}</span> will lose access to the system.
                  </p>
                </div>
                <Separator />
                <div className="flex justify-end gap-2 px-6 py-4">
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                  <Button variant="destructive" size="sm" disabled={deleteUserMut.isPending}
                    onClick={() => deleteUserMut.mutate(deleteTarget.id)}>
                    {deleteUserMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
                    Remove
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {rolePickerFor && <div className="fixed inset-0 z-30" onClick={() => setRolePickerFor(null)} />}
    </div>
  )
}

// ─── Clinic Tab ───────────────────────────────────────────────────────────────

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const
type Day = (typeof DAYS)[number]
interface DayHours { open: boolean; from: string; to: string }

const DEFAULT_HOURS: Record<Day, DayHours> = {
  Monday:    { open: true,  from: "08:00", to: "18:00" },
  Tuesday:   { open: true,  from: "08:00", to: "18:00" },
  Wednesday: { open: true,  from: "08:00", to: "18:00" },
  Thursday:  { open: true,  from: "08:00", to: "18:00" },
  Friday:    { open: true,  from: "08:00", to: "17:00" },
  Saturday:  { open: true,  from: "09:00", to: "13:00" },
  Sunday:    { open: false, from: "09:00", to: "13:00" },
}

function ClinicTab() {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: "City Vet Clinic",
    tagline: "Caring for your pets like family",
    phone: "+1 (555) 012-3456",
    email: "contact@cityvetclinic.com",
    website: "www.cityvetclinic.com",
    address: "142 Maple Street",
    city: "Springfield",
    postalCode: "62701",
    country: "United States",
    timezone: "America/Chicago",
    currency: "USD",
  })
  const [hours, setHours] = useState<Record<Day, DayHours>>(DEFAULT_HOURS)

  const f = (key: keyof typeof form, label: string, icon: React.ElementType, type = "text", placeholder = "") => {
    const Icon = icon
    return (
      <div className="space-y-1.5">
        <Label className="text-xs">{label}</Label>
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input type={type} placeholder={placeholder} value={form[key]}
            onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
            className="pl-8 h-8 text-sm" />
        </div>
      </div>
    )
  }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm"><Building2 className="h-4 w-4" /> Clinic Identity</CardTitle>
          <CardDescription>Name and branding shown across the platform.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-xs">Clinic name</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="h-8 text-sm font-medium" />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-xs">Tagline</Label>
            <Input placeholder="Short description…" value={form.tagline} onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))} className="h-8 text-sm" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4" /> Contact</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 grid gap-3 sm:grid-cols-2">
          {f("phone", "Phone", Phone, "tel", "+1 (555) 000-0000")}
          {f("email", "Email", Mail, "email", "contact@clinic.com")}
          {f("website", "Website", Globe, "text", "www.clinic.com")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" /> Address</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">{f("address", "Street address", MapPin)}</div>
          {f("city", "City", MapPin)}
          {f("postalCode", "Postal code", MapPin)}
          <div className="sm:col-span-2">{f("country", "Country", Globe)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4" /> Locale &amp; Currency</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Timezone</Label>
            <Input value={form.timezone} onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))} className="h-8 text-sm" placeholder="e.g. America/New_York" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Currency</Label>
            <Input value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} className="h-8 text-sm" placeholder="e.g. USD" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4" /> Working Hours</CardTitle>
          <CardDescription>Set when the clinic is open for appointments.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-2">
          {DAYS.map((day) => {
            const h = hours[day]
            return (
              <div key={day} className="flex items-center gap-3">
                <button type="button"
                  onClick={() => setHours((p) => ({ ...p, [day]: { ...p[day], open: !p[day].open } }))}
                  className={`relative h-5 w-9 rounded-full transition-colors ${h.open ? "bg-primary" : "bg-muted-foreground/30"}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${h.open ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <span className={`w-24 text-sm ${h.open ? "font-medium" : "text-muted-foreground"}`}>{day}</span>
                {h.open ? (
                  <div className="flex items-center gap-2">
                    <Input type="time" value={h.from} onChange={(e) => setHours((p) => ({ ...p, [day]: { ...p[day], from: e.target.value } }))} className="h-7 w-28 text-xs" />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input type="time" value={h.to} onChange={(e) => setHours((p) => ({ ...p, [day]: { ...p[day], to: e.target.value } }))} className="h-7 w-28 text-xs" />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Closed</span>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save} className="gap-2"><Save className="h-4 w-4" /> Save Changes</Button>
        {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved successfully.</span>}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function SettingsPage() {
  const { tab } = Route.useSearch()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-2 text-muted-foreground">Manage staff accounts and clinic configuration.</p>
        </div>

        <Tabs defaultValue={tab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="clinic">Clinic</TabsTrigger>
          </TabsList>
          <TabsContent value="accounts"><AccountsTab /></TabsContent>
          <TabsContent value="clinic"><ClinicTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

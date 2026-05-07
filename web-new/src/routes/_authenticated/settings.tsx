import { createFileRoute, redirect } from "@tanstack/react-router"
import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useAuthStore } from "../../stores/authStore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
  UserPlus, Trash2, Search, X, ChevronDown, Check,
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

// ─── Types ────────────────────────────────────────────────────────────────────

const ASSIGNABLE_ROLES = ["doctor", "nurse", "registrar", "admin"] as const
type ClinicRole = (typeof ASSIGNABLE_ROLES)[number]

const ROLE_COLORS: Record<ClinicRole, string> = {
  doctor:    "bg-blue-100   text-blue-800   border-blue-200   dark:bg-blue-900/30   dark:text-blue-300",
  nurse:     "bg-green-100  text-green-800  border-green-200  dark:bg-green-900/30  dark:text-green-300",
  registrar: "bg-amber-100  text-amber-800  border-amber-200  dark:bg-amber-900/30  dark:text-amber-300",
  admin:     "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
}

interface ClinicUser {
  id: string
  name: string
  email: string
  roles: ClinicRole[]
  active: boolean
}

const MOCK_USERS: ClinicUser[] = [
  { id: "u1", name: "Dr. Sarah Chen",  email: "s.chen@vetclinic.com",   roles: ["doctor"],           active: true  },
  { id: "u2", name: "Mark Rivera",     email: "m.rivera@vetclinic.com", roles: ["nurse"],            active: true  },
  { id: "u3", name: "Priya Nair",      email: "p.nair@vetclinic.com",   roles: ["registrar"],        active: true  },
  { id: "u4", name: "James Howell",    email: "j.howell@vetclinic.com", roles: ["doctor", "admin"],  active: true  },
  { id: "u5", name: "Linda Park",      email: "l.park@vetclinic.com",   roles: ["nurse"],            active: false },
]

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

// ─── Accounts Tab ─────────────────────────────────────────────────────────────

function AccountsTab() {
  const [users, setUsers]           = useState<ClinicUser[]>(MOCK_USERS)
  const [search, setSearch]         = useState("")
  const [deleteTarget, setDeleteTarget] = useState<ClinicUser | null>(null)
  const [addOpen, setAddOpen]       = useState(false)
  const [newUser, setNewUser]       = useState({ name: "", email: "", roles: [] as ClinicRole[] })
  const [newUserError, setNewUserError] = useState("")
  const [rolePickerFor, setRolePickerFor] = useState<string | null>(null)

  const filtered = useMemo(() =>
    users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    ), [users, search])

  function toggleRole(userId: string, role: ClinicRole) {
    setUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u
      const has = u.roles.includes(role)
      return { ...u, roles: has ? u.roles.filter((r) => r !== role) : [...u.roles, role] }
    }))
  }

  function deleteUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id))
    setDeleteTarget(null)
  }

  function addUser() {
    setNewUserError("")
    if (!newUser.name.trim())                              { setNewUserError("Name is required."); return }
    if (!newUser.email.trim() || !newUser.email.includes("@")) { setNewUserError("Valid email required."); return }
    if (newUser.roles.length === 0)                        { setNewUserError("Assign at least one role."); return }
    setUsers((prev) => [...prev, {
      id: `u${Date.now()}`,
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      roles: newUser.roles,
      active: true,
    }])
    setNewUser({ name: "", email: "", roles: [] })
    setAddOpen(false)
  }

  function toggleNewRole(role: ClinicRole) {
    setNewUser((u) => ({
      ...u,
      roles: u.roles.includes(role) ? u.roles.filter((r) => r !== role) : [...u.roles, role],
    }))
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
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      {u.roles.map((r) => (
                        <span key={r} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${ROLE_COLORS[r]}`}>
                          {r}
                        </span>
                      ))}
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
                              className="absolute left-0 top-7 z-50 w-36 rounded-lg border bg-popover shadow-lg p-1"
                            >
                              {ASSIGNABLE_ROLES.map((r) => (
                                <button
                                  key={r}
                                  onClick={() => toggleRole(u.id, r)}
                                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs capitalize hover:bg-accent"
                                >
                                  <div className={`h-3.5 w-3.5 rounded-sm border flex items-center justify-center ${u.roles.includes(r) ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                                    {u.roles.includes(r) && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                                  </div>
                                  {r}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.active ? "default" : "secondary"} className="text-xs">
                      {u.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(u)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground text-sm">No staff found.</TableCell>
                </TableRow>
              )}
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
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
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
                  <div className="space-y-2">
                    <Label>Roles</Label>
                    <div className="flex flex-wrap gap-2">
                      {ASSIGNABLE_ROLES.map((r) => (
                        <button key={r} onClick={() => toggleNewRole(r)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${newUser.roles.includes(r) ? `${ROLE_COLORS[r]} border-current` : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}
                        >
                          {newUser.roles.includes(r) && <Check className="h-3 w-3" />}
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  {newUserError && <p className="text-xs text-destructive">{newUserError}</p>}
                </div>
                <Separator />
                <div className="flex justify-end gap-2 px-6 py-4">
                  <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
                  <Button size="sm" onClick={addUser} className="gap-1.5"><UserPlus className="h-4 w-4" /> Add</Button>
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
                  <Button variant="destructive" size="sm" onClick={() => deleteUser(deleteTarget.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
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
          <Input
            type={type}
            placeholder={placeholder}
            value={form[key]}
            onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>
    )
  }

  function save() {
    // In real app: PATCH /v1/clinic
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Identity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4" /> Clinic Identity
          </CardTitle>
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

      {/* Contact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4" /> Contact
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 grid gap-3 sm:grid-cols-2">
          {f("phone",   "Phone",   Phone,  "tel",   "+1 (555) 000-0000")}
          {f("email",   "Email",   Mail,   "email", "contact@clinic.com")}
          {f("website", "Website", Globe,  "text",  "www.clinic.com")}
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" /> Address
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            {f("address", "Street address", MapPin)}
          </div>
          {f("city",       "City",         MapPin)}
          {f("postalCode", "Postal code",  MapPin)}
          <div className="sm:col-span-2">
            {f("country", "Country",       Globe)}
          </div>
        </CardContent>
      </Card>

      {/* Locale */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" /> Locale &amp; Currency
          </CardTitle>
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

      {/* Working hours */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" /> Working Hours
          </CardTitle>
          <CardDescription>Set when the clinic is open for appointments.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-2">
          {DAYS.map((day) => {
            const h = hours[day]
            return (
              <div key={day} className="flex items-center gap-3">
                {/* Toggle */}
                <button
                  type="button"
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

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={save} className="gap-2">
          <Save className="h-4 w-4" /> Save Changes
        </Button>
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

          <TabsContent value="accounts">
            <AccountsTab />
          </TabsContent>

          <TabsContent value="clinic">
            <ClinicTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

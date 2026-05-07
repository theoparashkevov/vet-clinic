import { createFileRoute, redirect } from "@tanstack/react-router"
import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useAuthStore } from "../../stores/authStore"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import { Card, CardContent } from "../../components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table"
import {
  UserPlus, Trash2, Search, X, ChevronDown, Check,
} from "lucide-react"

export const Route = createFileRoute("/_authenticated/users")({
  beforeLoad: () => {
    const { user } = useAuthStore.getState()
    if (!user?.roles?.includes("admin") && !user?.isSuperAdmin) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: UsersPage,
})

// Available roles that the clinic admin can assign (defined in Platform Administration)
const ASSIGNABLE_ROLES = ["doctor", "nurse", "registrar", "admin"] as const
type ClinicRole = (typeof ASSIGNABLE_ROLES)[number]

interface ClinicUser {
  id: string
  name: string
  email: string
  roles: ClinicRole[]
  active: boolean
}

const MOCK_USERS: ClinicUser[] = [
  { id: "u1", name: "Dr. Sarah Chen", email: "s.chen@vetclinic.com", roles: ["doctor"], active: true },
  { id: "u2", name: "Mark Rivera", email: "m.rivera@vetclinic.com", roles: ["nurse"], active: true },
  { id: "u3", name: "Priya Nair", email: "p.nair@vetclinic.com", roles: ["registrar"], active: true },
  { id: "u4", name: "James Howell", email: "j.howell@vetclinic.com", roles: ["doctor", "admin"], active: true },
  { id: "u5", name: "Linda Park", email: "l.park@vetclinic.com", roles: ["nurse"], active: false },
]

const ROLE_COLORS: Record<ClinicRole, string> = {
  doctor: "bg-blue-100 text-blue-800 border-blue-200",
  nurse: "bg-green-100 text-green-800 border-green-200",
  registrar: "bg-amber-100 text-amber-800 border-amber-200",
  admin: "bg-purple-100 text-purple-800 border-purple-200",
}

export default function UsersPage() {
  const [users, setUsers] = useState<ClinicUser[]>(MOCK_USERS)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<ClinicUser | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", roles: [] as ClinicRole[] })
  const [newUserError, setNewUserError] = useState("")
  // role picker state per user: userId | null
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
    if (!newUser.name.trim()) { setNewUserError("Name is required."); return }
    if (!newUser.email.trim() || !newUser.email.includes("@")) { setNewUserError("Valid email required."); return }
    if (newUser.roles.length === 0) { setNewUserError("Assign at least one role."); return }
    const id = `u${Date.now()}`
    setUsers((prev) => [...prev, { id, name: newUser.name.trim(), email: newUser.email.trim(), roles: newUser.roles, active: true }])
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
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Users</h1>
            <p className="mt-2 text-muted-foreground">Manage clinic staff accounts and role assignments.</p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" /> Add User
          </Button>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
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
                          <span
                            key={r}
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${ROLE_COLORS[r]}`}
                          >
                            {r}
                          </span>
                        ))}
                        {/* Role picker toggle */}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(u)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground text-sm">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Role definitions and permissions are managed in{" "}
          <span className="font-medium text-foreground">Platform Administration</span>.
        </p>
      </div>

      {/* Add user modal */}
      <AnimatePresence>
        {addOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setAddOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md rounded-xl border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                  <h2 className="text-base font-semibold">Add User</h2>
                  <button onClick={() => setAddOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
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
                        <button
                          key={r}
                          onClick={() => toggleNewRole(r)}
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
                  <Button size="sm" onClick={addUser} className="gap-1.5">
                    <UserPlus className="h-4 w-4" /> Add User
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
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-sm rounded-xl border bg-card shadow-xl">
                <div className="px-6 py-5 space-y-2">
                  <h2 className="font-semibold text-base">Remove user?</h2>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{deleteTarget.name}</span> will lose access to the clinic system.
                    This cannot be undone.
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

      {/* Close role picker on outside click */}
      {rolePickerFor && (
        <div className="fixed inset-0 z-30" onClick={() => setRolePickerFor(null)} />
      )}
    </div>
  )
}

import { createFileRoute, redirect } from "@tanstack/react-router"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useAuthStore } from "../../stores/authStore"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import {
  Plus, Trash2, Pencil, X, Save, ShieldCheck, Info,
} from "lucide-react"

export const Route = createFileRoute("/_authenticated/platform")({
  beforeLoad: () => {
    const { user } = useAuthStore.getState()
    if (!user?.isSuperAdmin) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: PlatformPage,
})

// --- Types ---

type Action = "view" | "create" | "edit" | "delete"
const ACTIONS: Action[] = ["view", "create", "edit", "delete"]

const ACTION_LABELS: Record<Action, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
}

const RESOURCES = [
  "Patients",
  "Owners",
  "Appointments",
  "Medical Records",
  "Lab Results",
  "Prescriptions",
  "Billing",
  "Tasks",
  "Users",
] as const

type Resource = (typeof RESOURCES)[number]

type Permissions = Record<Resource, Record<Action, boolean>>

interface RoleDefinition {
  id: string
  name: string
  description: string
  permissions: Permissions
}

function emptyPermissions(): Permissions {
  return Object.fromEntries(
    RESOURCES.map((r) => [r, Object.fromEntries(ACTIONS.map((a) => [a, false]))])
  ) as Permissions
}

function presetPermissions(preset: "full" | "read-only" | "clinical"): Permissions {
  const p = emptyPermissions()
  if (preset === "full") {
    for (const r of RESOURCES) for (const a of ACTIONS) p[r][a] = true
    return p
  }
  if (preset === "read-only") {
    for (const r of RESOURCES) p[r].view = true
    return p
  }
  if (preset === "clinical") {
    const clinical: Resource[] = ["Patients", "Medical Records", "Lab Results", "Prescriptions", "Appointments"]
    for (const r of clinical) for (const a of ACTIONS) p[r][a] = true
    for (const r of RESOURCES) p[r].view = true
    return p
  }
  return p
}

const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: "doctor",
    name: "doctor",
    description: "Full access to clinical resources. Can manage medical records, labs, and prescriptions.",
    permissions: presetPermissions("clinical"),
  },
  {
    id: "nurse",
    name: "nurse",
    description: "Clinical support. Can view and update patient records and lab results, no prescriptions.",
    permissions: (() => {
      const p = emptyPermissions()
      const clinical: Resource[] = ["Patients", "Owners", "Medical Records", "Lab Results", "Appointments"]
      for (const r of clinical) { p[r].view = true; p[r].create = true; p[r].edit = true }
      p["Prescriptions"].view = true
      return p
    })(),
  },
  {
    id: "registrar",
    name: "registrar",
    description: "Front desk. Manages appointments, billing, and patient intake.",
    permissions: (() => {
      const p = emptyPermissions()
      const allowed: Resource[] = ["Patients", "Owners", "Appointments", "Billing", "Tasks"]
      for (const r of allowed) for (const a of ACTIONS) p[r][a] = true
      for (const r of RESOURCES) p[r].view = true
      return p
    })(),
  },
  {
    id: "admin",
    name: "admin",
    description: "Clinic administrator. Full operational access including user management.",
    permissions: presetPermissions("full"),
  },
]

// --- Components ---

function PermissionMatrix({
  permissions,
  onChange,
}: {
  permissions: Permissions
  onChange?: (next: Permissions) => void
}) {
  const readOnly = !onChange

  function toggle(resource: Resource, action: Action) {
    if (!onChange) return
    const next = { ...permissions, [resource]: { ...permissions[resource], [action]: !permissions[resource][action] } }
    // view is a prerequisite for everything else
    if (action !== "view" && next[resource][action]) next[resource].view = true
    if (action === "view" && !next[resource].view) {
      for (const a of ACTIONS) next[resource][a] = false
    }
    onChange(next)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 pr-4 font-medium text-muted-foreground w-44">Resource</th>
            {ACTIONS.map((a) => (
              <th key={a} className="text-center px-3 py-2 font-medium text-muted-foreground w-20">
                {ACTION_LABELS[a]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RESOURCES.map((resource, ri) => (
            <tr key={resource} className={ri % 2 === 0 ? "bg-muted/30" : ""}>
              <td className="py-2 pr-4 font-medium text-foreground">{resource}</td>
              {ACTIONS.map((action) => {
                const checked = permissions[resource][action]
                return (
                  <td key={action} className="text-center px-3 py-2">
                    {readOnly ? (
                      <div className={`mx-auto h-5 w-5 rounded-md flex items-center justify-center ${checked ? "bg-primary" : "border border-border"}`}>
                        {checked && (
                          <svg viewBox="0 0 12 12" className="h-3 w-3 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="1.5,6 4.5,9 10.5,3" />
                          </svg>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggle(resource, action)}
                        className={`mx-auto h-5 w-5 rounded-md flex items-center justify-center transition-colors ${checked ? "bg-primary hover:bg-primary/80" : "border border-border hover:border-primary/60"}`}
                      >
                        {checked && (
                          <svg viewBox="0 0 12 12" className="h-3 w-3 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="1.5,6 4.5,9 10.5,3" />
                          </svg>
                        )}
                      </button>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RoleCard({
  role,
  onEdit,
  onDelete,
}: {
  role: RoleDefinition
  onEdit: () => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const totalGranted = RESOURCES.flatMap((r) => ACTIONS.map((a) => role.permissions[r][a])).filter(Boolean).length
  const total = RESOURCES.length * ACTIONS.length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Badge variant="outline" className="capitalize font-semibold text-sm px-2.5">{role.name}</Badge>
              <span className="text-xs text-muted-foreground font-normal">{totalGranted} / {total} permissions</span>
            </CardTitle>
            {role.description && (
              <CardDescription className="text-xs">{role.description}</CardDescription>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-3 pb-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-primary hover:underline"
        >
          {expanded ? "Hide" : "Show"} permission matrix
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="pt-3">
                <PermissionMatrix permissions={role.permissions} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

// --- Main Page ---

export default function PlatformPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>(INITIAL_ROLES)
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RoleDefinition | null>(null)
  const [creating, setCreating] = useState(false)

  function openCreate() {
    setEditingRole({
      id: "",
      name: "",
      description: "",
      permissions: emptyPermissions(),
    })
    setCreating(true)
  }

  function openEdit(role: RoleDefinition) {
    setEditingRole(JSON.parse(JSON.stringify(role)))
    setCreating(false)
  }

  function saveRole() {
    if (!editingRole || !editingRole.name.trim()) return
    const name = editingRole.name.trim().toLowerCase().replace(/\s+/g, "-")
    if (creating) {
      const id = name + "-" + Date.now()
      setRoles((prev) => [...prev, { ...editingRole, id, name }])
    } else {
      setRoles((prev) => prev.map((r) => r.id === editingRole.id ? { ...editingRole, name } : r))
    }
    setEditingRole(null)
  }

  function deleteRole(id: string) {
    setRoles((prev) => prev.filter((r) => r.id !== id))
    setDeleteTarget(null)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Platform Administration</h1>
            <p className="mt-2 text-muted-foreground">Define role permission schemas for the clinic platform.</p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> New Role
          </Button>
        </div>

        {/* Info banner */}
        <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-4 text-sm text-blue-800 dark:text-blue-300">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Role definitions are platform-wide.</p>
            <p className="mt-0.5 text-blue-700 dark:text-blue-400 text-xs">
              Changes here affect what every user assigned a given role can do across the entire clinic system.
              Assign roles to individual users in the <span className="font-medium">Users</span> section.
            </p>
          </div>
        </div>

        {/* Role cards */}
        <div className="space-y-4">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={() => openEdit(role)}
              onDelete={() => setDeleteTarget(role)}
            />
          ))}
          {roles.length === 0 && (
            <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground text-sm">
              No roles defined. Create one to get started.
            </div>
          )}
        </div>
      </div>

      {/* Edit / Create modal */}
      <AnimatePresence>
        {editingRole && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setEditingRole(null)}
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-background shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold">{creating ? "New Role" : `Edit: ${editingRole.name}`}</h2>
                </div>
                <button onClick={() => setEditingRole(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Role name</Label>
                    <Input
                      placeholder="e.g. doctor"
                      value={editingRole.name}
                      onChange={(e) => setEditingRole((r) => r ? { ...r, name: e.target.value } : r)}
                    />
                    <p className="text-xs text-muted-foreground">Lowercase, no spaces (hyphens ok).</p>
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Input
                      placeholder="Short summary of this role..."
                      value={editingRole.description}
                      onChange={(e) => setEditingRole((r) => r ? { ...r, description: e.target.value } : r)}
                    />
                  </div>
                </div>

                {/* Quick presets */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Quick presets</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["full", "clinical", "read-only"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEditingRole((r) => r ? { ...r, permissions: presetPermissions(p) } : r)}
                        className="rounded-full border border-border px-3 py-1 text-xs hover:border-primary hover:text-primary transition-colors capitalize"
                      >
                        {p === "full" ? "Full access" : p === "read-only" ? "Read only" : "Clinical"}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setEditingRole((r) => r ? { ...r, permissions: emptyPermissions() } : r)}
                      className="rounded-full border border-border px-3 py-1 text-xs hover:border-destructive hover:text-destructive transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Permission Matrix</Label>
                  <p className="text-xs text-muted-foreground">Click a cell to toggle. Enabling any action on a resource auto-enables View.</p>
                  <PermissionMatrix
                    permissions={editingRole.permissions}
                    onChange={(next) => setEditingRole((r) => r ? { ...r, permissions: next } : r)}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="border-t px-6 py-4 flex justify-end gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setEditingRole(null)}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={saveRole}
                  disabled={!editingRole.name.trim()}
                >
                  <Save className="h-4 w-4 mr-1" /> {creating ? "Create Role" : "Save Changes"}
                </Button>
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
                  <h2 className="font-semibold">Delete role?</h2>
                  <p className="text-sm text-muted-foreground">
                    The <Badge variant="outline" className="capitalize mx-1">{deleteTarget.name}</Badge> role will be permanently removed.
                    Users currently assigned this role will lose the associated permissions.
                  </p>
                </div>
                <Separator />
                <div className="flex justify-end gap-2 px-6 py-4">
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteRole(deleteTarget.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete Role
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

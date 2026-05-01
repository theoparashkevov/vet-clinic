import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import {
  ClipboardList,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Textarea } from "../../components/ui/textarea"
import { Label } from "../../components/ui/label"

export const Route = createFileRoute("/_authenticated/tasks")({
  component: TasksPage,
})

interface Task {
  id: string
  title: string
  description: string | null
  status: "pending" | "in_progress" | "completed"
  priority: "low" | "normal" | "high" | "urgent"
  dueDate: string | null
  assignedToId: string | null
  assignedTo: { id: string; name: string } | null
  createdAt: string
  completedAt: string | null
}

interface User {
  id: string
  name: string
}

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
]

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

function isOverdue(dueDate: string | null, status: string) {
  if (!dueDate || status === "completed") return false
  return new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0))
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getPriorityBadgeVariant(priority: string) {
  switch (priority) {
    case "urgent":
      return "destructive" as const
    case "high":
      return "default" as const
    case "normal":
      return "secondary" as const
    case "low":
      return "outline" as const
    default:
      return "outline" as const
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-transparent hover:bg-green-100"
    case "in_progress":
      return "bg-blue-100 text-blue-800 border-transparent hover:bg-blue-100"
    case "pending":
      return "bg-amber-100 text-amber-800 border-transparent hover:bg-amber-100"
    default:
      return ""
  }
}

function normalizeTask(raw: unknown): Task {
  const t = raw as Record<string, unknown>
  const assignedToUser = t.assignedToUser as { id: string; name: string } | null
  return {
    id: String(t.id),
    title: String(t.title),
    description: t.description ? String(t.description) : null,
    status: String(t.status) as Task["status"],
    priority: String(t.priority) as Task["priority"],
    dueDate: t.dueDate ? String(t.dueDate) : null,
    assignedToId: assignedToUser?.id ?? null,
    assignedTo: assignedToUser ? { id: assignedToUser.id, name: assignedToUser.name } : null,
    createdAt: String(t.createdAt),
    completedAt: t.completedAt ? String(t.completedAt) : null,
  }
}

function useTasks(statusFilter: string, page: number, limit: number) {
  return useQuery({
    queryKey: ["tasks", "list", statusFilter, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter)
      params.set("page", String(page))
      params.set("limit", String(limit))
      const res = (await fetchWithAuth(`/v1/tasks?${params.toString()}`)) as {
        data: unknown[]
        meta: { total: number; page: number; limit: number; totalPages: number }
      }
      return {
        data: res.data.map(normalizeTask),
        meta: res.meta,
      }
    },
  })
}

function useUsers() {
  return useQuery({
    queryKey: ["users", "list", 100],
    queryFn: async () => {
      const res = (await fetchWithAuth(`/v1/users?limit=100`)) as {
        data: User[]
      }
      return res.data ?? []
    },
  })
}

function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetchWithAuth("/v1/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      })
      return normalizeTask(res)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}

function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await fetchWithAuth(`/v1/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      return normalizeTask(res)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}

function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await fetchWithAuth(`/v1/tasks/${id}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}

function TasksPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const limit = 10

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)

  const { data, isLoading } = useTasks(statusFilter, page, limit)
  const { data: users } = useUsers()
  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask()
  const deleteMutation = useDeleteTask()

  const tasks = data?.data ?? []
  const meta = data?.meta

  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formPriority, setFormPriority] = useState<Task["priority"]>("normal")
  const [formDueDate, setFormDueDate] = useState("")
  const [formAssignee, setFormAssignee] = useState("none")

  function resetForm() {
    setFormTitle("")
    setFormDescription("")
    setFormPriority("normal")
    setFormDueDate("")
    setFormAssignee("none")
  }

  function openNewTask() {
    setEditingTask(null)
    resetForm()
    setDialogOpen(true)
  }

  function openEditTask(task: Task) {
    setEditingTask(task)
    setFormTitle(task.title)
    setFormDescription(task.description ?? "")
    setFormPriority(task.priority)
    setFormDueDate(task.dueDate ? task.dueDate.split("T")[0] : "")
    setFormAssignee(task.assignedToId ?? "none")
    setDialogOpen(true)
  }

  function openDelete(task: Task) {
    setDeleteTarget(task)
    setDeleteDialogOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      title: formTitle,
      description: formDescription || undefined,
      priority: formPriority,
      dueDate: formDueDate || undefined,
      assignedTo: formAssignee === "none" ? undefined : formAssignee,
    }

    if (editingTask) {
      updateMutation.mutate(
        { id: editingTask.id, data: payload },
        {
          onSuccess: () => {
            setDialogOpen(false)
            resetForm()
            setEditingTask(null)
          },
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setDialogOpen(false)
          resetForm()
        },
      })
    }
  }

  function handleMarkComplete(id: string) {
    updateMutation.mutate({ id, data: { status: "completed" } })
  }

  function confirmDelete() {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
      },
    })
  }

  const hasFilter = statusFilter !== "all"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage clinic tasks and reminders</p>
        </div>
        <Button onClick={openNewTask}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasFilter && (
          <Button variant="ghost" size="sm" onClick={() => { setStatusFilter("all"); setPage(1) }} className="h-9 mt-5">
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <ClipboardList className="h-8 w-8 opacity-50" />
                    <p className="mt-2 text-sm">No tasks found.</p>
                    {hasFilter && (
                      <Button variant="link" size="sm" onClick={() => { setStatusFilter("all"); setPage(1) }}>
                        Clear filter
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{task.title}</span>
                      {task.description && (
                        <span className="text-xs text-muted-foreground max-w-[240px] truncate">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">
                      {task.assignedTo?.name ?? "Unassigned"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-sm ${
                        isOverdue(task.dueDate, task.status)
                          ? "text-destructive font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatDate(task.dueDate)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityBadgeVariant(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeClass(task.status)}>
                      {task.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(task.status === "pending" || task.status === "in_progress") && (
                          <DropdownMenuItem onClick={() => handleMarkComplete(task.id)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark Complete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => openEditTask(task)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDelete(task)}
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
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} tasks
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
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "New Task"}</DialogTitle>
            <DialogDescription>
              {editingTask ? "Update the task details below." : "Create a new clinic task."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formPriority} onValueChange={(v) => setFormPriority(v as Task["priority"])}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select value={formAssignee} onValueChange={(v) => setFormAssignee(v)}>
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {users?.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingTask
                  ? updateMutation.isPending
                    ? "Saving..."
                    : "Save Changes"
                  : createMutation.isPending
                    ? "Creating..."
                    : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

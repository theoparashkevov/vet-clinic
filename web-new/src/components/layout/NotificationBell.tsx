import { useState, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Bell,
  CalendarDays,
  FlaskConical,
  Pill,
  Syringe,
  ClipboardList,
  CheckCheck,
  X,
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { cn } from "../../lib/utils"
import { fetchWithAuth } from "../../lib/api"

interface Notification {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  createdAt: string
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  appointment:   { icon: CalendarDays, color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-100 dark:bg-blue-900/40" },
  lab:           { icon: FlaskConical, color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-100 dark:bg-amber-900/40" },
  prescription:  { icon: Pill,         color: "text-purple-600 dark:text-purple-400",bg: "bg-purple-100 dark:bg-purple-900/40" },
  vaccination:   { icon: Syringe,      color: "text-red-600 dark:text-red-400",      bg: "bg-red-100 dark:bg-red-900/40" },
  task:          { icon: ClipboardList, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
  task_assigned: { icon: ClipboardList, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
}

const DEFAULT_CONFIG = { icon: Bell, color: "text-muted-foreground", bg: "bg-muted" }

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hr ago`
  const diffDays = Math.floor(diffHr / 24)
  if (diffDays === 1) return "Yesterday"
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => fetchWithAuth("/v1/notifications") as Promise<Notification[]>,
    refetchInterval: 30_000,
  })

  const markReadMut = useMutation({
    mutationFn: (id: string) =>
      fetchWithAuth(`/v1/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const markAllReadMut = useMutation({
    mutationFn: () =>
      fetchWithAuth("/v1/notifications/read-all", { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const dismissMut = useMutation({
    mutationFn: (id: string) =>
      fetchWithAuth(`/v1/notifications/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const clearAllMut = useMutation({
    mutationFn: () =>
      fetchWithAuth("/v1/notifications/all", { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, setOpen])

  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, setOpen])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
          open && "bg-accent text-accent-foreground"
        )}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold leading-none text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute right-0 top-11 z-[200] w-96 rounded-xl border bg-popover shadow-xl"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-xs font-medium text-destructive">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                  onClick={() => markAllReadMut.mutate()}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </Button>
              )}
            </div>

            <Separator />

            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                  <Bell className="h-8 w-8 opacity-20" />
                  <p className="text-sm">You're all caught up</p>
                </div>
              ) : (
                <ul>
                  {notifications.map((notif, i) => {
                    const cfg = TYPE_CONFIG[notif.type] ?? DEFAULT_CONFIG
                    return (
                      <li key={notif.id}>
                        {i > 0 && <Separator />}
                        <button
                          type="button"
                          onClick={() => !notif.read && markReadMut.mutate(notif.id)}
                          className={cn(
                            "group relative flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50",
                            !notif.read && "bg-accent/20"
                          )}
                        >
                          <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", cfg.bg)}>
                            <cfg.icon className={cn("h-4 w-4", cfg.color)} />
                          </div>

                          <div className="min-w-0 flex-1 pr-5">
                            <p className={cn("text-sm leading-snug", !notif.read ? "font-semibold" : "font-medium text-muted-foreground")}>
                              {notif.title}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground leading-snug line-clamp-2">
                              {notif.body}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground/70">{formatTime(notif.createdAt)}</p>
                          </div>

                          {!notif.read && (
                            <span className="absolute right-10 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                          )}

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); dismissMut.mutate(notif.id) }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {notifications.length > 0 && (
              <>
                <Separator />
                <div className="px-4 py-2 text-center">
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => clearAllMut.mutate()}
                  >
                    Clear all notifications
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

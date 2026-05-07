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
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { cn } from "../../lib/utils"

type NotifType = "appointment" | "lab" | "prescription" | "vaccination" | "task"

interface Notification {
  id: string
  type: NotifType
  title: string
  body: string
  time: string
  read: boolean
}

const INITIAL: Notification[] = [
  {
    id: "n1",
    type: "appointment",
    title: "Appointment in 30 min",
    body: "Max (Golden Retriever) — routine check-up at 2:00 PM",
    time: "Just now",
    read: false,
  },
  {
    id: "n2",
    type: "lab",
    title: "Lab results ready",
    body: "CBC panel for Buddy (Labrador) — 2 abnormal values",
    time: "12 min ago",
    read: false,
  },
  {
    id: "n3",
    type: "vaccination",
    title: "Overdue vaccination",
    body: "Luna (Persian Cat) — Rabies booster was due 3 days ago",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "n4",
    type: "prescription",
    title: "Prescription expiring",
    body: "Metronidazole for Coco (Beagle) expires in 2 days",
    time: "2 hr ago",
    read: false,
  },
  {
    id: "n5",
    type: "task",
    title: "Task assigned to you",
    body: "Follow up call with Mr. Johnson after Oliver's surgery",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n6",
    type: "appointment",
    title: "Appointment cancelled",
    body: "Rocky (Bulldog) — 4:30 PM slot is now free",
    time: "Yesterday",
    read: true,
  },
]

const TYPE_CONFIG: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  appointment: { icon: CalendarDays, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/40" },
  lab:         { icon: FlaskConical, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/40" },
  prescription:{ icon: Pill,         color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/40" },
  vaccination: { icon: Syringe,      color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/40" },
  task:        { icon: ClipboardList, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL)
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function dismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
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

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute right-0 top-11 z-[200] w-96 rounded-xl border bg-popover shadow-xl"
          >
            {/* Header */}
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
                  onClick={markAllRead}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </Button>
              )}
            </div>

            <Separator />

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                  <Bell className="h-8 w-8 opacity-20" />
                  <p className="text-sm">You're all caught up</p>
                </div>
              ) : (
                <ul>
                  {notifications.map((notif, i) => {
                    const cfg = TYPE_CONFIG[notif.type]
                    return (
                      <li key={notif.id}>
                        {i > 0 && <Separator />}
                        <button
                          type="button"
                          onClick={() => markRead(notif.id)}
                          className={cn(
                            "group relative flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50",
                            !notif.read && "bg-accent/20"
                          )}
                        >
                          {/* Type icon */}
                          <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", cfg.bg)}>
                            <cfg.icon className={cn("h-4 w-4", cfg.color)} />
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1 pr-5">
                            <p className={cn("text-sm leading-snug", !notif.read ? "font-semibold" : "font-medium text-muted-foreground")}>
                              {notif.title}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground leading-snug line-clamp-2">
                              {notif.body}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground/70">{notif.time}</p>
                          </div>

                          {/* Unread dot */}
                          {!notif.read && (
                            <span className="absolute right-10 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                          )}

                          {/* Dismiss */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); dismiss(notif.id) }}
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

            {/* Footer */}
            {notifications.length > 0 && (
              <>
                <Separator />
                <div className="px-4 py-2 text-center">
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setNotifications([])}
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

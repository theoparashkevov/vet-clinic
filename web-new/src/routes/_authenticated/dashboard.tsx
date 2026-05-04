import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  CalendarDays,
  PawPrint,
  ClipboardList,
  AlertTriangle,
  Plus,
  CalendarPlus,
  FileText,
  ArrowRight,
  Clock,
  User,
} from "lucide-react"
import { fetchWithAuth } from "../../lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
})

interface DashboardStats {
  todayAppointments: number
  totalPatients: number
  pendingTasks: number
  overdueReminders: number
}

interface Appointment {
  id: string
  startsAt: string
  endsAt: string
  status: string
  patient: { id: string; name: string; species: string }
  doctor: { id: string; name: string } | null
  reason?: string | null
}

function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        const res = await fetchWithAuth("/v1/analytics/dashboard")
        return res.data as DashboardStats
      } catch {
        return {
          todayAppointments: 0,
          totalPatients: 0,
          pendingTasks: 0,
          overdueReminders: 0,
        }
      }
    },
  })
}

function useTodayAppointments() {
  return useQuery({
    queryKey: ["appointments", "today"],
    queryFn: async (): Promise<Appointment[]> => {
      try {
        const today = new Date().toISOString().slice(0, 10)
        const res = await fetchWithAuth(`/v1/appointments?date=${today}&limit=5`)
        return (res.data ?? []) as Appointment[]
      } catch {
        return []
      }
    },
  })
}

const statCards = [
  {
    key: "todayAppointments" as const,
    label: "Today's Appointments",
    icon: CalendarDays,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "totalPatients" as const,
    label: "Total Patients",
    icon: PawPrint,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    key: "pendingTasks" as const,
    label: "Pending Tasks",
    icon: ClipboardList,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    key: "overdueReminders" as const,
    label: "Overdue Reminders",
    icon: AlertTriangle,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
]

const quickActions = [
  { label: "New Appointment", to: "/appointments/new", icon: CalendarPlus, variant: "default" as const },
  { label: "New Patient", to: "/patients", icon: Plus, variant: "outline" as const },
  { label: "Medical Record", to: "/medical-records", icon: FileText, variant: "outline" as const },
]

function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "completed":
      return "default"
    case "pending":
      return "secondary"
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
}

function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: appointments, isLoading: appointmentsLoading } = useTodayAppointments()

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Overview of your clinic today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button key={action.label} variant={action.variant} size="sm" asChild>
              <Link to={action.to}>
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const value = stats?.[card.key] ?? 0
          return (
            <Card key={card.key} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <div className={cn("rounded-md p-2", card.bg)}>
                  <card.icon className={cn("h-4 w-4", card.color)} />
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {value}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Today's scheduled visits</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/appointments" className="gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : appointments && appointments.length > 0 ? (
            <div className="divide-y">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {appt.patient?.name ?? "Unknown"}
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({appt.patient?.species ?? "Pet"})
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appt.doctor?.name ?? "Unassigned"}
                        {appt.reason && ` · ${appt.reason}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-medium text-foreground">
                        {appt.time}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appt.date}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(appt.status)}>
                      {appt.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarDays className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No appointments scheduled for today.
              </p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link to="/appointments">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Book appointment
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Upcoming Slots
            </CardTitle>
            <CardDescription>Available appointment slots today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Check the Appointments page to view and book available slots.
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link to="/appointments">View slots</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Action Items
            </CardTitle>
            <CardDescription>Tasks requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Review pending tasks and overdue reminders to stay on top of patient care.
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link to="/tasks">View tasks</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

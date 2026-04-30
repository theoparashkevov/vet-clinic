import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router"
import { CalendarDays, List, Plus } from "lucide-react"
import { Button } from "../../components/ui/button"
import { cn } from "../../lib/utils"

export const Route = createFileRoute("/_authenticated/appointments")({
  component: AppointmentsLayout,
})

function AppointmentsLayout() {
  const location = useLocation()

  const tabs = [
    { label: "List", to: "/appointments", icon: List },
    { label: "Calendar", to: "/appointments/calendar", icon: CalendarDays },
  ]

  const isActive = (path: string) => {
    if (path === "/appointments") {
      return location.pathname === "/appointments"
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Appointments
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage appointments and bookings.
          </p>
        </div>
        <Button asChild>
          <Link to="/appointments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-1 rounded-lg border bg-card p-1 w-fit">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive(tab.to)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        ))}
      </div>

      <Outlet />
    </div>
  )
}

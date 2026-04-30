import { Link, useLocation } from "@tanstack/react-router"
import {
  LayoutDashboard,
  PawPrint,
  CalendarDays,
  FileText,
  FlaskConical,
  Pill,
  CreditCard,
  Shield,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { useAuthStore } from "../../stores/authStore"

interface NavItem {
  label: string
  to: string
  icon: React.ElementType
  roles: string[]
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: [] },
  { label: "Patients", to: "/patients", icon: PawPrint, roles: ["doctor", "nurse", "registrar"] },
  { label: "Appointments", to: "/appointments", icon: CalendarDays, roles: ["doctor", "nurse", "registrar"] },
  { label: "Medical Records", to: "/medical-records", icon: FileText, roles: ["doctor", "nurse"] },
  { label: "Lab Results", to: "/lab-results", icon: FlaskConical, roles: ["doctor", "nurse"] },
  { label: "Prescriptions", to: "/prescriptions", icon: Pill, roles: ["doctor"] },
  { label: "Billing", to: "/billing", icon: CreditCard, roles: ["registrar", "admin"] },
  { label: "Admin", to: "/admin", icon: Shield, roles: ["superadmin"] },
]

function hasAccess(userRoles: string[] | undefined, allowedRoles: string[]): boolean {
  if (allowedRoles.length === 0) return true
  if (!userRoles || userRoles.length === 0) return false
  return userRoles.some((role) => allowedRoles.includes(role))
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const { user } = useAuthStore()
  const userRoles = user?.roles

  const visibleItems = navItems.filter((item) => hasAccess(userRoles, item.roles))

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r bg-card transition-all duration-300 ease-in-out",
          collapsed ? "w-[4.5rem]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Clinic branding */}
        <div className="flex h-16 items-center gap-3 border-b px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="truncate text-lg font-bold tracking-tight text-foreground">
              Vet Clinic
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const isActive = location.pathname === item.to
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={onMobileClose}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden border-t p-3 lg:block">
          <button
            onClick={onToggle}
            className="flex h-9 w-full items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs font-medium">Collapse</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}

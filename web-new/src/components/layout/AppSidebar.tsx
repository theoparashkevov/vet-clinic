import { Link, useRouterState } from "@tanstack/react-router"
import {
  LayoutDashboard,
  PawPrint,
  Users,
  CalendarDays,
  FileText,
  FlaskConical,
  Pill,
  CreditCard,
  Shield,
  Stethoscope,
  ClipboardList,
  ClipboardPlus,
} from "lucide-react"
import { useAuthStore } from "../../stores/authStore"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "../ui/sidebar"
import { Avatar, AvatarFallback } from "../ui/avatar"

interface NavItem {
  label: string
  to: string
  icon: React.ElementType
  roles: string[]
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: [] },
      { label: "New Visit", to: "/visit", icon: ClipboardPlus, roles: [] },
    ],
  },
  {
    label: "Patients",
    items: [
      { label: "Patients", to: "/patients", icon: PawPrint, roles: ["doctor", "nurse", "registrar"] },
      { label: "Owners", to: "/owners", icon: Users, roles: ["doctor", "nurse", "registrar"] },
    ],
  },
  {
    label: "Appointments",
    items: [
      { label: "Appointments", to: "/appointments", icon: CalendarDays, roles: ["doctor", "nurse", "registrar"] },
    ],
  },
  {
    label: "Clinical",
    items: [
      { label: "Medical Records", to: "/medical-records", icon: FileText, roles: ["doctor", "nurse"] },
      { label: "Lab Results", to: "/lab-results", icon: FlaskConical, roles: ["doctor", "nurse"] },
      { label: "Prescriptions", to: "/prescriptions", icon: Pill, roles: ["doctor"] },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Tasks", to: "/tasks", icon: ClipboardList, roles: ["doctor", "nurse", "registrar", "admin"] },
      { label: "Billing", to: "/billing", icon: CreditCard, roles: ["registrar", "admin"] },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Admin", to: "/admin", icon: Shield, roles: ["superadmin"] },
    ],
  },
]

function hasAccess(userRoles: string[] | undefined, allowedRoles: string[]): boolean {
  if (allowedRoles.length === 0) return true
  if (!userRoles?.length) return false
  return userRoles.some((r) => allowedRoles.includes(r))
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { user } = useAuthStore()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasAccess(user?.roles, item.roles)),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar collapsible="icon">
      {/* Brand */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/dashboard" />}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-sm">Vet Clinic</span>
                <span className="text-xs text-sidebar-foreground/60">Management</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Nav groups */}
      <SidebarContent>
        {visibleGroups.map((group, gi) => (
          <SidebarGroup key={gi}>
            {group.label && (
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            )}
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive =
                  item.to === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.to)
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      render={<Link to={item.to} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* User footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="gap-3">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-sidebar-primary/20 text-xs font-semibold text-sidebar-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate text-sm font-medium">{user?.name ?? "User"}</span>
                  <span className="truncate text-xs text-sidebar-foreground/60 capitalize">
                    {user?.roles?.[0] ?? "Staff"}
                  </span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

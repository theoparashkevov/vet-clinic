"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useLocation } from "@tanstack/react-router"
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  FlaskConical,
  Syringe,
  Pill,
  FileEdit,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Stethoscope,
  ArrowLeft,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { useUIStore } from "../../stores/uiStore"
import { useAuthStore } from "../../stores/authStore"

interface MenuItem {
  href: string
  label: string
  icon: React.ElementType
  children?: { href: string; label: string; icon: React.ElementType }[]
}

const menuItems: MenuItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/admin/billing",
    label: "Billing",
    icon: DollarSign,
    children: [
      { href: "/admin/billing/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/billing/invoices", label: "Invoices", icon: FileText },
    ],
  },
  { href: "/admin/lab-panels", label: "Lab Panels", icon: FlaskConical },
  { href: "/admin/vaccinations", label: "Vaccinations", icon: Syringe },
  { href: "/admin/medications", label: "Medications", icon: Pill },
  { href: "/admin/note-templates", label: "Note Templates", icon: FileEdit },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

const DRAWER_WIDTH_EXPANDED = 280
const DRAWER_WIDTH_COLLAPSED = 72

export function Sidebar() {
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()
  const [expandedItems, setExpandedItems] = React.useState<string[]>(["/admin/billing"])

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    )
  }

  const isItemActive = (item: MenuItem) => {
    if (location.pathname === item.href) return true
    if (item.children) {
      return item.children.some((child) => location.pathname === child.href)
    }
    return false
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")
    : "AD"

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card shadow-sm",
        sidebarCollapsed ? "overflow-visible" : "overflow-y-auto overflow-x-hidden"
      )}
    >
      <div className="relative border-b border-border bg-gradient-to-br from-primary to-primary/80 p-4 text-primary-foreground">
        {!sidebarCollapsed && (
          <>
            <Link
              to="/"
              className="mb-4 flex items-center gap-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Clinic</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Admin Panel</h2>
                <p className="text-xs text-white/70">Vet Clinic</p>
              </div>
            </div>
          </>
        )}
        {sidebarCollapsed && (
          <div className="flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
        
        <Button
          variant="secondary"
          size="icon"
          className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-border bg-card p-0 shadow-sm hover:bg-accent"
          onClick={toggleSidebar}
        >
          <motion.div
            animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="h-3 w-3" />
          </motion.div>
        </Button>
      </div>

      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = isItemActive(item)
            const isExpanded = expandedItems.includes(item.href)
            const Icon = item.icon
            const hasChildren = item.children && item.children.length > 0

            if (sidebarCollapsed && hasChildren) {
              return (
                <li key={item.href}>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          size="icon"
                          className={cn(
                            "w-full justify-center",
                            isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                          onClick={() => toggleSidebar()}
                        >
                          <Icon className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </li>
              )
            }

            if (sidebarCollapsed) {
              return (
                <li key={item.href}>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to={item.href}>
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            size="icon"
                            className={cn(
                              "w-full justify-center",
                              isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </li>
              )
            }

            return (
              <li key={item.href}>
                {hasChildren ? (
                  <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(item.href)}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-between",
                          isActive && !sidebarCollapsed && "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </span>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.div>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-1 space-y-1 pl-4"
                          >
                            {item.children!.map((child) => {
                              const isChildActive = location.pathname === child.href
                              const ChildIcon = child.icon
                              return (
                                <li key={child.href}>
                                  <Link to={child.href}>
                                    <Button
                                      variant={isChildActive ? "default" : "ghost"}
                                      size="sm"
                                      className={cn(
                                        "w-full justify-start gap-3",
                                        isChildActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                                      )}
                                    >
                                      <ChildIcon className="h-4 w-4" />
                                      <span>{child.label}</span>
                                      {isChildActive && <ChevronRight className="ml-auto h-3 w-3" />}
                                    </Button>
                                  </Link>
                                </li>
                              )
                            })}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Link to={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3",
                        isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-4">
        <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar} alt={user?.name || "Admin"} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name || "Admin User"}</span>
              <span className="text-xs text-muted-foreground">{user?.email || "admin@vetclinic.com"}</span>
            </div>
          )}
        </div>
        {!sidebarCollapsed && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Vet Clinic v1.4
          </p>
        )}
      </div>
    </motion.aside>
  )
}

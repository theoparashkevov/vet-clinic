"use client"

import { Link } from "@tanstack/react-router"
import {
  Bell,
  Menu,
  Moon,
  Sun,
  Stethoscope,
  LayoutDashboard,
  Users,
  Calendar,
  PawPrint,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useUIStore } from "../../stores/uiStore"
import { useAuthStore } from "../../stores/authStore"

interface TopNavProps {
  className?: string
}

const mainNavItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: PawPrint },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/users", label: "Users", icon: Users },
]

export function TopNav({ className }: TopNavProps) {
  const { sidebarCollapsed, setMobileMenuOpen, theme, setTheme } = useUIStore()
  const { user, logout } = useAuthStore()

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")
    : "AD"

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 shadow-sm transition-all duration-300",
        sidebarCollapsed ? "left-[72px]" : "left-[280px]",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link to="/" className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold">Vet Clinic</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} to={item.href}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "admin@vetclinic.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link to="/profile">
              <DropdownMenuItem>My Profile</DropdownMenuItem>
            </Link>
            <Link to="/admin">
              <DropdownMenuItem>Admin Panel</DropdownMenuItem>
            </Link>
            <Link to="/admin/settings">
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

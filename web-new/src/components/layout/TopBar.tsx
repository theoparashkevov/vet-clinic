import { type ReactNode, useState } from "react"
import { Link } from "@tanstack/react-router"
import { LogOut, Moon, Sun, User } from "lucide-react"
import { useAuthStore } from "../../stores/authStore"
import { useTheme } from "../../lib/useTheme"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Separator } from "../ui/separator"

interface TopBarProps {
  trigger: ReactNode
}

export function TopBar({ trigger }: TopBarProps) {
  const { user, logout } = useAuthStore()
  const { theme, toggle } = useTheme()
  const [avatarError, setAvatarError] = useState(false)

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md">
      {trigger}
      <Separator orientation="vertical" className="mx-1 h-4" />
      <span className="text-sm text-muted-foreground hidden sm:block">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </span>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight text-foreground">
                  {user?.name || "User"}
                </p>
                <p className="text-xs capitalize text-muted-foreground">
                  {user?.roles?.[0] || "Staff"}
                </p>
              </div>
              <Avatar className="h-8 w-8">
                {user?.avatar && !avatarError ? (
                  <AvatarImage
                    src={user.avatar}
                    alt={user.name}
                    onError={() => setAvatarError(true)}
                  />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

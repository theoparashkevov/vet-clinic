import { type ReactNode } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "../../lib/useTheme"
import { Separator } from "../ui/separator"

interface TopBarProps {
  trigger: ReactNode
}

export function TopBar({ trigger }: TopBarProps) {
  const { theme, toggle } = useTheme()

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
      </div>
    </header>
  )
}

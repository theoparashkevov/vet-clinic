import { useEffect } from "react"
import { useUIStore } from "../stores/uiStore"

export function useTheme() {
  const { theme, setTheme } = useUIStore()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return { theme, setTheme, toggleTheme }
}

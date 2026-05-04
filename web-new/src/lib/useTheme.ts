import { useEffect, useState } from "react"

type Theme = "light" | "dark"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  const stored = localStorage.getItem("theme") as Theme | null
  if (stored === "light" || stored === "dark") return stored
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  // Apply on first render before paint
  useEffect(() => { applyTheme(getInitialTheme()) }, [])

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"))

  return { theme, toggle }
}

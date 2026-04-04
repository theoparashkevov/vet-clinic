import { useEffect, useCallback } from "react"
import { useNavigate } from "@tanstack/react-router"

export function useKeyboardShortcuts() {
  const navigate = useNavigate()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        console.log("Command palette toggle")
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault()
        console.log("Help shortcut")
      }

      if (e.altKey) {
        switch (e.key) {
          case "h":
            e.preventDefault()
            navigate({ to: "/" })
            break
          case "p":
            e.preventDefault()
            navigate({ to: "/patients" })
            break
          case "a":
            e.preventDefault()
            navigate({ to: "/appointments" })
            break
          case "b":
            e.preventDefault()
            navigate({ to: "/admin/billing" })
            break
          case "i":
            e.preventDefault()
            navigate({ to: "/admin/billing/invoices" })
            break
        }
      }
    },
    [navigate]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}

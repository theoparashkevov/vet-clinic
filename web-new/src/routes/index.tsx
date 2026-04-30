import { createFileRoute, redirect } from "@tanstack/react-router"
import { useAuthStore } from "../stores/authStore"

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (isAuthenticated) {
      throw redirect({ to: "/dashboard" })
    }
    throw redirect({ to: "/login" })
  },
  component: IndexPage,
})

function IndexPage() {
  return null
}

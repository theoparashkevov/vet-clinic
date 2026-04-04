import { createFileRoute, redirect } from "@tanstack/react-router"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuthStore } from "../stores/authStore"
import { Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: "/login" })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

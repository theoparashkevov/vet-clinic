import { useEffect } from "react"
import { createFileRoute, redirect, Outlet, useNavigate } from "@tanstack/react-router"
import { useAuthStore } from "../stores/authStore"
import { useAuth } from "../hooks/useAuth"
import { AppLayout } from "../components/layout/AppLayout"
import { Skeleton } from "../components/ui/skeleton"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    const { isAuthenticated, isLoading } = useAuthStore.getState()
    if (!isLoading && !isAuthenticated) {
      throw redirect({ to: "/login" })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const navigate = useNavigate()
  const { isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" })
    }
  }, [isLoading, isAuthenticated, navigate])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-card px-6 py-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </header>
        <main className="flex-1 p-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-4 h-4 w-96" />
        </main>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

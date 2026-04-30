import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Dashboard
      </h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to the Vet Clinic dashboard.
      </p>
    </div>
  )
}

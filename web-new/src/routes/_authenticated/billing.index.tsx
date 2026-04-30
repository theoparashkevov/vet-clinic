import { createFileRoute, Navigate } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/billing/")({
  component: BillingIndexPage,
})

function BillingIndexPage() {
  return <Navigate to="/billing/invoices" />
}

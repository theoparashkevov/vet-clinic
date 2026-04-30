import { useState, useMemo } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Plus, Trash2, Receipt } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Separator } from "../../components/ui/separator"
import { Skeleton } from "../../components/ui/skeleton"
import { toast } from "sonner"
import {
  usePatientsForSelect,
  useServiceCatalog,
  useCreateInvoice,
  formatCurrency,
} from "../../lib/billing"
import { useAuthStore } from "../../stores/authStore"

export const Route = createFileRoute("/_authenticated/billing/invoices/new")({
  component: CreateInvoicePage,
})

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  discountAmount: number
  serviceCatalogId?: string
}

function generateTempId() {
  return Math.random().toString(36).slice(2, 9)
}

function CreateInvoicePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: patients, isLoading: patientsLoading } = usePatientsForSelect()
  const { data: services, isLoading: servicesLoading } = useServiceCatalog()
  const createMutation = useCreateInvoice()

  const [patientId, setPatientId] = useState("")
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().slice(0, 10)
  })
  const [taxAmount, setTaxAmount] = useState("")
  const [discountAmount, setDiscountAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<LineItem[]>([
    { id: generateTempId(), description: "", quantity: 1, unitPrice: 0, discountAmount: 0 },
  ])

  const selectedPatient = patients?.find((p) => p.id === patientId)

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice - (item.discountAmount || 0)
      return sum + Math.max(0, itemTotal)
    }, 0)
    const tax = parseFloat(taxAmount) || 0
    const discount = parseFloat(discountAmount) || 0
    const total = Math.max(0, subtotal + tax - discount)
    return { subtotal, tax, discount, total }
  }, [items, taxAmount, discountAmount])

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: generateTempId(), description: "", quantity: 1, unitPrice: 0, discountAmount: 0 },
    ])
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const next = { ...item, [field]: value }
        if (field === "serviceCatalogId") {
          const svc = services?.find((s) => s.id === value)
          if (svc) {
            next.description = svc.name
            next.unitPrice = svc.defaultPrice
          }
        }
        return next
      })
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!patientId) {
      toast.error("Select a patient")
      return
    }
    if (!selectedPatient?.owner?.id) {
      toast.error("Selected patient has no owner")
      return
    }
    if (items.length === 0 || items.some((i) => !i.description.trim())) {
      toast.error("Add at least one line item with a description")
      return
    }

    const dto = {
      patientId,
      ownerId: selectedPatient.owner.id,
      issueDate,
      dueDate,
      status: "draft",
      taxAmount: totals.tax,
      discountAmount: totals.discount,
      notes: notes || undefined,
      createdById: user?.id || "",
      items: items.map((item) => ({
        serviceCatalogId: item.serviceCatalogId || undefined,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount || undefined,
        serviceType: "OTHER",
      })),
    }

    createMutation.mutate(dto, {
      onSuccess: (invoice) => {
        toast.success("Invoice created")
        navigate({ to: "/billing/invoices/$id", params: { id: invoice.id } })
      },
      onError: (err: Error) => {
        toast.error(err.message || "Failed to create invoice")
      },
    })
  }

  if (patientsLoading || servicesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/billing/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          New Invoice
        </h1>
        <p className="mt-1 text-muted-foreground">
          Create a new invoice for a patient.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Select the patient and set invoice dates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient *</Label>
                <select
                  id="patient"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select patient...</option>
                  {patients?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.owner?.name ? `(${p.owner.name})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Input
                  id="owner"
                  value={selectedPatient?.owner?.name ?? ""}
                  disabled
                  placeholder="Auto-filled from patient"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>Add services and products to the invoice.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Item #{index + 1}
                  </span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Service</Label>
                    <select
                      value={item.serviceCatalogId || ""}
                      onChange={(e) => updateItem(item.id, "serviceCatalogId", e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Custom...</option>
                      {services?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} — {formatCurrency(s.defaultPrice)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder="Description"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={item.discountAmount}
                      onChange={(e) => updateItem(item.id, "discountAmount", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total</Label>
                    <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium">
                      {formatCurrency(Math.max(0, item.quantity * item.unitPrice - item.discountAmount))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Additional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    min={0}
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    min={0}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes for the invoice"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                Totals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>
              )}
              {totals.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-destructive">-{formatCurrency(totals.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link to="/billing/invoices">Cancel</Link>
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      </form>
    </div>
  )
}

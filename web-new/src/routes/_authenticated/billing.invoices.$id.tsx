import { useState } from "react"
import { createFileRoute, Link, useParams } from "@tanstack/react-router"
import {
  ArrowLeft,
  CreditCard,
  Send,
  Ban,
  Receipt,
  Calendar,
  User,
  PawPrint,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { Separator } from "../../components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { toast } from "sonner"
import {
  useInvoice,
  useUpdateInvoice,
  useVoidInvoice,
  useRecordPayment,
  getInvoiceStatusVariant,
  formatCurrency,
  formatDate,
  calculateBalance,
  type PaymentMethod,
} from "../../lib/billing"

export const Route = createFileRoute("/_authenticated/billing/invoices/$id")({
  component: InvoiceDetailPage,
})

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "check", label: "Check" },
  { value: "bank_transfer", label: "Bank Transfer" },
]

function InvoiceDetailPage() {
  const { id } = useParams({ from: "/_authenticated/billing/invoices/$id" })
  const { data: invoice, isLoading } = useInvoice(id)
  const updateMutation = useUpdateInvoice()
  const voidMutation = useVoidInvoice()
  const paymentMutation = useRecordPayment()

  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [paymentNotes, setPaymentNotes] = useState("")

  if (isLoading || !invoice) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const balance = calculateBalance(invoice)
  const paidAmount = invoice.totalAmount - balance

  const handleMarkSent = () => {
    updateMutation.mutate(
      { id: invoice.id, dto: { status: "sent" } },
      {
        onSuccess: () => toast.success("Invoice marked as sent"),
        onError: (err: Error) => toast.error(err.message || "Failed to update invoice"),
      }
    )
  }

  const handleVoid = () => {
    voidMutation.mutate(invoice.id, {
      onSuccess: () => toast.success("Invoice voided"),
      onError: (err: Error) => toast.error(err.message || "Failed to void invoice"),
    })
  }

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount")
      return
    }
    if (amount > balance) {
      toast.error("Payment amount cannot exceed balance")
      return
    }

    paymentMutation.mutate(
      {
        id: invoice.id,
        dto: {
          amount,
          paymentMethod,
          notes: paymentNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Payment recorded")
          setPaymentOpen(false)
          setPaymentAmount("")
          setPaymentMethod("cash")
          setPaymentNotes("")
        },
        onError: (err: Error) => toast.error(err.message || "Failed to record payment"),
      }
    )
  }

  const canRecordPayment = balance > 0 && ["sent", "partially_paid", "overdue"].includes(invoice.status)
  const canMarkSent = invoice.status === "draft"
  const canVoid = ["draft", "sent"].includes(invoice.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" render={<Link to="/billing/invoices" />}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {invoice.invoiceNumber}
            </h1>
            <Badge variant={getInvoiceStatusVariant(invoice.status)}>
              {invoice.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Issued {formatDate(invoice.issueDate)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Due {formatDate(invoice.dueDate)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canRecordPayment && (
            <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleRecordPayment}>
                  <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                      Record a payment for invoice {invoice.invoiceNumber}.
                      Balance: {formatCurrency(balance)}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min={0.01}
                        max={balance}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                      {parseFloat(paymentAmount) > balance && (
                        <p className="text-xs text-destructive">
                          Amount cannot exceed {formatCurrency(balance)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="method">Payment Method</Label>
                      <select
                        id="method"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        {paymentMethods.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={paymentNotes}
                        onChange={(e) => setPaymentNotes(e.target.value)}
                        placeholder="Optional notes"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={paymentMutation.isPending}
                    >
                      {paymentMutation.isPending ? "Recording..." : "Record Payment"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
          {canMarkSent && (
            <Button variant="outline" onClick={handleMarkSent} disabled={updateMutation.isPending}>
              <Send className="mr-2 h-4 w-4" />
              Mark as Sent
            </Button>
          )}
          {canVoid && (
            <Button variant="destructive" onClick={handleVoid} disabled={voidMutation.isPending}>
              <Ban className="mr-2 h-4 w-4" />
              Void
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              Line Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No line items.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoice.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">
                        {item.discountAmount ? formatCurrency(item.discountAmount) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{invoice.owner?.name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">Owner</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <PawPrint className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {invoice.patient?.name ?? "Unknown"}
                    {invoice.patient?.species && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({invoice.patient.species})
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">Patient</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-destructive">-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-sm font-medium">
                <span>Total</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="text-emerald-600">{formatCurrency(paidAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Balance</span>
                <span className={balance > 0 ? "text-destructive" : "text-emerald-600"}>
                  {formatCurrency(balance)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.payments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No payments recorded.
                  </TableCell>
                </TableRow>
              ) : (
                invoice.payments?.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {payment.paidAt ? formatDate(payment.paidAt) : formatDate(payment.createdAt)}
                    </TableCell>
                    <TableCell className="capitalize">{payment.paymentMethod.replace("_", " ")}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={payment.status === "completed" || payment.status === "COMPLETED" ? "default" : "secondary"}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.notes || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

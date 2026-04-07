import { createFileRoute } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Plus, Search, Filter, Download, MoreHorizontal, FileText, Eye, Send, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu"
import { useState } from "react"

export const Route = createFileRoute("/_authenticated/admin/billing/invoices")({
  component: InvoicesPage,
})

const invoices = [
  {
    id: "INV-2024-001",
    patient: "Max",
    owner: "John Smith",
    amount: 270.0,
    status: "OVERDUE",
    date: "2024-01-15",
    dueDate: "2024-02-15",
  },
  {
    id: "INV-2024-002",
    patient: "Luna",
    owner: "Jane Doe",
    amount: 162.0,
    status: "SENT",
    date: "2024-01-20",
    dueDate: "2024-02-20",
  },
  {
    id: "INV-2024-003",
    patient: "Buddy",
    owner: "Mike Johnson",
    amount: 350.0,
    status: "PAID",
    date: "2024-01-22",
    dueDate: "2024-02-22",
  },
  {
    id: "INV-2024-004",
    patient: "Whiskers",
    owner: "Sarah Williams",
    amount: 125.0,
    status: "DRAFT",
    date: "2024-01-23",
    dueDate: "2024-02-23",
  },
  {
    id: "INV-2024-005",
    patient: "Rocky",
    owner: "Tom Brown",
    amount: 485.0,
    status: "PAID",
    date: "2024-01-24",
    dueDate: "2024-02-24",
  },
]

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
}

function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter ? invoice.status === statusFilter : true
    return matchesSearch && matchesStatus
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage invoices, track payments, and send to clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search patient or owner..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
              </select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Invoice</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Patient</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Owner</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice, index) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="border-b hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle font-medium">{invoice.id}</td>
                    <td className="p-4 align-middle">{invoice.patient}</td>
                    <td className="p-4 align-middle">{invoice.owner}</td>
                    <td className="p-4 align-middle text-muted-foreground">{invoice.date}</td>
                    <td className="p-4 align-middle font-medium">${invoice.amount.toFixed(2)}</td>
                    <td className="p-4 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[invoice.status]
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Send className="h-4 w-4" />
                            Send
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <FileText className="h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>Showing {filteredInvoices.length} of {invoices.length} invoices</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Plus, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"

export const Route = createFileRoute("/_authenticated/billing/dashboard")({
  component: BillingDashboard,
})

const stats = [
  {
    title: "Today's Revenue",
    value: "$1,250.00",
    change: "+12%",
    icon: DollarSign,
    trend: "up",
  },
  {
    title: "Outstanding",
    value: "$8,750.50",
    change: "Unpaid invoices",
    icon: AlertCircle,
    trend: "neutral",
  },
  {
    title: "Overdue",
    value: "$2,100.00",
    change: "Past due date",
    icon: AlertCircle,
    trend: "down",
  },
  {
    title: "Today's Payments",
    value: "$850.00",
    change: "3 transactions",
    icon: CreditCard,
    trend: "up",
  },
]

const recentInvoices = [
  { id: "INV-2024-001", patient: "Max (Dog)", amount: 270.0, status: "OVERDUE", date: "2024-01-15" },
  { id: "INV-2024-002", patient: "Luna (Cat)", amount: 162.0, status: "SENT", date: "2024-01-20" },
  { id: "INV-2024-003", patient: "Buddy (Dog)", amount: 350.0, status: "PAID", date: "2024-01-22" },
]

function BillingDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of revenue, outstanding invoices, and recent payments
          </p>
        </div>
        <Link to="/admin/billing/invoices">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Revenue trends over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end justify-between gap-2">
              {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                <div key={i} className="w-full flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary/20 rounded-t-sm relative overflow-hidden"
                    style={{ height: `${height * 2}px` }}
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm transition-all duration-500"
                      style={{ height: `${height * 1.5}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Latest billing activity</CardDescription>
            </div>
            <Link to="/admin/billing/invoices">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.patient}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        invoice.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : invoice.status === "OVERDUE"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Invoices</CardTitle>
            <CardDescription>Unpaid bills requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">INV-2024-001</p>
                  <p className="text-sm text-muted-foreground">Max - Golden Retriever</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">$270.00</p>
                  <p className="text-xs text-muted-foreground">30 days overdue</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">INV-2024-002</p>
                  <p className="text-sm text-muted-foreground">Luna - Siamese Cat</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$162.00</p>
                  <p className="text-xs text-muted-foreground">15 days remaining</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common billing tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/admin/billing/invoices">
              <Button variant="outline" className="w-full justify-start gap-3">
                <DollarSign className="h-4 w-4" />
                View All Invoices
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start gap-3">
              <CreditCard className="h-4 w-4" />
              Record Payment
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3">
              <TrendingUp className="h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

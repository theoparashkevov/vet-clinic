import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
})

const stats = [
  {
    title: "Total Revenue",
    value: "$12,450",
    change: "+12% from last month",
    icon: DollarSign,
  },
  {
    title: "Active Patients",
    value: "1,284",
    change: "+5% from last month",
    icon: Users,
  },
  {
    title: "Appointments",
    value: "48",
    change: "Today",
    icon: Calendar,
  },
  {
    title: "Pending Invoices",
    value: "23",
    change: "$8,750 outstanding",
    icon: TrendingUp,
  },
]

const quickActions = [
  { title: "View Invoices", href: "/admin/billing/invoices", icon: DollarSign },
  { title: "Schedule Appointment", href: "/appointments", icon: Calendar },
  { title: "Add Patient", href: "/patients", icon: Users },
  { title: "System Settings", href: "/admin/settings", icon: LayoutDashboard },
]

function AdminDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening at your clinic today.
        </p>
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
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your clinic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New appointment scheduled</p>
                    <p className="text-xs text-muted-foreground">
                      2 hours ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.title} to={action.href}>
                  <div className="flex items-center gap-3 rounded-md p-2 hover:bg-accent transition-colors cursor-pointer">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{action.title}</span>
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

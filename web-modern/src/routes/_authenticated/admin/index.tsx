import { createFileRoute, Link } from "@tanstack/react-router"
import { motion, Reorder } from "framer-motion"
import { useState } from "react"
import {
  LayoutDashboard,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Settings,
  X,
  Plus,
  LayoutGrid,
  List,
  RotateCcw,
  Syringe,
  Pill,
  FlaskConical,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Switch } from "../../../components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip"
import { useUIStore, type DashboardWidget } from "../../../stores/uiStore"
import { toast } from "sonner"

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
})

const widgetConfigs: Record<DashboardWidget, {
  title: string
  value: string
  change: string
  icon: React.ElementType
  color: string
}> = {
  revenue: {
    title: "Total Revenue",
    value: "$12,450",
    change: "+12% from last month",
    icon: DollarSign,
    color: "bg-green-500/10 text-green-600",
  },
  patients: {
    title: "Active Patients",
    value: "1,284",
    change: "+5% from last month",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
  },
  appointments: {
    title: "Appointments",
    value: "48",
    change: "Today",
    icon: Calendar,
    color: "bg-purple-500/10 text-purple-600",
  },
  invoices: {
    title: "Pending Invoices",
    value: "23",
    change: "$8,750 outstanding",
    icon: TrendingUp,
    color: "bg-orange-500/10 text-orange-600",
  },
  vaccinations: {
    title: "Due Vaccinations",
    value: "12",
    change: "This week",
    icon: Syringe,
    color: "bg-red-500/10 text-red-600",
  },
  medications: {
    title: "Low Stock Items",
    value: "5",
    change: "Need reordering",
    icon: Pill,
    color: "bg-yellow-500/10 text-yellow-600",
  },
  "lab-results": {
    title: "Pending Lab Results",
    value: "8",
    change: "Awaiting review",
    icon: FlaskConical,
    color: "bg-cyan-500/10 text-cyan-600",
  },
  "recent-activity": {
    title: "Recent Activity",
    value: "24",
    change: "Last 24 hours",
    icon: Activity,
    color: "bg-pink-500/10 text-pink-600",
  },
}

const availableWidgets: { id: DashboardWidget; label: string; icon: React.ElementType }[] = [
  { id: "revenue", label: "Revenue", icon: DollarSign },
  { id: "patients", label: "Patients", icon: Users },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "invoices", label: "Invoices", icon: TrendingUp },
  { id: "vaccinations", label: "Vaccinations", icon: Syringe },
  { id: "medications", label: "Medications", icon: Pill },
  { id: "lab-results", label: "Lab Results", icon: FlaskConical },
  { id: "recent-activity", label: "Recent Activity", icon: Activity },
]

const quickActions = [
  { title: "View Invoices", href: "/admin/billing/invoices", icon: DollarSign },
  { title: "Schedule Appointment", href: "/appointments", icon: Calendar },
  { title: "Add Patient", href: "/patients", icon: Users },
  { title: "System Settings", href: "/admin/settings", icon: LayoutDashboard },
]

function AdminDashboard() {
  const {
    dashboardLayout,
    toggleDashboardWidget,
    reorderDashboardWidgets,
    setDashboardLayout,
    setShowWelcomeMessage,
    resetDashboardLayout,
  } = useUIStore()

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false)

  const handleReorder = (newOrder: DashboardWidget[]) => {
    reorderDashboardWidgets(newOrder)
  }

  const handleRemoveWidget = (widget: DashboardWidget) => {
    toggleDashboardWidget(widget)
    toast.success(`${widgetConfigs[widget].title} removed from dashboard`)
  }

  const handleAddWidget = (widget: DashboardWidget) => {
    if (!dashboardLayout.widgets.includes(widget)) {
      toggleDashboardWidget(widget)
      toast.success(`${widgetConfigs[widget].title} added to dashboard`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          {dashboardLayout.showWelcomeMessage && (
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s what&apos;s happening at your clinic today.
            </p>
          )}
        </div>
        <Dialog open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Customize
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Customize Dashboard</DialogTitle>
              <DialogDescription>
                Choose which widgets to display and how to arrange them.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Show Welcome Message</p>
                  <p className="text-xs text-muted-foreground">Display the welcome text below the title</p>
                </div>
                <Switch
                  checked={dashboardLayout.showWelcomeMessage}
                  onCheckedChange={setShowWelcomeMessage}
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Layout Style</p>
                <div className="flex gap-2">
                  <Button
                    variant={dashboardLayout.layout === "grid" ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => setDashboardLayout("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Grid
                  </Button>
                  <Button
                    variant={dashboardLayout.layout === "list" ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => setDashboardLayout("list")}
                  >
                    <List className="h-4 w-4" />
                    List
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Available Widgets</p>
                <div className="grid grid-cols-2 gap-2">
                  {availableWidgets.map((widget) => {
                    const isEnabled = dashboardLayout.widgets.includes(widget.id)
                    const Icon = widget.icon
                    return (
                      <Button
                        key={widget.id}
                        variant={isEnabled ? "default" : "outline"}
                        size="sm"
                        className="justify-start gap-2"
                        onClick={() => isEnabled ? handleRemoveWidget(widget.id) : handleAddWidget(widget.id)}
                      >
                        <Icon className="h-4 w-4" />
                        {widget.label}
                        {isEnabled && <X className="h-3 w-3 ml-auto" />}
                        {!isEnabled && <Plus className="h-3 w-3 ml-auto" />}
                      </Button>
                    )
                  })}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2"
                onClick={() => {
                  resetDashboardLayout()
                  toast.success("Dashboard reset to default")
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Default
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Reorder.Group
        axis="y"
        values={dashboardLayout.widgets}
        onReorder={handleReorder}
        className={`grid gap-4 ${
          dashboardLayout.layout === "grid"
            ? "md:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1"
        }`}
      >
        {dashboardLayout.widgets.map((widgetId, index) => {
          const config = widgetConfigs[widgetId]
          const Icon = config.icon
          return (
            <Reorder.Item key={widgetId} value={widgetId}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group relative"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => handleRemoveWidget(widgetId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove widget</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Card className="cursor-grab active:cursor-grabbing">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {config.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{config.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {config.change}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </Reorder.Item>
          )
        })}
      </Reorder.Group>

      {dashboardLayout.widgets.length === 0 && (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <LayoutDashboard className="mx-auto h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">No widgets selected</h3>
              <p className="text-sm text-muted-foreground">
                Click "Customize" to add widgets to your dashboard
              </p>
            </div>
            <Button onClick={() => setIsCustomizeOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Widgets
            </Button>
          </div>
        </Card>
      )}

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
              {[
                { action: "New patient registered", time: "2 minutes ago", user: "Dr. Smith" },
                { action: "Appointment completed", time: "15 minutes ago", user: "Dr. Johnson" },
                { action: "Invoice paid", time: "1 hour ago", user: "System" },
                { action: "Lab results uploaded", time: "2 hours ago", user: "Lab Tech" },
                { action: "Vaccination administered", time: "3 hours ago", user: "Dr. Smith" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{item.action}</p>
                    <p className="text-sm text-muted-foreground">by {item.user}</p>
                  </div>
                  <Badge variant="outline">{item.time}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} to={action.href}>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <Icon className="h-4 w-4" />
                    {action.title}
                  </Button>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

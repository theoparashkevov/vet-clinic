import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

interface AppointmentsByStatus {
  scheduled: number
  completed: number
  cancelled: number
  noShow: number
}

interface AppointmentStatusChartProps {
  data: AppointmentsByStatus
  isLoading?: boolean
}

const STATUS_COLORS = {
  scheduled: "#3b82f6",
  completed: "#10b981",
  cancelled: "#ef4444",
  noShow: "#f59e0b",
}

const STATUS_LABELS = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  noShow: "No Show",
}

export function AppointmentStatusChart({ data, isLoading }: AppointmentStatusChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointments by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full bg-muted animate-pulse rounded-md" />
        </CardContent>
      </Card>
    )
  }

  const chartData = Object.entries(data).map(([key, value]) => ({
    name: STATUS_LABELS[key as keyof typeof STATUS_LABELS],
    value,
    color: STATUS_COLORS[key as keyof typeof STATUS_COLORS],
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Avatar, AvatarFallback } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { 
  Calendar, 
  Plus, 
  Clock,
  User,
  Stethoscope,
  ChevronRight,
  Search,
  Lock,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { useAppointments, useCreateAppointment, useAvailableSlots } from "../../../lib/queries/appointments"
import { usePatients } from "../../../lib/queries/patients"

export const Route = createFileRoute("/_authenticated/appointments/")({
  component: AppointmentsPage,
})

const demoDoctors = [
  { id: "1", name: "Dr. Maria Ivanova", role: "Veterinarian" },
  { id: "2", name: "Dr. Georgi Dimitrov", role: "Veterinarian" },
  { id: "3", name: "Dr. Elena Georgieva", role: "Veterinarian" }
]

function AppointmentsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)
  const [isBlockSlotOpen, setIsBlockSlotOpen] = useState(false)

  const [formData, setFormData] = useState({
    patientId: "",
    ownerId: "",
    reason: "",
    doctorId: "",
    date: "",
    time: "",
  })

  const [blockData, setBlockData] = useState({
    doctor: "",
    time: "",
    reason: "",
  })

  const { data, isLoading, error } = useAppointments(page, 10)
  const createAppointment = useCreateAppointment()
  const { data: patientsData } = usePatients(1, 50)
  const { data: availableSlots } = useAvailableSlots(formData.date, formData.doctorId || undefined)

  const appointments = data?.data || []
  const meta = data?.meta
  const patients = patientsData?.data || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const selectedPatient = patients.find(p => p.id === formData.patientId)
      if (!selectedPatient) {
        toast.error("Please select a patient")
        return
      }

      const startsAt = new Date(`${formData.date}T${formData.time}`)
      const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000)

      await createAppointment.mutateAsync({
        patientId: formData.patientId,
        ownerId: selectedPatient.ownerId,
        doctorId: formData.doctorId || undefined,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        reason: formData.reason,
      })

      setFormData({ patientId: "", ownerId: "", reason: "", doctorId: "", date: "", time: "" })
      setIsNewAppointmentOpen(false)
      toast.success("Appointment scheduled successfully")
    } catch (err) {
      toast.error("Failed to schedule appointment")
    }
  }

  const handleBlockSlot = (e: React.FormEvent) => {
    e.preventDefault()
    setBlockData({ doctor: "", time: "", reason: "" })
    setIsBlockSlotOpen(false)
    toast.success("Time slot blocked")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in-progress": return "bg-blue-100 text-blue-800"
      case "checked-in": return "bg-purple-100 text-purple-800"
      case "cancelled": return "bg-red-100 text-red-800"
      case "no-show": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const today = new Date().toISOString().split("T")[0]
  const todayAppointments = appointments.filter(a => a.startsAt.startsWith(today))

  const stats = {
    total: meta?.total || 0,
    today: todayAppointments.length,
    checkedIn: todayAppointments.filter(a => a.status === "scheduled").length,
    completed: todayAppointments.filter(a => a.status === "completed").length,
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">Failed to load appointments</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage your clinic schedule</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ to: "/calendar" })}>
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
          <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
                <DialogDescription>Book a new appointment for a patient.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Patient</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.patientId}
                        onValueChange={(value) => {
                          const patient = patients.find(p => p.id === value)
                          setFormData({ 
                            ...formData, 
                            patientId: value,
                            ownerId: patient?.ownerId || ""
                          })
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name} ({patient.species})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Select
                        value={formData.time}
                        onValueChange={(value) => setFormData({ ...formData, time: value })}
                        disabled={!formData.date || !formData.doctorId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={availableSlots ? "Select time" : "Select doctor first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots?.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {new Date(`2000-01-01T${slot}`).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Doctor</Label>
                    <Select
                      value={formData.doctorId}
                      onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {demoDoctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="e.g. Annual Checkup"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsNewAppointmentOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAppointment.isPending}>
                    {createAppointment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Schedule
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isBlockSlotOpen} onOpenChange={setIsBlockSlotOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Lock className="mr-2 h-4 w-4" />
                Block Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Block Time Slot</DialogTitle>
                <DialogDescription>Block a time slot for breaks or other activities.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBlockSlot}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="blockDoctor">Doctor</Label>
                    <Select
                      value={blockData.doctor}
                      onValueChange={(value) => setBlockData({ ...blockData, doctor: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {demoDoctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blockTime">Time</Label>
                    <Input
                      id="blockTime"
                      type="time"
                      value={blockData.time}
                      onChange={(e) => setBlockData({ ...blockData, time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blockReason">Reason</Label>
                    <Input
                      id="blockReason"
                      value={blockData.reason}
                      onChange={(e) => setBlockData({ ...blockData, reason: e.target.value })}
                      placeholder="e.g. Lunch break, Surgery"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsBlockSlotOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Block Slot</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.today}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.checkedIn}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.total}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : appointments.length === 0 ? (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No appointments found</p>
                <p className="text-sm">Schedule your first appointment to get started</p>
              </div>
            </Card>
          ) : (
            appointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[70px]">
                        <div className="text-lg font-semibold">
                          {formatTime(appointment.startsAt)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(appointment.startsAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <div className="h-10 w-px bg-border" />
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10">
                          {appointment.patient?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{appointment.patient?.name || "Unknown"}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {appointment.reason || "No reason"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {appointment.patient?.breed || appointment.patient?.species || "Unknown breed"} • {appointment.owner?.name || "Unknown owner"}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{demoDoctors.find(d => d.id === appointment.doctorId)?.name || "Unassigned"}</p>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </motion.div>
  )
}
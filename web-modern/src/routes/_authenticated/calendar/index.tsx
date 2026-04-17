import { createFileRoute } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { useState, useRef } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Checkbox } from "../../../components/ui/checkbox"
import { Label } from "../../../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"
import { Clock, User, ChevronLeft, ChevronRight, Filter, Calendar } from "lucide-react"

export const Route = createFileRoute("/_authenticated/calendar/")({
  component: CalendarPage,
})

interface Appointment {
  id: string
  title: string
  start: string
  end: string
  doctorId: string
  doctorName: string
  doctorColor: string
  patientName: string
  reason: string
  status: "scheduled" | "completed" | "cancelled"
}

interface Doctor {
  id: string
  name: string
  color: string
  avatar: string
}

const doctors: Doctor[] = [
  { id: "1", name: "Dr. Maria Ivanova", color: "#0d9488", avatar: "MI" },
  { id: "2", name: "Dr. Georgi Dimitrov", color: "#8b5cf6", avatar: "GD" },
  { id: "3", name: "Dr. Elena Georgieva", color: "#f59e0b", avatar: "EG" },
  { id: "4", name: "Dr. Petar Stoyanov", color: "#ec4899", avatar: "PS" },
]

const demoAppointments: Appointment[] = [
  {
    id: "1",
    title: "Max - Annual Checkup",
    start: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
    doctorId: "1",
    doctorName: "Dr. Maria Ivanova",
    doctorColor: "#0d9488",
    patientName: "Max",
    reason: "Annual vaccination checkup",
    status: "scheduled",
  },
  {
    id: "2",
    title: "Bella - Surgery Follow-up",
    start: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
    doctorId: "2",
    doctorName: "Dr. Georgi Dimitrov",
    doctorColor: "#8b5cf6",
    patientName: "Bella",
    reason: "Post-surgery checkup",
    status: "scheduled",
  },
  {
    id: "3",
    title: "Rocky - Vaccination",
    start: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(11, 15, 0, 0)).toISOString(),
    doctorId: "1",
    doctorName: "Dr. Maria Ivanova",
    doctorColor: "#0d9488",
    patientName: "Rocky",
    reason: "Rabies booster",
    status: "scheduled",
  },
  {
    id: "4",
    title: "Luna - Dental Cleaning",
    start: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    doctorId: "3",
    doctorName: "Dr. Elena Georgieva",
    doctorColor: "#f59e0b",
    patientName: "Luna",
    reason: "Dental cleaning & examination",
    status: "scheduled",
  },
  {
    id: "5",
    title: "Charlie - Skin Allergy",
    start: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
    end: new Date(new Date().setHours(16, 30, 0, 0)).toISOString(),
    doctorId: "4",
    doctorName: "Dr. Petar Stoyanov",
    doctorColor: "#ec4899",
    patientName: "Charlie",
    reason: "Skin allergy consultation",
    status: "scheduled",
  },
]

function CalendarPage() {
  const calendarRef = useRef<FullCalendar>(null)
  const [appointments] = useState<Appointment[]>(demoAppointments)
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>(doctors.map(d => d.id))
  const [viewType, setViewType] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay">("timeGridWeek")
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)

  const filteredAppointments = appointments.filter(apt => 
    selectedDoctors.includes(apt.doctorId)
  )

  const handleEventClick = (info: any) => {
    const appointment = appointments.find(apt => apt.id === info.event.id)
    if (appointment) {
      setSelectedEvent(appointment)
      setIsEventDialogOpen(true)
    }
  }

  const handleDateSelect = (info: any) => {
    // Future: Open new appointment dialog with selected date
    console.log("Selected date range:", info.start, info.end)
  }

  const toggleDoctor = (doctorId: string) => {
    setSelectedDoctors(prev => 
      prev.includes(doctorId) 
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    )
  }

  const goToToday = () => {
    calendarRef.current?.getApi().today()
  }

  const goToPrev = () => {
    calendarRef.current?.getApi().prev()
  }

  const goToNext = () => {
    calendarRef.current?.getApi().next()
  }

  const getDoctorAppointmentsCount = (doctorId: string) => {
    return appointments.filter(apt => apt.doctorId === doctorId).length
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage appointments for all veterinarians
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={goToPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Select value={viewType} onValueChange={(v) => setViewType(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dayGridMonth">Month</SelectItem>
              <SelectItem value="timeGridWeek">Week</SelectItem>
              <SelectItem value="timeGridDay">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Doctor Filters */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Doctors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`doctor-${doctor.id}`}
                    checked={selectedDoctors.includes(doctor.id)}
                    onCheckedChange={() => toggleDoctor(doctor.id)}
                  />
                  <Label
                    htmlFor={`doctor-${doctor.id}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: doctor.color }}
                    />
                    <span className="text-sm font-medium">{doctor.name}</span>
                  </Label>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {getDoctorAppointmentsCount(doctor.id)}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setSelectedDoctors(doctors.map(d => d.id))}
              >
                Select All
              </Button>
            </div>

            {/* Stats */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Today</span>
                <span className="font-medium">{filteredAppointments.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">
                  {filteredAppointments.filter(a => a.status === "completed").length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">
                  {filteredAppointments.filter(a => a.status === "scheduled").length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={viewType}
              views={{
                dayGridMonth: { buttonText: "Month" },
                timeGridWeek: { buttonText: "Week" },
                timeGridDay: { buttonText: "Day" },
              }}
              headerToolbar={false}
              events={filteredAppointments.map(apt => ({
                id: apt.id,
                title: apt.title,
                start: apt.start,
                end: apt.end,
                backgroundColor: apt.doctorColor,
                borderColor: apt.doctorColor,
                textColor: "#ffffff",
                extendedProps: apt,
              }))}
              eventClick={handleEventClick}
              selectable={true}
              select={handleDateSelect}
              height="auto"
              aspectRatio={1.8}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              allDaySlot={false}
              nowIndicator={true}
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5],
                startTime: "09:00",
                endTime: "18:00",
              }}
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                meridiem: false,
                hour12: false,
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              View appointment information
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: selectedEvent.doctorColor }}
                >
                  {selectedEvent.doctorName.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium">{selectedEvent.doctorName}</p>
                  <p className="text-sm text-muted-foreground">Veterinarian</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedEvent.patientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(selectedEvent.start).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(selectedEvent.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - 
                    {new Date(selectedEvent.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <p className="text-sm">{selectedEvent.reason}</p>
              </div>

              <div className="flex items-center gap-2">
                <Label>Status</Label>
                <Badge variant={selectedEvent.status === "completed" ? "default" : "outline"}>
                  {selectedEvent.status}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
              Close
            </Button>
            <Button>View Patient Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

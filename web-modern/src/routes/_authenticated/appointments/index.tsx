import { createFileRoute, Link } from "@tanstack/react-router"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
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
  Lock
} from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/_authenticated/appointments/")({
  component: AppointmentsPage,
})

type Appointment = {
  id: number
  time: string
  patient: string
  owner: string
  reason: string
  doctor: string
  status: string
  type: string
}

const initialAppointments: Appointment[] = [
  { id: 1, time: "09:00 AM", patient: "Max", owner: "John Smith", reason: "Annual Checkup", doctor: "Dr. Maria Ivanova", status: "Checked In", type: "Routine" },
  { id: 2, time: "09:30 AM", patient: "Luna", owner: "Sarah Johnson", reason: "Vaccination", doctor: "Dr. Maria Ivanova", status: "In Progress", type: "Vaccination" },
  { id: 3, time: "10:00 AM", patient: "Buddy", owner: "Mike Davis", reason: "Skin Rash", doctor: "Dr. Georgi Dimitrov", status: "Scheduled", type: "Sick Visit" },
  { id: 4, time: "10:30 AM", patient: "Mittens", owner: "Emily Brown", reason: "Follow-up", doctor: "Dr. Elena Georgieva", status: "Scheduled", type: "Follow-up" },
  { id: 5, time: "11:00 AM", patient: "Rocky", owner: "Tom Wilson", reason: "Limping", doctor: "Dr. Georgi Dimitrov", status: "Scheduled", type: "Sick Visit" },
  { id: 6, time: "02:00 PM", patient: "Snowball", owner: "Lisa Anderson", reason: "Dental Cleaning", doctor: "Dr. Elena Georgieva", status: "Scheduled", type: "Procedure" },
]

const demoDoctors = [
  { name: "Dr. Maria Ivanova", role: "Veterinarian", appointments: 8 },
  { name: "Dr. Georgi Dimitrov", role: "Veterinarian", appointments: 6 },
  { name: "Dr. Elena Georgieva", role: "Veterinarian", appointments: 5 }
]

const demoPatients = [
  { id: 1, name: "Max", owner: "John Smith", breed: "Golden Retriever" },
  { id: 2, name: "Luna", owner: "Sarah Johnson", breed: "Siamese Cat" },
  { id: 3, name: "Buddy", owner: "Mike Davis", breed: "Labrador" },
  { id: 4, name: "Mittens", owner: "Emily Brown", breed: "Persian Cat" },
  { id: 5, name: "Rocky", owner: "Tom Wilson", breed: "Bulldog" },
  { id: 6, name: "Snowball", owner: "Lisa Anderson", breed: "Rabbit" },
]

function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)
  const [isBlockSlotOpen, setIsBlockSlotOpen] = useState(false)
  const [isPatientLookupOpen, setIsPatientLookupOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [patientSearch, setPatientSearch] = useState("")

  const [formData, setFormData] = useState({
    patient: "",
    owner: "",
    reason: "",
    doctor: "",
    time: "",
    type: "",
  })

  const [blockData, setBlockData] = useState({
    doctor: "",
    time: "",
    reason: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newAppointment: Appointment = {
      id: appointments.length + 1,
      ...formData,
      status: "Scheduled",
    }
    setAppointments([...appointments, newAppointment])
    setFormData({ patient: "", owner: "", reason: "", doctor: "", time: "", type: "" })
    setIsNewAppointmentOpen(false)
    toast.success(`Appointment scheduled for ${formData.patient}`)
  }

  const handleBlockSlot = (e: React.FormEvent) => {
    e.preventDefault()
    const blockedSlot: Appointment = {
      id: appointments.length + 1,
      time: blockData.time,
      patient: "BLOCKED",
      owner: "",
      reason: blockData.reason,
      doctor: blockData.doctor,
      status: "Blocked",
      type: "Blocked",
    }
    setAppointments([...appointments, blockedSlot])
    setBlockData({ doctor: "", time: "", reason: "" })
    setIsBlockSlotOpen(false)
  }

  const filteredAppointments = appointments.filter(apt =>
    apt.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.reason.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPatients = demoPatients.filter(p =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.owner.toLowerCase().includes(patientSearch.toLowerCase())
  )

  const stats = {
    total: appointments.length + 13,
    checkedIn: appointments.filter(a => a.status === "Checked In").length + 4,
    inProgress: appointments.filter(a => a.status === "In Progress").length + 2,
    completed: appointments.filter(a => a.status === "Completed").length + 13,
  }

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
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
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">{today}</p>
        </div>
        <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>New Appointment</DialogTitle>
              <DialogDescription>
                Schedule a new appointment. Fill in all the details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient Name</Label>
                    <Input
                      id="patient"
                      value={formData.patient}
                      onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                      placeholder="e.g. Max"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner">Owner Name</Label>
                    <Input
                      id="owner"
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      placeholder="e.g. John Smith"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Input
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="e.g. Annual Checkup"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Doctor</Label>
                    <Select
                      value={formData.doctor}
                      onValueChange={(value) => setFormData({ ...formData, doctor: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dr. Maria Ivanova">Dr. Maria Ivanova</SelectItem>
                        <SelectItem value="Dr. Georgi Dimitrov">Dr. Georgi Dimitrov</SelectItem>
                        <SelectItem value="Dr. Elena Georgieva">Dr. Elena Georgieva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Appointment Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Routine">Routine Checkup</SelectItem>
                      <SelectItem value="Vaccination">Vaccination</SelectItem>
                      <SelectItem value="Sick Visit">Sick Visit</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Procedure">Procedure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNewAppointmentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Schedule Appointment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">6 remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkedIn}</div>
            <p className="text-xs text-muted-foreground">Waiting to be seen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently being treated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Today's total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Upcoming appointments</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search..." 
                    className="pl-8 w-48"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredAppointments.map((apt, index) => (
                  <motion.div
                    key={apt.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                      apt.status === "Blocked" 
                        ? "bg-muted/50" 
                        : "hover:bg-accent/50 cursor-pointer group"
                    }`}
                  >
                    <div className="text-center min-w-[80px]">
                      <div className="text-sm font-semibold">{apt.time}</div>
                      <div className="text-xs text-muted-foreground">30 min</div>
                    </div>
                    
                    <div className="h-10 w-px bg-border" />
                    
                    {apt.status === "Blocked" ? (
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <Lock className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-red-600">Time Blocked</span>
                          <p className="text-sm text-muted-foreground">{apt.reason}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {apt.patient.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{apt.patient}</span>
                            <span className="text-sm text-muted-foreground">({apt.owner})</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{apt.reason}</div>
                        </div>
                        
                        <div className="hidden md:block text-right">
                          <div className="text-sm font-medium">{apt.doctor}</div>
                          <Badge 
                            variant={
                              apt.status === "In Progress" ? "default" : 
                              apt.status === "Checked In" ? "secondary" : "outline"
                            }
                          >
                            {apt.status}
                          </Badge>
                        </div>
                        
                        <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredAppointments.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No appointments found</p>
                  <p className="text-sm">Try adjusting your search</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Doctors on Duty</CardTitle>
              <CardDescription>Today's veterinarians</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoDoctors.map((doctor, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{doctor.name}</p>
                      <p className="text-sm text-muted-foreground">{doctor.role}</p>
                    </div>
                    <Badge variant="outline">{doctor.appointments} appts</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common scheduling tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Dialog open={isBlockSlotOpen} onOpenChange={setIsBlockSlotOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="mr-2 h-4 w-4" />
                    Block Time Slot
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Block Time Slot</DialogTitle>
                    <DialogDescription>
                      Block a time slot to prevent appointments from being scheduled.
                    </DialogDescription>
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
                            <SelectItem value="Dr. Maria Ivanova">Dr. Maria Ivanova</SelectItem>
                            <SelectItem value="Dr. Georgi Dimitrov">Dr. Georgi Dimitrov</SelectItem>
                            <SelectItem value="Dr. Elena Georgieva">Dr. Elena Georgieva</SelectItem>
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
                      <Button type="submit" variant="destructive">Block Slot</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isPatientLookupOpen} onOpenChange={setIsPatientLookupOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="mr-2 h-4 w-4" />
                    Patient Lookup
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Patient Lookup</DialogTitle>
                    <DialogDescription>
                      Search for a patient to view their details or schedule an appointment.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search patients..." 
                        className="pl-9"
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {filteredPatients.map((patient) => (
                        <Link 
                          key={patient.id} 
                          to="/patients/$patientId"
                          params={{ patientId: patient.id.toString() }}
                          onClick={() => setIsPatientLookupOpen(false)}
                        >
                          <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {patient.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-muted-foreground">{patient.breed}</p>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              {patient.owner}
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                      ))}
                      {filteredPatients.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                          <p className="text-sm">No patients found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="w-full justify-start" onClick={() => alert("Calendar view coming soon!")}>
                <Calendar className="mr-2 h-4 w-4" />
                View Calendar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

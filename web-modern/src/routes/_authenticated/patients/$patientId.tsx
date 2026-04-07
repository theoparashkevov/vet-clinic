import { createFileRoute, useParams } from "@tanstack/react-router"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Avatar, AvatarFallback } from "../../../components/ui/avatar"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
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
  DialogTrigger,
} from "../../../components/ui/dialog"
import { 
  ArrowLeft, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Syringe, 
  FileText, 
  Activity,
  Plus,
  Edit,
  Printer,
  PawPrint,
  Weight,
  AlertCircle,
  CheckCircle2,
  Stethoscope
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"

export const Route = createFileRoute("/_authenticated/patients/$patientId")({
  component: PatientDetailPage,
})

const demoPatient = {
  id: 1,
  name: "Max",
  type: "Dog",
  breed: "Golden Retriever",
  age: "3 years",
  weight: "32 kg",
  color: "Golden",
  microchip: "985112345678901",
  status: "Active",
  owner: {
    name: "John Smith",
    phone: "+1 555-0123",
    email: "john.smith@email.com",
    address: "123 Maple Street, Springfield, IL",
  },
}

type MedicalRecord = {
  id: number
  date: string
  type: string
  veterinarian: string
  diagnosis: string
  notes: string
  medications: string[]
}

type Vaccination = {
  name: string
  date: string
  nextDue: string
  status: string
}

type Appointment = {
  id: number
  date: string
  time: string
  reason: string
  doctor: string
  status: string
}

function PatientDetailPage() {
  useParams({ from: "/_authenticated/patients/$patientId" })

  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([
    {
      id: 1,
      date: "2024-01-15",
      type: "Examination",
      veterinarian: "Dr. Maria Ivanova",
      diagnosis: "Healthy - Annual Checkup",
      notes: "Patient is in excellent health. Weight stable. Coat quality good.",
      medications: [],
    },
    {
      id: 2,
      date: "2023-10-20",
      type: "Sick Visit",
      veterinarian: "Dr. Georgi Dimitrov",
      diagnosis: "Ear Infection (Otitis Externa)",
      notes: "Redness and discharge in left ear. Prescribed antibiotic drops.",
      medications: ["Otomax Otic Suspension - 5 drops twice daily for 7 days"],
    },
  ])

  const [vaccinations, setVaccinations] = useState<Vaccination[]>([
    { name: "Rabies", date: "2023-07-10", nextDue: "2024-07-10", status: "Up to date" },
    { name: "DHPP (Distemper)", date: "2023-07-10", nextDue: "2024-07-10", status: "Up to date" },
    { name: "Bordetella", date: "2023-05-15", nextDue: "2024-05-15", status: "Up to date" },
    { name: "Leptospirosis", date: "2023-07-10", nextDue: "2024-07-10", status: "Up to date" },
    { name: "Lyme Disease", date: "2023-04-20", nextDue: "2024-04-20", status: "Due soon" },
  ])

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 1, date: "2024-01-15", time: "09:00 AM", reason: "Annual Checkup", doctor: "Dr. Maria Ivanova", status: "Completed" },
    { id: 2, date: "2023-10-20", time: "02:30 PM", reason: "Ear Infection", doctor: "Dr. Georgi Dimitrov", status: "Completed" },
    { id: 3, date: "2023-07-10", time: "10:00 AM", reason: "Vaccination", doctor: "Dr. Maria Ivanova", status: "Completed" },
    { id: 4, date: "2024-04-15", time: "11:00 AM", reason: "Follow-up Examination", doctor: "Dr. Maria Ivanova", status: "Scheduled" },
  ])

  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false)
  const [isRecordVaccinationOpen, setIsRecordVaccinationOpen] = useState(false)
  const [isScheduleAppointmentOpen, setIsScheduleAppointmentOpen] = useState(false)
  const [isRecordWeightOpen, setIsRecordWeightOpen] = useState(false)
  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false)
  const [isContactOwnerOpen, setIsContactOwnerOpen] = useState(false)
  const [recordForm, setRecordForm] = useState({
    type: "",
    diagnosis: "",
    notes: "",
    veterinarian: "",
    medications: "",
  })

  const [vaccinationForm, setVaccinationForm] = useState({
    name: "",
    type: "",
    interval: "",
    nextDue: "",
    veterinarian: "",
  })

  const [appointmentForm, setAppointmentForm] = useState({
    date: "",
    time: "",
    reason: "",
    doctor: "",
  })

  const [weightForm, setWeightForm] = useState({
    weight: "",
    notes: "",
  })

  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  })

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault()
    const newRecord: MedicalRecord = {
      id: medicalHistory.length + 1,
      date: new Date().toISOString().split('T')[0],
      type: recordForm.type,
      veterinarian: recordForm.veterinarian,
      diagnosis: recordForm.diagnosis,
      notes: recordForm.notes,
      medications: recordForm.medications.split(',').map(m => m.trim()).filter(Boolean),
    }
    setMedicalHistory([newRecord, ...medicalHistory])
    setRecordForm({ type: "", diagnosis: "", notes: "", veterinarian: "", medications: "" })
    setIsAddRecordOpen(false)
    toast.success("Medical record added successfully")
  }

  const handleRecordVaccination = (e: React.FormEvent) => {
    e.preventDefault()
    const today = new Date().toISOString().split('T')[0]
    const newVax: Vaccination = {
      name: vaccinationForm.name,
      date: today,
      nextDue: vaccinationForm.nextDue,
      status: "Up to date",
    }
    setVaccinations([newVax, ...vaccinations])
    setVaccinationForm({ name: "", type: "", interval: "", nextDue: "", veterinarian: "" })
    setIsRecordVaccinationOpen(false)
    toast.success(`Vaccination recorded: ${vaccinationForm.name}`)
  }

  const handleScheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    const newApt: Appointment = {
      id: appointments.length + 1,
      date: appointmentForm.date,
      time: appointmentForm.time,
      reason: appointmentForm.reason,
      doctor: appointmentForm.doctor,
      status: "Scheduled",
    }
    setAppointments([...appointments, newApt].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
    setAppointmentForm({ date: "", time: "", reason: "", doctor: "" })
    setIsScheduleAppointmentOpen(false)
    toast.success(`Appointment scheduled for ${appointmentForm.date}`)
  }

  const handleRecordWeight = (e: React.FormEvent) => {
    e.preventDefault()
    setWeightForm({ weight: "", notes: "" })
    setIsRecordWeightOpen(false)
    toast.success(`Weight recorded: ${weightForm.weight} kg`)
  }

  const handleContactOwner = (e: React.FormEvent) => {
    e.preventDefault()
    setContactForm({ subject: "", message: "" })
    setIsContactOwnerOpen(false)
    toast.success("Message sent to owner")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/patients">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{demoPatient.name}</h1>
            <p className="text-muted-foreground">
              {demoPatient.breed} • {demoPatient.age} • {demoPatient.weight}
            </p>
          </div>
          <Badge variant={demoPatient.status === "Active" ? "default" : "secondary"}>
            {demoPatient.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => alert("Print functionality coming soon!")}>
            <Printer className="mr-2 h-4 w-4" />
            Print Record
          </Button>
          <Dialog open={isEditPatientOpen} onOpenChange={setIsEditPatientOpen}>
            <DialogTrigger asChild>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Patient</DialogTitle>
                <DialogDescription>Update patient information.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">Edit form would go here...</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditPatientOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsEditPatientOpen(false)}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Patient Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Microchip ID</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{demoPatient.microchip}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Visit</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Jan 15, 2024</div>
            <p className="text-xs text-muted-foreground">45 days ago</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Vaccination</CardTitle>
            <Syringe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Apr 20, 2024</div>
            <p className="text-xs text-muted-foreground">Lyme Disease - Due soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Lifetime appointments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle>Owner Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {demoPatient.owner.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{demoPatient.owner.name}</p>
                <p className="text-sm text-muted-foreground">Primary Owner</p>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {demoPatient.owner.phone}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {demoPatient.owner.email}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {demoPatient.owner.address}
              </div>
            </div>
            <Dialog open={isContactOwnerOpen} onOpenChange={setIsContactOwnerOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Owner
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Contact Owner</DialogTitle>
                  <DialogDescription>Send a message to {demoPatient.owner.name}.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleContactOwner}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        placeholder="e.g. Appointment Reminder"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Type your message here..."
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsContactOwnerOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Send Message</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Dialog open={isScheduleAppointmentOpen} onOpenChange={setIsScheduleAppointmentOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Schedule Appointment</DialogTitle>
                  <DialogDescription>Schedule a new appointment for {demoPatient.name}.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleScheduleAppointment}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="aptDate">Date</Label>
                        <Input
                          id="aptDate"
                          type="date"
                          value={appointmentForm.date}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aptTime">Time</Label>
                        <Input
                          id="aptTime"
                          type="time"
                          value={appointmentForm.time}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aptReason">Reason</Label>
                      <Input
                        id="aptReason"
                        value={appointmentForm.reason}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}
                        placeholder="e.g. Annual Checkup"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aptDoctor">Doctor</Label>
                      <Select
                        value={appointmentForm.doctor}
                        onValueChange={(value) => setAppointmentForm({ ...appointmentForm, doctor: value })}
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
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsScheduleAppointmentOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Schedule</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isRecordVaccinationOpen} onOpenChange={setIsRecordVaccinationOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Syringe className="mr-2 h-4 w-4" />
                  Record Vaccination
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Record Vaccination</DialogTitle>
                  <DialogDescription>Record a new vaccination for {demoPatient.name}.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRecordVaccination}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="vaxName">Vaccine Name</Label>
                      <Input
                        id="vaxName"
                        value={vaccinationForm.name}
                        onChange={(e) => setVaccinationForm({ ...vaccinationForm, name: e.target.value })}
                        placeholder="e.g. Rabies Vaccine"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vaxType">Type</Label>
                        <Select
                          value={vaccinationForm.type}
                          onValueChange={(value) => setVaccinationForm({ ...vaccinationForm, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Core">Core</SelectItem>
                            <SelectItem value="Non-Core">Non-Core</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vaxInterval">Interval</Label>
                        <Select
                          value={vaccinationForm.interval}
                          onValueChange={(value) => setVaccinationForm({ ...vaccinationForm, interval: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6 months">6 months</SelectItem>
                            <SelectItem value="1 year">1 year</SelectItem>
                            <SelectItem value="3 years">3 years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vaxNextDue">Next Due Date</Label>
                      <Input
                        id="vaxNextDue"
                        type="date"
                        value={vaccinationForm.nextDue}
                        onChange={(e) => setVaccinationForm({ ...vaccinationForm, nextDue: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vaxVet">Administered By</Label>
                      <Select
                        value={vaccinationForm.veterinarian}
                        onValueChange={(value) => setVaccinationForm({ ...vaccinationForm, veterinarian: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select veterinarian" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dr. Maria Ivanova">Dr. Maria Ivanova</SelectItem>
                          <SelectItem value="Dr. Georgi Dimitrov">Dr. Georgi Dimitrov</SelectItem>
                          <SelectItem value="Dr. Elena Georgieva">Dr. Elena Georgieva</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsRecordVaccinationOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Record Vaccination</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Add Medical Record
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add Medical Record</DialogTitle>
                  <DialogDescription>Add a new medical record for {demoPatient.name}.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddRecord}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="recType">Record Type</Label>
                        <Select
                          value={recordForm.type}
                          onValueChange={(value) => setRecordForm({ ...recordForm, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Examination">Examination</SelectItem>
                            <SelectItem value="Sick Visit">Sick Visit</SelectItem>
                            <SelectItem value="Procedure">Procedure</SelectItem>
                            <SelectItem value="Follow-up">Follow-up</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recVet">Veterinarian</Label>
                        <Select
                          value={recordForm.veterinarian}
                          onValueChange={(value) => setRecordForm({ ...recordForm, veterinarian: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select veterinarian" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dr. Maria Ivanova">Dr. Maria Ivanova</SelectItem>
                            <SelectItem value="Dr. Georgi Dimitrov">Dr. Georgi Dimitrov</SelectItem>
                            <SelectItem value="Dr. Elena Georgieva">Dr. Elena Georgieva</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recDiagnosis">Diagnosis</Label>
                      <Input
                        id="recDiagnosis"
                        value={recordForm.diagnosis}
                        onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                        placeholder="e.g. Healthy - Annual Checkup"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recNotes">Notes</Label>
                      <Textarea
                        id="recNotes"
                        value={recordForm.notes}
                        onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                        placeholder="Enter detailed notes..."
                        rows={4}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recMeds">Medications (comma separated)</Label>
                      <Input
                        id="recMeds"
                        value={recordForm.medications}
                        onChange={(e) => setRecordForm({ ...recordForm, medications: e.target.value })}
                        placeholder="e.g. Antibiotic - 1 tablet twice daily for 7 days"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddRecordOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Record</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isRecordWeightOpen} onOpenChange={setIsRecordWeightOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Weight className="mr-2 h-4 w-4" />
                  Record Weight
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Record Weight</DialogTitle>
                  <DialogDescription>Record weight measurement for {demoPatient.name}.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRecordWeight}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={weightForm.weight}
                        onChange={(e) => setWeightForm({ ...weightForm, weight: e.target.value })}
                        placeholder="e.g. 32.5"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weightNotes">Notes</Label>
                      <Textarea
                        id="weightNotes"
                        value={weightForm.notes}
                        onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })}
                        placeholder="Optional notes..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsRecordWeightOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Record Weight</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Reminders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-950/20 dark:border-yellow-900">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-yellow-800 dark:text-yellow-200">Vaccination Due Soon</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">Lyme Disease vaccine due in 15 days</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/20 dark:border-green-900">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-green-800 dark:text-green-200">All Clear</p>
                <p className="text-xs text-green-700 dark:text-green-300">Annual checkup completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">
            <FileText className="mr-2 h-4 w-4" />
            Medical History
          </TabsTrigger>
          <TabsTrigger value="vaccinations">
            <Syringe className="mr-2 h-4 w-4" />
            Vaccinations
          </TabsTrigger>
          <TabsTrigger value="appointments">
            <Calendar className="mr-2 h-4 w-4" />
            Appointments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Medical Records</CardTitle>
                <CardDescription>Complete medical history</CardDescription>
              </div>
              <Dialog open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add Medical Record</DialogTitle>
                    <DialogDescription>Add a new medical record for {demoPatient.name}.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddRecord}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tabRecType">Record Type</Label>
                          <Select
                            value={recordForm.type}
                            onValueChange={(value) => setRecordForm({ ...recordForm, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Examination">Examination</SelectItem>
                              <SelectItem value="Sick Visit">Sick Visit</SelectItem>
                              <SelectItem value="Procedure">Procedure</SelectItem>
                              <SelectItem value="Follow-up">Follow-up</SelectItem>
                              <SelectItem value="Emergency">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tabRecVet">Veterinarian</Label>
                          <Select
                            value={recordForm.veterinarian}
                            onValueChange={(value) => setRecordForm({ ...recordForm, veterinarian: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select veterinarian" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Dr. Maria Ivanova">Dr. Maria Ivanova</SelectItem>
                              <SelectItem value="Dr. Georgi Dimitrov">Dr. Georgi Dimitrov</SelectItem>
                              <SelectItem value="Dr. Elena Georgieva">Dr. Elena Georgieva</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tabRecDiagnosis">Diagnosis</Label>
                        <Input
                          id="tabRecDiagnosis"
                          value={recordForm.diagnosis}
                          onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                          placeholder="e.g. Healthy - Annual Checkup"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tabRecNotes">Notes</Label>
                        <Textarea
                          id="tabRecNotes"
                          value={recordForm.notes}
                          onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                          placeholder="Enter detailed notes..."
                          rows={4}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tabRecMeds">Medications (comma separated)</Label>
                        <Input
                          id="tabRecMeds"
                          value={recordForm.medications}
                          onChange={(e) => setRecordForm({ ...recordForm, medications: e.target.value })}
                          placeholder="e.g. Antibiotic - 1 tablet twice daily for 7 days"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddRecordOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Record</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {medicalHistory.map((record, index) => (
                    <motion.div
                      key={record.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{record.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-semibold mt-1">{record.diagnosis}</h4>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <Stethoscope className="inline h-4 w-4 mr-1" />
                          {record.veterinarian}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{record.notes}</p>
                      {record.medications.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Prescribed:</span>
                          <ul className="mt-1 space-y-1">
                            {record.medications.map((med, idx) => (
                              <li key={idx} className="text-muted-foreground">• {med}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {medicalHistory.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No medical records found</p>
                    <p className="text-sm">Add a record to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccinations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Vaccination Records</CardTitle>
                <CardDescription>Vaccination history and upcoming doses</CardDescription>
              </div>
              <Dialog open={isRecordVaccinationOpen} onOpenChange={setIsRecordVaccinationOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Record Vaccination
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Record Vaccination</DialogTitle>
                    <DialogDescription>Record a new vaccination for {demoPatient.name}.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleRecordVaccination}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="tabVaxName">Vaccine Name</Label>
                        <Input
                          id="tabVaxName"
                          value={vaccinationForm.name}
                          onChange={(e) => setVaccinationForm({ ...vaccinationForm, name: e.target.value })}
                          placeholder="e.g. Rabies Vaccine"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tabVaxType">Type</Label>
                          <Select
                            value={vaccinationForm.type}
                            onValueChange={(value) => setVaccinationForm({ ...vaccinationForm, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Core">Core</SelectItem>
                              <SelectItem value="Non-Core">Non-Core</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tabVaxInterval">Interval</Label>
                          <Select
                            value={vaccinationForm.interval}
                            onValueChange={(value) => setVaccinationForm({ ...vaccinationForm, interval: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select interval" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="6 months">6 months</SelectItem>
                              <SelectItem value="1 year">1 year</SelectItem>
                              <SelectItem value="3 years">3 years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tabVaxNextDue">Next Due Date</Label>
                        <Input
                          id="tabVaxNextDue"
                          type="date"
                          value={vaccinationForm.nextDue}
                          onChange={(e) => setVaccinationForm({ ...vaccinationForm, nextDue: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tabVaxVet">Administered By</Label>
                        <Select
                          value={vaccinationForm.veterinarian}
                          onValueChange={(value) => setVaccinationForm({ ...vaccinationForm, veterinarian: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select veterinarian" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dr. Maria Ivanova">Dr. Maria Ivanova</SelectItem>
                            <SelectItem value="Dr. Georgi Dimitrov">Dr. Georgi Dimitrov</SelectItem>
                            <SelectItem value="Dr. Elena Georgieva">Dr. Elena Georgieva</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsRecordVaccinationOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Record Vaccination</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {vaccinations.map((vax, index) => (
                    <motion.div
                      key={`${vax.name}-${index}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          vax.status === "Up to date" ? "bg-green-100" : "bg-yellow-100"
                        }`}>
                          <Syringe className={`h-5 w-5 ${
                            vax.status === "Up to date" ? "text-green-600" : "text-yellow-600"
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{vax.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Last: {new Date(vax.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={vax.status === "Up to date" ? "default" : "secondary"}>
                          {vax.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Next: {new Date(vax.nextDue).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {vaccinations.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Syringe className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No vaccination records found</p>
                    <p className="text-sm">Add a record to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Appointment History</CardTitle>
                <CardDescription>All past and upcoming appointments</CardDescription>
              </div>
              <Dialog open={isScheduleAppointmentOpen} onOpenChange={setIsScheduleAppointmentOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule New
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Schedule Appointment</DialogTitle>
                    <DialogDescription>Schedule a new appointment for {demoPatient.name}.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleScheduleAppointment}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tabAptDate">Date</Label>
                          <Input
                            id="tabAptDate"
                            type="date"
                            value={appointmentForm.date}
                            onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tabAptTime">Time</Label>
                          <Input
                            id="tabAptTime"
                            type="time"
                            value={appointmentForm.time}
                            onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tabAptReason">Reason</Label>
                        <Input
                          id="tabAptReason"
                          value={appointmentForm.reason}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}
                          placeholder="e.g. Annual Checkup"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tabAptDoctor">Doctor</Label>
                        <Select
                          value={appointmentForm.doctor}
                          onValueChange={(value) => setAppointmentForm({ ...appointmentForm, doctor: value })}
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
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsScheduleAppointmentOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Schedule</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {appointments.map((apt, index) => (
                    <motion.div
                      key={apt.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[60px]">
                          <div className="text-sm font-semibold">
                            {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-xs text-muted-foreground">{apt.time}</div>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div>
                          <p className="font-medium">{apt.reason}</p>
                          <p className="text-sm text-muted-foreground">{apt.doctor}</p>
                        </div>
                      </div>
                      <Badge variant={apt.status === "Completed" ? "default" : "outline"}>
                        {apt.status}
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {appointments.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No appointments found</p>
                    <p className="text-sm">Schedule an appointment to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

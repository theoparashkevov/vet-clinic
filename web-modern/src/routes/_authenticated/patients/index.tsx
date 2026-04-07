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
  Search, 
  Plus, 
  PawPrint, 
  Calendar,
  Phone,
  Mail,
  ChevronRight
} from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/_authenticated/patients/")({
  component: PatientsPage,
})

type Patient = {
  id: number
  name: string
  type: string
  breed: string
  owner: string
  phone: string
  email: string
  age: string
  lastVisit: string
  status: string
}

const initialPatients: Patient[] = [
  { id: 1, name: "Max", type: "Dog", breed: "Golden Retriever", owner: "John Smith", phone: "+1 555-0123", email: "john.smith@email.com", age: "3 years", lastVisit: "2024-01-15", status: "Active" },
  { id: 2, name: "Luna", type: "Cat", breed: "Siamese", owner: "Sarah Johnson", phone: "+1 555-0456", email: "sarah.j@email.com", age: "2 years", lastVisit: "2024-01-20", status: "Active" },
  { id: 3, name: "Buddy", type: "Dog", breed: "Labrador", owner: "Mike Davis", phone: "+1 555-0789", email: "mike.davis@email.com", age: "5 years", lastVisit: "2024-01-10", status: "Active" },
  { id: 4, name: "Mittens", type: "Cat", breed: "Persian", owner: "Emily Brown", phone: "+1 555-0321", email: "emily.brown@email.com", age: "4 years", lastVisit: "2024-01-22", status: "Follow-up Required" },
  { id: 5, name: "Rocky", type: "Dog", breed: "Bulldog", owner: "Tom Wilson", phone: "+1 555-0654", email: "tom.wilson@email.com", age: "6 years", lastVisit: "2024-01-08", status: "Active" },
  { id: 6, name: "Snowball", type: "Rabbit", breed: "Holland Lop", owner: "Lisa Anderson", phone: "+1 555-0987", email: "lisa.a@email.com", age: "1 year", lastVisit: "2024-01-25", status: "Active" },
]

function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(initialPatients)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    breed: "",
    owner: "",
    phone: "",
    email: "",
    age: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newPatient: Patient = {
      id: patients.length + 1,
      ...formData,
      lastVisit: new Date().toISOString().split('T')[0],
      status: "Active",
    }
    setPatients([newPatient, ...patients])
    setFormData({ name: "", type: "", breed: "", owner: "", phone: "", email: "", age: "" })
    setIsDialogOpen(false)
    toast.success(`Patient ${formData.name} added successfully`)
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.breed.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: patients.length + 122,
    dogs: patients.filter(p => p.type === "Dog").length + 70,
    cats: patients.filter(p => p.type === "Cat").length + 39,
    exotic: patients.filter(p => !["Dog", "Cat"].includes(p.type)).length + 5,
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
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage your clinic's patients and their records
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Enter the patient details below. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Patient Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Bella"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Animal Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dog">Dog</SelectItem>
                        <SelectItem value="Cat">Cat</SelectItem>
                        <SelectItem value="Bird">Bird</SelectItem>
                        <SelectItem value="Rabbit">Rabbit</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    placeholder="e.g. Golden Retriever"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner Name</Label>
                  <Input
                    id="owner"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 555-0000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="e.g. 2 years"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="owner@email.com"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Patient</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">+5 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dogs</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dogs}</div>
            <p className="text-xs text-muted-foreground">59% of patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cats</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cats}</div>
            <p className="text-xs text-muted-foreground">35% of patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exotic</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.exotic}</div>
            <p className="text-xs text-muted-foreground">Rabbits, birds, etc.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Directory</CardTitle>
          <CardDescription>
            Search and manage your patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search patients..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredPatients.map((patient, index) => (
                <Link key={patient.id} to="/patients/$patientId" params={{ patientId: patient.id.toString() }}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {patient.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{patient.name}</h3>
                          <Badge variant={patient.status === "Active" ? "default" : "secondary"}>
                            {patient.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{patient.breed} • {patient.age}</p>
                        <p className="text-sm text-muted-foreground">Owner: {patient.owner}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="hidden md:block text-right">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {patient.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {patient.phone}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </AnimatePresence>
            {filteredPatients.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <PawPrint className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No patients found</p>
                <p className="text-sm">Try adjusting your search</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

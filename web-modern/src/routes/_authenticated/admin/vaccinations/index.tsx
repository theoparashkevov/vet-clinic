import { createFileRoute } from "@tanstack/react-router"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Badge } from "../../../../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select"
import { Search, Plus, Syringe, Calendar, CheckCircle2, Clock, ChevronRight } from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/_authenticated/admin/vaccinations/")({
  component: VaccinationsPage,
})

type Vaccination = {
  id: number
  name: string
  type: string
  interval: string
  nextDue: string
  status: string
  lastAdministered: string
  veterinarian: string
}

const initialVaccinations: Vaccination[] = [
  {
    id: 1,
    name: "Rabies Vaccine",
    type: "Core",
    interval: "1 year",
    nextDue: "2024-07-10",
    status: "Up to date",
    lastAdministered: "2023-07-10",
    veterinarian: "Dr. Maria Ivanova",
  },
  {
    id: 2,
    name: "DHPP (Distemper)",
    type: "Core",
    interval: "1 year",
    nextDue: "2024-07-10",
    status: "Up to date",
    lastAdministered: "2023-07-10",
    veterinarian: "Dr. Maria Ivanova",
  },
  {
    id: 3,
    name: "Bordetella",
    type: "Non-Core",
    interval: "6 months",
    nextDue: "2024-05-15",
    status: "Up to date",
    lastAdministered: "2023-11-15",
    veterinarian: "Dr. Georgi Dimitrov",
  },
  {
    id: 4,
    name: "Leptospirosis",
    type: "Non-Core",
    interval: "1 year",
    nextDue: "2024-07-10",
    status: "Up to date",
    lastAdministered: "2023-07-10",
    veterinarian: "Dr. Maria Ivanova",
  },
  {
    id: 5,
    name: "Lyme Disease",
    type: "Non-Core",
    interval: "1 year",
    nextDue: "2024-04-20",
    status: "Due soon",
    lastAdministered: "2023-04-20",
    veterinarian: "Dr. Elena Georgieva",
  },
  {
    id: 6,
    name: "Canine Influenza",
    type: "Non-Core",
    interval: "1 year",
    nextDue: "2024-09-01",
    status: "Up to date",
    lastAdministered: "2023-09-01",
    veterinarian: "Dr. Georgi Dimitrov",
  },
]

function VaccinationsPage() {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>(initialVaccinations)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    interval: "",
    nextDue: "",
    veterinarian: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const today = new Date().toISOString().split('T')[0]
    const newVaccination: Vaccination = {
      id: vaccinations.length + 1,
      ...formData,
      status: "Up to date",
      lastAdministered: today,
    }
    setVaccinations([newVaccination, ...vaccinations])
    setFormData({ name: "", type: "", interval: "", nextDue: "", veterinarian: "" })
    setIsDialogOpen(false)
    toast.success(`Vaccination ${formData.name} recorded successfully`)
  }

  const filteredVaccinations = vaccinations.filter(vax =>
    vax.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vax.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vax.veterinarian.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: vaccinations.length + 8,
    upToDate: vaccinations.filter(v => v.status === "Up to date").length + 6,
    dueSoon: vaccinations.filter(v => v.status === "Due soon").length + 1,
    overdue: vaccinations.filter(v => v.status === "Overdue").length + 1,
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
          <h1 className="text-3xl font-bold tracking-tight">Vaccinations</h1>
          <p className="text-muted-foreground">
            Manage vaccination schedules and records
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Vaccination
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Record Vaccination</DialogTitle>
              <DialogDescription>
                Record a new vaccination administration for a patient.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Vaccine Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rabies Vaccine"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
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
                    <Label htmlFor="interval">Interval</Label>
                    <Select
                      value={formData.interval}
                      onValueChange={(value) => setFormData({ ...formData, interval: value })}
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
                  <Label htmlFor="nextDue">Next Due Date</Label>
                  <Input
                    id="nextDue"
                    type="date"
                    value={formData.nextDue}
                    onChange={(e) => setFormData({ ...formData, nextDue: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="veterinarian">Administered By</Label>
                  <Select
                    value={formData.veterinarian}
                    onValueChange={(value) => setFormData({ ...formData, veterinarian: value })}
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Record Vaccination</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Syringe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Vaccinations tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Up to Date</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upToDate}</div>
            <p className="text-xs text-muted-foreground">Current vaccinations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dueSoon}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vaccination Records</CardTitle>
              <CardDescription>Track patient vaccination history</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search vaccinations..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredVaccinations.map((vax, index) => (
                <motion.div
                  key={vax.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      vax.status === "Up to date" ? "bg-green-100" :
                      vax.status === "Due soon" ? "bg-yellow-100" : "bg-red-100"
                    }`}>
                      <Syringe className={`h-6 w-6 ${
                        vax.status === "Up to date" ? "text-green-600" :
                        vax.status === "Due soon" ? "text-yellow-600" : "text-red-600"
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{vax.name}</h3>
                        <Badge variant={vax.type === "Core" ? "default" : "secondary"}>
                          {vax.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Last: {new Date(vax.lastAdministered).toLocaleDateString()} by {vax.veterinarian}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Interval: {vax.interval}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <Badge 
                        variant={
                          vax.status === "Up to date" ? "default" : 
                          vax.status === "Due soon" ? "secondary" : "destructive"
                        }
                      >
                        {vax.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Next: {new Date(vax.nextDue).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredVaccinations.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Syringe className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No vaccinations found</p>
                <p className="text-sm">Try adjusting your search</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

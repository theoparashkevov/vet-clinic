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
import { Search, Plus, Pill, Package, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/_authenticated/admin/medications/")({
  component: MedicationsPage,
})

type Medication = {
  id: number
  name: string
  category: string
  dosage: string
  stock: number
  unit: string
  status: string
  description: string
  expiryDate: string
}

const initialMedications: Medication[] = [
  {
    id: 1,
    name: "Carprofen 75mg",
    category: "Pain Relief",
    dosage: "1 tablet per 25kg body weight",
    stock: 150,
    unit: "tablets",
    status: "In Stock",
    description: "NSAID for pain and inflammation in dogs",
    expiryDate: "2025-06-15",
  },
  {
    id: 2,
    name: "Amoxicillin 500mg",
    category: "Antibiotic",
    dosage: "10mg/kg twice daily",
    stock: 80,
    unit: "capsules",
    status: "In Stock",
    description: "Broad-spectrum antibiotic for bacterial infections",
    expiryDate: "2025-03-20",
  },
  {
    id: 3,
    name: "Heartgard Plus",
    category: "Parasiticide",
    dosage: "1 chewable per month",
    stock: 45,
    unit: "chewables",
    status: "Low Stock",
    description: "Heartworm prevention for dogs",
    expiryDate: "2025-08-10",
  },
  {
    id: 4,
    name: "Prednisone 20mg",
    category: "Steroid",
    dosage: "0.5mg/kg once daily",
    stock: 200,
    unit: "tablets",
    status: "In Stock",
    description: "Corticosteroid for anti-inflammatory treatment",
    expiryDate: "2025-04-25",
  },
  {
    id: 5,
    name: "Apoquel 16mg",
    category: "Allergy",
    dosage: "0.4-0.6mg/kg twice daily",
    stock: 12,
    unit: "tablets",
    status: "Low Stock",
    description: "Treatment for allergic dermatitis in dogs",
    expiryDate: "2025-05-30",
  },
]

function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>(initialMedications)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    dosage: "",
    stock: "",
    unit: "",
    description: "",
    expiryDate: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newMedication: Medication = {
      id: medications.length + 1,
      name: formData.name,
      category: formData.category,
      dosage: formData.dosage,
      stock: parseInt(formData.stock),
      unit: formData.unit,
      description: formData.description,
      expiryDate: formData.expiryDate,
      status: parseInt(formData.stock) < 20 ? "Low Stock" : "In Stock",
    }
    setMedications([newMedication, ...medications])
    setFormData({ name: "", category: "", dosage: "", stock: "", unit: "", description: "", expiryDate: "" })
    setIsDialogOpen(false)
    toast.success(`Medication ${formData.name} added successfully`)
  }

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: medications.length + 45,
    inStock: medications.filter(m => m.status === "In Stock").length + 38,
    lowStock: medications.filter(m => m.status === "Low Stock").length + 5,
    outOfStock: medications.filter(m => m.status === "Out of Stock").length + 2,
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
          <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
          <p className="text-muted-foreground">
            Manage medication inventory and prescriptions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
              <DialogDescription>
                Add a new medication to the inventory.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Medication Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Amoxicillin 500mg"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Antibiotic">Antibiotic</SelectItem>
                        <SelectItem value="Pain Relief">Pain Relief</SelectItem>
                        <SelectItem value="Steroid">Steroid</SelectItem>
                        <SelectItem value="Allergy">Allergy</SelectItem>
                        <SelectItem value="Parasiticide">Parasiticide</SelectItem>
                        <SelectItem value="Vaccine">Vaccine</SelectItem>
                        <SelectItem value="Supplement">Supplement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tablets">Tablets</SelectItem>
                        <SelectItem value="capsules">Capsules</SelectItem>
                        <SelectItem value="ml">ml (liquid)</SelectItem>
                        <SelectItem value="injections">Injections</SelectItem>
                        <SelectItem value="chewables">Chewables</SelectItem>
                        <SelectItem value="bottles">Bottles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage Instructions</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g. 1 tablet per 25kg body weight"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the medication"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Medication</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medications</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inStock}</div>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Below 20 units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">Needs reordering</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Medication Inventory</CardTitle>
              <CardDescription>Track medications and prescriptions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search medications..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredMedications.map((med, index) => (
                <motion.div
                  key={med.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      med.status === "In Stock" ? "bg-green-100" :
                      med.status === "Low Stock" ? "bg-yellow-100" : "bg-red-100"
                    }`}>
                      <Pill className={`h-6 w-6 ${
                        med.status === "In Stock" ? "text-green-600" :
                        med.status === "Low Stock" ? "text-yellow-600" : "text-red-600"
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{med.name}</h3>
                        <Badge variant="secondary">{med.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{med.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Dosage: {med.dosage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <Badge 
                        variant={
                          med.status === "In Stock" ? "default" : 
                          med.status === "Low Stock" ? "secondary" : "destructive"
                        }
                      >
                        {med.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">
                        {med.stock} {med.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Exp: {new Date(med.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredMedications.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Pill className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No medications found</p>
                <p className="text-sm">Try adjusting your search</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

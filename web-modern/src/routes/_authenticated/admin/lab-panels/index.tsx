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
import { Search, Plus, FlaskConical, Beaker, ChevronRight, FileText } from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/_authenticated/admin/lab-panels/")({
  component: LabPanelsPage,
})

type LabPanel = {
  id: number
  name: string
  category: string
  tests: string[]
  price: number
  status: string
  description: string
}

const initialPanels: LabPanel[] = [
  {
    id: 1,
    name: "Complete Blood Count (CBC)",
    category: "Hematology",
    tests: ["WBC", "RBC", "Hemoglobin", "Hematocrit", "Platelets"],
    price: 85,
    status: "Active",
    description: "Comprehensive blood analysis including red and white blood cell counts",
  },
  {
    id: 2,
    name: "Comprehensive Metabolic Panel",
    category: "Chemistry",
    tests: ["Glucose", "BUN", "Creatinine", "Electrolytes", "Liver Enzymes"],
    price: 120,
    status: "Active",
    description: "Blood chemistry panel for organ function assessment",
  },
  {
    id: 3,
    name: "Thyroid Function Panel",
    category: "Endocrinology",
    tests: ["T4", "T3", "TSH"],
    price: 95,
    status: "Active",
    description: "Thyroid hormone levels for metabolic assessment",
  },
  {
    id: 4,
    name: "Urinalysis",
    category: "Urinalysis",
    tests: ["pH", "Protein", "Glucose", "Ketones", "Bilirubin"],
    price: 45,
    status: "Active",
    description: "Complete urine analysis for kidney and metabolic health",
  },
  {
    id: 5,
    name: "Fecal Parasite Panel",
    category: "Parasitology",
    tests: ["Giardia", "Hookworm", "Roundworm", "Whipworm", "Coccidia"],
    price: 65,
    status: "Active",
    description: "Stool analysis for common intestinal parasites",
  },
]

function LabPanelsPage() {
  const [panels, setPanels] = useState<LabPanel[]>(initialPanels)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    tests: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newPanel: LabPanel = {
      id: panels.length + 1,
      name: formData.name,
      category: formData.category,
      description: formData.description,
      price: parseFloat(formData.price),
      status: "Active",
      tests: formData.tests.split(",").map(t => t.trim()).filter(Boolean),
    }
    setPanels([newPanel, ...panels])
    setFormData({ name: "", category: "", description: "", price: "", tests: "" })
    setIsDialogOpen(false)
    toast.success(`Lab panel ${formData.name} created successfully`)
  }

  const filteredPanels = panels.filter(panel =>
    panel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    panel.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    panel.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = [...new Set(panels.map(p => p.category))]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Panels</h1>
          <p className="text-muted-foreground">
            Manage laboratory test panels and configurations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Panel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Lab Panel</DialogTitle>
              <DialogDescription>
                Create a new laboratory test panel with tests and pricing.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Panel Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Advanced Metabolic Panel"
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
                        <SelectItem value="Hematology">Hematology</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                        <SelectItem value="Urinalysis">Urinalysis</SelectItem>
                        <SelectItem value="Parasitology">Parasitology</SelectItem>
                        <SelectItem value="Microbiology">Microbiology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the panel"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tests">Tests (comma separated)</Label>
                  <Input
                    id="tests"
                    value={formData.tests}
                    onChange={(e) => setFormData({ ...formData, tests: e.target.value })}
                    placeholder="e.g. Test1, Test2, Test3"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Enter test names separated by commas</p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Panel</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Panels</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{panels.length + 12}</div>
            <p className="text-xs text-muted-foreground">Configured panels</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length + 3}</div>
            <p className="text-xs text-muted-foreground">Lab categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Panels</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{panels.length + 10}</div>
            <p className="text-xs text-muted-foreground">Available for order</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <span className="text-sm text-muted-foreground">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$82</div>
            <p className="text-xs text-muted-foreground">Per panel</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lab Panel Library</CardTitle>
              <CardDescription>Available laboratory test panels</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search lab panels..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredPanels.map((panel, index) => (
                <motion.div
                  key={panel.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <FlaskConical className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{panel.name}</h3>
                        <Badge variant={panel.status === "Active" ? "default" : "secondary"}>
                          {panel.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{panel.description}</p>
                      <div className="flex gap-2 mt-1">
                        {panel.tests.slice(0, 3).map((test, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {test}
                          </Badge>
                        ))}
                        {panel.tests.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{panel.tests.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <Badge variant="secondary">{panel.category}</Badge>
                      <p className="text-sm font-medium mt-1">${panel.price.toFixed(2)}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredPanels.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FlaskConical className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No lab panels found</p>
                <p className="text-sm">Try adjusting your search</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

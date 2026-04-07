import { createFileRoute } from "@tanstack/react-router"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Badge } from "../../../../components/ui/badge"
import { Textarea } from "../../../../components/ui/textarea"
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
import { Search, Plus, FileEdit, Copy, Clock, Tag } from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/_authenticated/admin/note-templates/")({
  component: NoteTemplatesPage,
})

type NoteTemplate = {
  id: number
  name: string
  category: string
  content: string
  tags: string[]
  lastUsed: string
  usageCount: number
}

const initialTemplates: NoteTemplate[] = [
  {
    id: 1,
    name: "Annual Wellness Exam",
    category: "Preventive Care",
    content: "Patient presented for annual wellness examination. Overall health is good. Weight stable. Vaccines updated. Recommended routine parasite prevention. Next visit in 12 months.",
    tags: ["routine", "checkup", "annual"],
    lastUsed: "2024-01-15",
    usageCount: 45,
  },
  {
    id: 2,
    name: "Sick Visit - GI Issues",
    category: "Illness",
    content: "Patient presented with vomiting/diarrhea. Appetite reduced. Hydration status checked. Recommend bland diet for 48 hours. Monitor for improvement. Return if symptoms worsen.",
    tags: ["gi", "vomiting", "diarrhea"],
    lastUsed: "2024-01-10",
    usageCount: 28,
  },
  {
    id: 3,
    name: "Post-Surgery Follow-up",
    category: "Surgery",
    content: "Post-operative recheck. Incision site examined - healing well, no signs of infection. Activity restrictions discussed. Suture removal scheduled if applicable. Continue pain management as directed.",
    tags: ["surgery", "follow-up", "recovery"],
    lastUsed: "2024-01-08",
    usageCount: 32,
  },
  {
    id: 4,
    name: "Skin Allergy Consultation",
    category: "Dermatology",
    content: "Patient presented with pruritus and skin inflammation. Allergic dermatitis suspected. Recommend allergy testing or food trial. Prescribed antihistamines and topical treatment. Recheck in 2 weeks.",
    tags: ["allergy", "skin", "dermatology"],
    lastUsed: "2024-01-05",
    usageCount: 19,
  },
  {
    id: 5,
    name: "Dental Cleaning Post-Op",
    category: "Dental",
    content: "Dental procedure completed successfully. Extractions performed as needed. Patient recovered well from anesthesia. Soft food diet recommended for 5-7 days. Pain management prescribed.",
    tags: ["dental", "surgery", "cleaning"],
    lastUsed: "2024-01-03",
    usageCount: 24,
  },
]

function NoteTemplatesPage() {
  const [templates, setTemplates] = useState<NoteTemplate[]>(initialTemplates)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    content: "",
    tags: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newTemplate: NoteTemplate = {
      id: templates.length + 1,
      name: formData.name,
      category: formData.category,
      content: formData.content,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      lastUsed: "Never",
      usageCount: 0,
    }
    setTemplates([newTemplate, ...templates])
    setFormData({ name: "", category: "", content: "", tags: "" })
    setIsDialogOpen(false)
    toast.success(`Template ${formData.name} created successfully`)
  }

  const handleCopyTemplate = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success("Template copied to clipboard!")
  }

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const categories = [...new Set(templates.map(t => t.category))]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Note Templates</h1>
          <p className="text-muted-foreground">
            Manage medical note templates for quick documentation
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a reusable note template for quick documentation.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Annual Wellness Exam"
                    required
                  />
                </div>
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
                      <SelectItem value="Preventive Care">Preventive Care</SelectItem>
                      <SelectItem value="Illness">Illness</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                      <SelectItem value="Dermatology">Dermatology</SelectItem>
                      <SelectItem value="Dental">Dental</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Template Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter the template content here..."
                    rows={6}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. routine, checkup, annual"
                  />
                  <p className="text-xs text-muted-foreground">Add tags to make templates easier to find</p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Template</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <FileEdit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length + 15}</div>
            <p className="text-xs text-muted-foreground">Active templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length + 3}</div>
            <p className="text-xs text-muted-foreground">Template categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Annual Wellness</div>
            <p className="text-xs text-muted-foreground">45 uses this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.reduce((acc, t) => acc + t.usageCount, 0) + 180}</div>
            <p className="text-xs text-muted-foreground">All time template uses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Template Library</CardTitle>
              <CardDescription>Create and manage reusable note templates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search templates..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.content}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleCopyTemplate(template.content)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {template.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Used {template.usageCount} times</span>
                      <span>Last: {template.lastUsed}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileEdit className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No templates found</p>
                <p className="text-sm">Try adjusting your search or create a new template</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

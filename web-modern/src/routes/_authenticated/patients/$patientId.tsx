import { createFileRoute, useParams, Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Avatar, AvatarFallback } from "../../../components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"
import { 
  ArrowLeft, 
  Calendar, 
  Phone, 
  Mail, 
  Edit,
  Printer,
  PawPrint,
  Activity,
  Loader2,
  ImageIcon,
  Camera,
  Plus
} from "lucide-react"
import { usePatient } from "../../../lib/queries/patients"
import { useLabResults } from "../../../lib/queries/labs"
import type { LabResult } from "../../../lib/api/labs"
import { downloadPatientRecordPDF } from "../../../lib/pdf/patientRecord"
import { LabResultsList } from "../../../components/labs/LabResultsList"

export const Route = createFileRoute("/_authenticated/patients/\$patientId")({
  component: PatientDetailPage,
})

function PatientDetailPage() {
  const { patientId } = useParams({ from: "/_authenticated/patients/\$patientId" })
  const { data: patient, isLoading, error } = usePatient(patientId)
  const { data: labResults, isLoading: isLoadingLabs } = useLabResults(patientId)

  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false)
  const [selectedLabResult, setSelectedLabResult] = useState<LabResult | null>(null)
  const [isAddLabResultOpen, setIsAddLabResultOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">Failed to load patient data</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  const getSpeciesIcon = (species: string) => {
    const s = species?.toLowerCase() || ""
    if (s === "dog") return "🐕"
    if (s === "cat") return "🐱"
    if (s === "rabbit") return "🐰"
    if (s === "bird") return "🐦"
    return "🐾"
  }

  const calculateAge = (birthdate?: string) => {
    if (!birthdate) return "Unknown"
    const birth = new Date(birthdate)
    const now = new Date()
    const years = Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    if (years < 1) {
      const months = Math.floor((now.getTime() - birth.getTime()) / (30.44 * 24 * 60 * 60 * 1000))
      return months + " months"
    }
    return years + " years"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/patients">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg bg-primary/10">
                {getSpeciesIcon(patient.species)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
              <p className="text-muted-foreground">
                {patient.breed || patient.species} • {calculateAge(patient.birthdate)}
              </p>
            </div>
          </div>
          <Badge variant="default">Active</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            downloadPatientRecordPDF({
              patient: {
                name: patient.name,
                type: patient.species,
                breed: patient.breed || "Unknown",
                age: calculateAge(patient.birthdate),
                weight: "Unknown",
                color: "Unknown",
                microchip: patient.microchipId || "N/A",
                status: "Active",
              },
              owner: {
                name: patient.owner?.name || "Unknown",
                phone: patient.owner?.phone || "N/A",
                email: patient.owner?.email || "N/A",
                address: "N/A",
              },
              medicalHistory: [],
              vaccinations: [],
              appointments: [],
            })
          }}>
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
                <p className="text-sm text-muted-foreground">Edit form coming soon...</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Microchip ID</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{patient.microchipId || "N/A"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Species</CardTitle>
            <span className="text-2xl">{getSpeciesIcon(patient.species)}</span>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium capitalize">{patient.species}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Added</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {new Date(patient.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {new Date(patient.updatedAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Owner Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {patient.owner?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{patient.owner?.name || "Unknown Owner"}</p>
              <p className="text-sm text-muted-foreground">Primary Owner</p>
            </div>
          </div>
          <div className="space-y-2 pt-2">
            {patient.owner?.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {patient.owner.phone}
              </div>
            )}
            {patient.owner?.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {patient.owner.email}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Information</TabsTrigger>
          <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.notes ? (
                <p className="text-sm text-muted-foreground">{patient.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No medical notes recorded.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab-results" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lab Results</CardTitle>
              </div>
              <Button onClick={() => setIsAddLabResultOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Lab Result
              </Button>
            </CardHeader>
            <CardContent>
              <LabResultsList
                results={labResults || []}
                isLoading={isLoadingLabs}
                onViewDetail={(result) => setSelectedLabResult(result)}
                onAddNew={() => setIsAddLabResultOpen(true)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Patient Photos</CardTitle>
              </div>
              <Button>
                <Camera className="mr-2 h-4 w-4" />
                Upload Photos
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No photos yet</p>
                <p className="text-sm">Upload photos to see them here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      
      <Dialog open={!!selectedLabResult} onOpenChange={() => setSelectedLabResult(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Lab Result Details</DialogTitle>
            <DialogDescription>
              {selectedLabResult?.panel?.name} - {selectedLabResult && new Date(selectedLabResult.testDate).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">Full lab result details coming soon...</p>
          </div>
        </DialogContent>
      </Dialog>

      
      <Dialog open={isAddLabResultOpen} onOpenChange={setIsAddLabResultOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Lab Result</DialogTitle>
            <DialogDescription>Enter lab results for {patient.name}.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">Add lab result form coming soon...</p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

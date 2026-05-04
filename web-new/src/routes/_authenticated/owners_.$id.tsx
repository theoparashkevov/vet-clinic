import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import {
  ArrowLeft,
  Users,
  Phone,
  Mail,
  MapPin,
  PawPrint,
  CalendarDays,
  Clock,
  Pencil,
  Stethoscope,
  AlertCircle,
  X,
  Check,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { fetchWithAuth } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Skeleton } from "../../components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Separator } from "../../components/ui/separator"
import { Badge } from "../../components/ui/badge"
import { AppointmentDetailSheet } from "../../components/appointments/AppointmentDetailSheet"
import {
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_DOT_COLORS,
  normalizeStatus,
} from "../../lib/appointment-status"
import { cn } from "../../lib/utils"

export const Route = createFileRoute("/_authenticated/owners_/$id")({
  component: OwnerProfilePage,
})

interface Patient {
  id: string
  name: string
  species: string
  breed?: string | null
  birthdate?: string | null
  status: string
}

interface Owner {
  id: string
  name: string
  phone: string
  email?: string | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
  emergencyContact?: string | null
  isActive: boolean
  createdAt: string
  patients: Patient[]
}

interface Appointment {
  id: string
  startsAt: string
  endsAt: string
  status: string
  reason?: string | null
  doctor?: { name: string } | null
  patient?: { name: string; species: string } | null
}

function calculateAge(birthdate?: string | null) {
  if (!birthdate) return null
  const birth = new Date(birthdate)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--
  if (years > 0) return `${years} yr`
  const months = Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth())
  return months < 1 ? "< 1 mo" : `${months} mo`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

function useOwner(id: string) {
  return useQuery({
    queryKey: ["owners", id],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/owners/${id}`)
      return (res as { data: Owner }).data
    },
    enabled: !!id,
  })
}

function useOwnerAppointments(ownerId: string) {
  return useQuery({
    queryKey: ["appointments", "owner", ownerId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/v1/appointments?ownerId=${ownerId}&limit=50`)
      return ((res as { data: Appointment[] }).data ?? []) as Appointment[]
    },
    enabled: !!ownerId,
  })
}

function EditOwnerForm({ owner, onDone }: { owner: Owner; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: owner.name,
    phone: owner.phone,
    email: owner.email ?? "",
    address: owner.address ?? "",
    city: owner.city ?? "",
    postalCode: owner.postalCode ?? "",
    emergencyContact: owner.emergencyContact ?? "",
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: typeof form) =>
      fetchWithAuth(`/v1/owners/${owner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("Owner updated")
      queryClient.invalidateQueries({ queryKey: ["owners", owner.id] })
      queryClient.invalidateQueries({ queryKey: ["owners", "list"] })
      onDone()
    },
    onError: () => toast.error("Failed to update owner"),
  })

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        disabled={isPending}
        className="h-8 text-sm"
      />
    </div>
  )

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); mutate(form) }}
      className="space-y-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {field("name", "Full name *")}
        {field("phone", "Phone *", "tel")}
        {field("email", "Email", "email")}
        {field("emergencyContact", "Emergency contact")}
        {field("address", "Address")}
        {field("city", "City")}
        {field("postalCode", "Postal code")}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={isPending}>
          <X className="mr-1.5 h-3.5 w-3.5" /> Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
          Save
        </Button>
      </div>
    </form>
  )
}

function OwnerProfilePage() {
  const { id } = Route.useParams()
  const { data: owner, isLoading } = useOwner(id)
  const { data: appointments = [] } = useOwnerAppointments(id)
  const [editing, setEditing] = useState(false)
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="col-span-2 h-64" />
        </div>
      </div>
    )
  }

  if (!owner) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Users className="mb-4 h-12 w-12 opacity-25" />
        <p className="text-lg font-medium">Owner not found</p>
        <Button variant="link" className="mt-2" render={<Link to="/owners" />}>
          Back to Owners
        </Button>
      </div>
    )
  }

  const upcomingAppointments = appointments
    .filter((a) => new Date(a.startsAt) >= new Date())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())

  const pastAppointments = appointments
    .filter((a) => new Date(a.startsAt) < new Date())
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" render={<Link to="/owners" />}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Owners
          </Button>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{owner.name}</h1>
              <Badge variant={owner.isActive ? "default" : "secondary"} className="text-xs">
                {owner.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {owner.patients.length} patient{owner.patients.length !== 1 ? "s" : ""} · Member since {formatDate(owner.createdAt)}
            </p>
          </div>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit Owner
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4">
          {/* Contact / edit card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <EditOwnerForm owner={owner} onDone={() => setEditing(false)} />
              ) : (
                <div className="space-y-3 text-sm">
                  <ContactRow icon={Phone} value={owner.phone} href={`tel:${owner.phone}`} />
                  {owner.email && (
                    <ContactRow icon={Mail} value={owner.email} href={`mailto:${owner.email}`} />
                  )}
                  {(owner.address || owner.city || owner.postalCode) && (
                    <ContactRow
                      icon={MapPin}
                      value={[owner.address, owner.city, owner.postalCode].filter(Boolean).join(", ")}
                    />
                  )}
                  {owner.emergencyContact && (
                    <>
                      <Separator />
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Emergency Contact
                        </p>
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                          {owner.emergencyContact}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patients */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <PawPrint className="h-3.5 w-3.5" />
                Patients ({owner.patients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {owner.patients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No patients registered.</p>
              ) : (
                <ul className="divide-y">
                  {owner.patients.map((patient) => (
                    <li key={patient.id} className="py-2.5">
                      <Link
                        to="/patients/$id"
                        params={{ id: patient.id }}
                        className="group flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <PawPrint className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium group-hover:text-primary transition-colors">
                              {patient.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {patient.species}
                              {patient.breed ? ` · ${patient.breed}` : ""}
                              {calculateAge(patient.birthdate) ? ` · ${calculateAge(patient.birthdate)}` : ""}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={patient.status === "active" ? "default" : "secondary"}
                          className="shrink-0 text-xs"
                        >
                          {patient.status}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column — appointments */}
        <div className="space-y-4 lg:col-span-2">
          {/* Upcoming */}
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4" />
                Upcoming Appointments
              </CardTitle>
              <Button size="sm" render={<Link to="/appointments/new" />}>
                New
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
              ) : (
                <AppointmentList
                  appointments={upcomingAppointments}
                  onSelect={setSelectedApptId}
                />
              )}
            </CardContent>
          </Card>

          {/* Past */}
          {pastAppointments.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Past Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentList
                  appointments={pastAppointments.slice(0, 10)}
                  onSelect={setSelectedApptId}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AppointmentDetailSheet
        appointmentId={selectedApptId}
        onClose={() => setSelectedApptId(null)}
      />
    </div>
  )
}

function ContactRow({
  icon: Icon,
  value,
  href,
}: {
  icon: React.ElementType
  value: string
  href?: string
}) {
  const content = (
    <span className={cn("flex items-center gap-2 text-muted-foreground", href && "hover:text-foreground transition-colors")}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{value}</span>
    </span>
  )
  return href ? <a href={href}>{content}</a> : <div>{content}</div>
}

function AppointmentList({
  appointments,
  onSelect,
}: {
  appointments: Appointment[]
  onSelect: (id: string) => void
}) {
  return (
    <ul className="divide-y">
      {appointments.map((appt) => {
        const normalized = normalizeStatus(appt.status)
        return (
          <li
            key={appt.id}
            className="flex cursor-pointer items-center justify-between gap-4 py-3 -mx-6 px-6 transition-colors hover:bg-accent/30 rounded-sm"
            onClick={() => onSelect(appt.id)}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight truncate">
                {appt.reason ?? "Visit"}
                {appt.patient && (
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    · {appt.patient.name}
                  </span>
                )}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(appt.startsAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(appt.startsAt)}
                </span>
                {appt.doctor && (
                  <span className="flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" />
                    {appt.doctor.name}
                  </span>
                )}
              </div>
            </div>
            <span className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
              STATUS_COLORS[normalized]
            )}>
              <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_COLORS[normalized])} />
              {STATUS_LABELS[normalized]}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

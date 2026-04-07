import { createFileRoute } from "@tanstack/react-router"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar"
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
import { 
  Search, 
  Plus, 
  Users,
  User,
  UserCog,
  Shield,
  Mail,
  Phone,
  ChevronRight
} from "lucide-react"
import { toast } from "sonner"

export const Route = createFileRoute("/_authenticated/admin/users/")({
  component: UsersPage,
})

type UserData = {
  id: number
  name: string
  email: string
  phone: string
  role: string
  status: string
  lastActive: string
}

const initialUsers: UserData[] = [
  { id: 1, name: "Dr. Maria Ivanova", email: "maria.ivanova@vetclinic.com", phone: "+1 555-0100", role: "Veterinarian", status: "Active", lastActive: "2 minutes ago" },
  { id: 2, name: "Dr. Georgi Dimitrov", email: "georgi.dimitrov@vetclinic.com", phone: "+1 555-0101", role: "Veterinarian", status: "Active", lastActive: "15 minutes ago" },
  { id: 3, name: "Dr. Elena Georgieva", email: "elena.georgieva@vetclinic.com", phone: "+1 555-0102", role: "Veterinarian", status: "Active", lastActive: "1 hour ago" },
  { id: 4, name: "Anna Petrova", email: "anna.petrova@vetclinic.com", phone: "+1 555-0103", role: "Veterinary Technician", status: "Active", lastActive: "30 minutes ago" },
  { id: 5, name: "Peter Stoyanov", email: "peter.stoyanov@vetclinic.com", phone: "+1 555-0104", role: "Receptionist", status: "Offline", lastActive: "3 hours ago" },
  { id: 6, name: "Sofia Marinova", email: "sofia.marinova@vetclinic.com", phone: "+1 555-0105", role: "Practice Manager", status: "Active", lastActive: "5 minutes ago" },
]

function UsersPage() {
  const [users, setUsers] = useState<UserData[]>(initialUsers)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newUser: UserData = {
      id: users.length + 1,
      ...formData,
      status: "Active",
      lastActive: "Just now",
    }
    setUsers([newUser, ...users])
    setFormData({ name: "", email: "", phone: "", role: "" })
    setIsDialogOpen(false)
    toast.success("User added successfully")
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: users.length + 6,
    vets: users.filter(u => u.role === "Veterinarian").length + 3,
    techs: users.filter(u => u.role === "Veterinary Technician").length + 4,
    admins: users.filter(u => u.role === "Practice Manager").length + 2,
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
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage clinic staff and user accounts
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new staff account. They will receive an email to set their password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Jane Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane.smith@vetclinic.com"
                    required
                  />
                </div>
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
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Veterinarian">Veterinarian</SelectItem>
                      <SelectItem value="Veterinary Technician">Veterinary Technician</SelectItem>
                      <SelectItem value="Receptionist">Receptionist</SelectItem>
                      <SelectItem value="Practice Manager">Practice Manager</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Staff members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veterinarians</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vets}</div>
            <p className="text-xs text-muted-foreground">Active doctors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technicians</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.techs}</div>
            <p className="text-xs text-muted-foreground">Support staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">Full access</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage staff accounts and permissions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.name}</h3>
                        <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                          {user.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden md:block text-right">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      Last active
                      <div>{user.lastActive}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No users found</p>
                <p className="text-sm">Try adjusting your search</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

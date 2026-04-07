import { createFileRoute } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import { toast } from "sonner"
import { 
  User,
  Mail, 
  Phone, 
  Shield, 
  Bell, 
  Key,
  Camera
} from "lucide-react"
import { useAuthStore } from "../../stores/authStore"

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
})

function ProfilePage() {
  const { user } = useAuthStore()
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+1 555-0100",
    bio: "Veterinarian with 10+ years of experience in small animal medicine.",
  })

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    appointmentReminders: true,
    systemUpdates: false,
    marketingEmails: false,
  })

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Profile updated successfully")
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords do not match")
      return
    }
    toast.success("Password changed successfully")
    setPasswordData({ current: "", new: "", confirm: "" })
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p: string) => p[0]?.toUpperCase())
        .join("")
    : "AD"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your public profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  variant="secondary"
                  onClick={() => toast.info("Photo upload coming soon!")}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{user?.name || "Admin User"}</h3>
              <p className="text-sm text-muted-foreground">{user?.role || "Administrator"}</p>
              <Badge className="mt-2" variant="outline">
                <Shield className="mr-1 h-3 w-3" />
                Active
              </Badge>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {user?.email || "admin@vetclinic.com"}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {profileData.phone}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                Member since 2023
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={profileData.bio}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({ ...profileData, bio: e.target.value })}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password for security</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input
                    id="current"
                    type="password"
                    value={passwordData.current}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, current: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input
                      id="new"
                      type="password"
                      value={passwordData.new}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, new: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={passwordData.confirm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { key: "emailAlerts", label: "Email Alerts", description: "Receive important alerts via email" },
                  { key: "appointmentReminders", label: "Appointment Reminders", description: "Get reminded about upcoming appointments" },
                  { key: "systemUpdates", label: "System Updates", description: "Receive updates about system changes" },
                  { key: "marketingEmails", label: "Marketing Emails", description: "Receive promotional content and newsletters" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Button
                      variant={notifications[item.key as keyof typeof notifications] ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })
                        toast.success(`${item.label} ${notifications[item.key as keyof typeof notifications] ? 'disabled' : 'enabled'}`)
                      }}
                    >
                      {notifications[item.key as keyof typeof notifications] ? "On" : "Off"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useAuthStore } from "../../stores/authStore"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { User, KeyRound, ShieldCheck, Save, Pencil, X } from "lucide-react"
import { AvatarUpload } from "../../components/ui/avatar-upload"

export const Route = createFileRoute("/_authenticated/account")({
  component: AccountPage,
})

function AccountPage() {
  const { user, updateUser } = useAuthStore()

  const [editingProfile, setEditingProfile] = useState(false)
  const [profileDraft, setProfileDraft] = useState({ name: user?.name ?? "", email: user?.email ?? "" })
  const [profileSaved, setProfileSaved] = useState(false)

  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSaved, setPasswordSaved] = useState(false)

  function handleProfileSave() {
    if (!profileDraft.name.trim() || !profileDraft.email.trim()) return
    updateUser({ name: profileDraft.name.trim(), email: profileDraft.email.trim() })
    setEditingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  function handleProfileCancel() {
    setProfileDraft({ name: user?.name ?? "", email: user?.email ?? "" })
    setEditingProfile(false)
  }

  function handlePasswordSave() {
    setPasswordError("")
    if (!passwordForm.current) { setPasswordError("Current password is required."); return }
    if (passwordForm.next.length < 8) { setPasswordError("New password must be at least 8 characters."); return }
    if (passwordForm.next !== passwordForm.confirm) { setPasswordError("Passwords do not match."); return }
    // In a real app: call PATCH /v1/account/password
    setPasswordForm({ current: "", next: "", confirm: "" })
    setChangingPassword(false)
    setPasswordSaved(true)
    setTimeout(() => setPasswordSaved(false), 3000)
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Account</h1>
          <p className="mt-2 text-muted-foreground">Manage your profile and credentials.</p>
        </div>

        {/* Avatar + role summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AvatarUpload
                src={user?.avatar}
                onChange={(dataUrl) => updateUser({ avatar: dataUrl ?? undefined })}
                className="h-16 w-16 bg-sidebar-primary"
                fallback={
                  <span className="text-xl font-bold text-sidebar-primary-foreground">{initials}</span>
                }
              />
              <div className="space-y-1">
                <p className="text-lg font-semibold">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {user?.roles?.map((r) => (
                    <Badge key={r} variant="secondary" className="capitalize text-xs">{r}</Badge>
                  ))}
                  {user?.isSuperAdmin && (
                    <Badge variant="default" className="text-xs gap-1">
                      <ShieldCheck className="h-3 w-3" /> Superadmin
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" /> Profile
              </CardTitle>
              <CardDescription>Your display name and email address.</CardDescription>
            </div>
            {!editingProfile && (
              <Button variant="ghost" size="sm" onClick={() => { setProfileDraft({ name: user?.name ?? "", email: user?.email ?? "" }); setEditingProfile(true) }}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-4">
            {editingProfile ? (
              <>
                <div className="space-y-1">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={profileDraft.name} onChange={(e) => setProfileDraft((d) => ({ ...d, name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profileDraft.email} onChange={(e) => setProfileDraft((d) => ({ ...d, email: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleProfileSave}><Save className="h-4 w-4 mr-1" /> Save</Button>
                  <Button size="sm" variant="ghost" onClick={handleProfileCancel}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <span className="text-muted-foreground">Full name</span>
                  <span className="font-medium">{user?.name}</span>
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                {profileSaved && <p className="text-xs text-green-600">Profile updated.</p>}
              </>
            )}
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4" /> Password
              </CardTitle>
              <CardDescription>Change your login password.</CardDescription>
            </div>
            {!changingPassword && (
              <Button variant="ghost" size="sm" onClick={() => setChangingPassword(true)}>
                <Pencil className="h-4 w-4 mr-1" /> Change
              </Button>
            )}
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {changingPassword ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="current-pw">Current password</Label>
                  <Input id="current-pw" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-pw">New password</Label>
                  <Input id="new-pw" type="password" value={passwordForm.next} onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirm-pw">Confirm new password</Label>
                  <Input id="confirm-pw" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))} />
                </div>
                {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
                <div className="flex gap-2">
                  <Button size="sm" onClick={handlePasswordSave}><Save className="h-4 w-4 mr-1" /> Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setChangingPassword(false); setPasswordForm({ current: "", next: "", confirm: "" }); setPasswordError("") }}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {passwordSaved ? <span className="text-green-600">Password changed successfully.</span> : "••••••••••••"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Roles (read-only) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4" /> Access &amp; Roles
            </CardTitle>
            <CardDescription>Roles are assigned by your clinic administrator and cannot be changed here.</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {user?.roles?.map((r) => (
                <Badge key={r} variant="outline" className="capitalize">{r}</Badge>
              ))}
              {user?.isSuperAdmin && (
                <Badge variant="default" className="gap-1">
                  <ShieldCheck className="h-3 w-3" /> Superadmin
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

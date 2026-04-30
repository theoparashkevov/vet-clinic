import { createFileRoute, redirect } from "@tanstack/react-router"
import { useAuthStore } from "../../stores/authStore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import SettingsTab from "../../components/admin/SettingsTab"
import AIConfigTab from "../../components/admin/AIConfigTab"
import BotConfigTab from "../../components/admin/BotConfigTab"
import UsersTab from "../../components/admin/UsersTab"
import AuditLogsTab from "../../components/admin/AuditLogsTab"

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: () => {
    const { user } = useAuthStore.getState()
    if (!user?.isSuperAdmin) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: AdminPage,
})

function AdminPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Superadmin Panel
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage clinic settings, AI configuration, users, and audit logs.
          </p>
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="ai-config">AI Config</TabsTrigger>
            <TabsTrigger value="bot-config">Bot Config</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>

          <TabsContent value="ai-config">
            <AIConfigTab />
          </TabsContent>

          <TabsContent value="bot-config">
            <BotConfigTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="audit-logs">
            <AuditLogsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

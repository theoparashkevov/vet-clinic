import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import { fetchWithAuth } from "../../lib/api"

interface Setting {
  key: string
  value: string
  type: string
  category: string
  isPublic: boolean
  description: string
}

const CLINIC_SETTINGS = [
  { key: "clinic.name", label: "Clinic Name" },
  { key: "clinic.address", label: "Address" },
  { key: "clinic.phone", label: "Phone" },
  { key: "clinic.email", label: "Email" },
  { key: "clinic.timezone", label: "Timezone" },
]

function SettingsTab() {
  const queryClient = useQueryClient()
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  const { data: settings, isLoading } = useQuery<Setting[]>({
    queryKey: ["settings"],
    queryFn: () => fetchWithAuth("/v1/settings"),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return fetchWithAuth(`/v1/settings/${key}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] })
      toast.success("Settings saved successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save settings")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    CLINIC_SETTINGS.forEach(({ key }) => {
      const value = formValues[key]
      if (value !== undefined) {
        updateMutation.mutate({ key, value })
      }
    })
  }

  const getValue = (key: string) => {
    if (formValues[key] !== undefined) return formValues[key]
    return settings?.find((s) => s.key === key)?.value ?? ""
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Clinic Settings</CardTitle>
          <CardDescription>
            Manage your clinic information and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {CLINIC_SETTINGS.map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  value={getValue(key)}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  placeholder={label}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

export default SettingsTab

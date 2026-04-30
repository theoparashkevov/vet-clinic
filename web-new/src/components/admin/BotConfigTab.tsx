import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import { fetchWithAuth } from "../../lib/api"

function BotConfigTab() {
  const queryClient = useQueryClient()
  const [viberKey, setViberKey] = useState("")

  const { isLoading } = useQuery({
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
      toast.success("Bot configuration saved")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save bot config")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (viberKey) {
      updateMutation.mutate({ key: "viber.apiKey", value: viberKey })
    }
  }

  const webhookUrl = `${window.location.origin}/v1/bot/webhook`

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Bot Configuration</CardTitle>
          <CardDescription>
            Configure Viber bot integration settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="viber-api-key">Viber API Key</Label>
            <Input
              id="viber-api-key"
              type="password"
              value={viberKey}
              onChange={(e) => setViberKey(e.target.value)}
              placeholder="Enter Viber API key (masked)"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to keep existing key. Value will be encrypted.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              value={webhookUrl}
              readOnly
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Use this URL when configuring your Viber bot webhook.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Bot Config"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

export default BotConfigTab

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import { Textarea } from "../../components/ui/textarea"
import { fetchWithAuth } from "../../lib/api"

interface Setting {
  key: string
  value: string
  type: string
  category: string
  isPublic: boolean
  description: string
}

const AI_PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
]

function AIConfigTab() {
  const queryClient = useQueryClient()
  const [provider, setProvider] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [prompt, setPrompt] = useState("")

  const { data: settings, isLoading } = useQuery<Setting[]>({
    queryKey: ["settings"],
    queryFn: () => fetchWithAuth("/v1/settings"),
  })

  const updateMutation = useMutation({
    mutationFn: async (updates: Record<string, string>) => {
      const results = []
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          results.push(
            fetchWithAuth(`/v1/settings/${key}`, {
              method: "PUT",
              body: JSON.stringify({ value }),
            })
          )
        }
      }
      return Promise.all(results)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] })
      toast.success("AI configuration saved")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save AI config")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updates: Record<string, string> = {}
    if (provider) updates["ai.defaultProvider"] = provider
    if (apiKey) updates["ai.apiKey"] = apiKey
    if (prompt) updates["ai.prompt"] = prompt
    updateMutation.mutate(updates)
  }

  const currentProvider = settings?.find((s) => s.key === "ai.defaultProvider")?.value ?? ""

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
          <CardTitle>AI Configuration</CardTitle>
          <CardDescription>
            Configure AI provider and prompts for clinic operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ai-provider">AI Provider</Label>
            <select
              id="ai-provider"
              value={provider || currentProvider}
              onChange={(e) => setProvider(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {AI_PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-api-key">API Key</Label>
            <Input
              id="ai-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key (masked)"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to keep existing key. Value will be encrypted.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-prompt">Per-Page Prompt</Label>
            <Textarea
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter the default prompt for AI-assisted features..."
              rows={6}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save AI Config"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

export default AIConfigTab

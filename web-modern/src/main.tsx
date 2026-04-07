import { StrictMode, useEffect } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { routeTree } from "./routeTree.gen"
import { useAuthStore } from "./stores/authStore"
import { useUIStore } from "./stores/uiStore"
import { Toaster } from "./components/ui/sonner"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
})

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useUIStore()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  return <>{children}</>
}

function App() {
  const auth = useAuthStore()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} context={{ auth }} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

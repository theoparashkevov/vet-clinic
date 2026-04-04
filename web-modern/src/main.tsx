import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { routeTree } from "./routeTree.gen"
import { useAuthStore } from "./stores/authStore"
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
  context: {
    auth: undefined!,
  },
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

function App() {
  const auth = useAuthStore()

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} context={{ auth }} />
    </QueryClientProvider>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

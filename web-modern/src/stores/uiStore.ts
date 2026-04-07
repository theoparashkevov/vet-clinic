import { create } from "zustand"
import { persist } from "zustand/middleware"

export type DashboardWidget = 
  | "revenue"
  | "patients"
  | "appointments"
  | "invoices"
  | "vaccinations"
  | "medications"
  | "lab-results"
  | "recent-activity"

export interface DashboardLayout {
  widgets: DashboardWidget[]
  layout: "grid" | "list"
  showWelcomeMessage: boolean
}

interface UIState {
  sidebarCollapsed: boolean
  theme: "light" | "dark"
  toggleSidebar: () => void
  setTheme: (theme: "light" | "dark") => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  dashboardLayout: DashboardLayout
  setDashboardWidgets: (widgets: DashboardWidget[]) => void
  toggleDashboardWidget: (widget: DashboardWidget) => void
  reorderDashboardWidgets: (widgets: DashboardWidget[]) => void
  setDashboardLayout: (layout: "grid" | "list") => void
  setShowWelcomeMessage: (show: boolean) => void
  resetDashboardLayout: () => void
}

const defaultDashboardLayout: DashboardLayout = {
  widgets: ["revenue", "patients", "appointments", "invoices", "recent-activity"],
  layout: "grid",
  showWelcomeMessage: true,
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: "light",
      mobileMenuOpen: false,
      dashboardLayout: defaultDashboardLayout,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      setDashboardWidgets: (widgets) =>
        set((state) => ({
          dashboardLayout: { ...state.dashboardLayout, widgets },
        })),
      toggleDashboardWidget: (widget) =>
        set((state) => {
          const currentWidgets = state.dashboardLayout.widgets
          const newWidgets = currentWidgets.includes(widget)
            ? currentWidgets.filter((w) => w !== widget)
            : [...currentWidgets, widget]
          return {
            dashboardLayout: { ...state.dashboardLayout, widgets: newWidgets },
          }
        }),
      reorderDashboardWidgets: (widgets) =>
        set((state) => ({
          dashboardLayout: { ...state.dashboardLayout, widgets },
        })),
      setDashboardLayout: (layout) =>
        set((state) => ({
          dashboardLayout: { ...state.dashboardLayout, layout },
        })),
      setShowWelcomeMessage: (show) =>
        set((state) => ({
          dashboardLayout: { ...state.dashboardLayout, showWelcomeMessage: show },
        })),
      resetDashboardLayout: () =>
        set({ dashboardLayout: defaultDashboardLayout }),
    }),
    {
      name: "vet-clinic-ui",
    }
  )
)

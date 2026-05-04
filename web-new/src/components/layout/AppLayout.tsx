import { useState, type ReactNode } from "react"
import { useRouterState } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <TopBar
        sidebarCollapsed={sidebarCollapsed}
        onMenuClick={() => setMobileOpen((o) => !o)}
      />
      <main
        className="min-h-screen pt-16 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? "4.5rem" : "16rem" }}
      >
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="p-6 lg:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}

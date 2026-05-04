import { useState, type ReactNode } from "react"
import { useRouterState } from "@tanstack/react-router"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { pageVariants } from "../../lib/animations"

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
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="p-6 lg:p-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

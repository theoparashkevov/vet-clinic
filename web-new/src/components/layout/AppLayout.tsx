import { type ReactNode } from "react"
import { useRouterState } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { TopBar } from "./TopBar"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar trigger={<SidebarTrigger />} />
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1 p-6 lg:p-8"
        >
          {children}
        </motion.div>
      </SidebarInset>
    </SidebarProvider>
  )
}

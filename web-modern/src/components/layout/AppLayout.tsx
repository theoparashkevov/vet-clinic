"use client"

import type { ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { TopNav } from "./TopNav"
import { cn } from "../../lib/utils"
import { useUIStore } from "../../stores/uiStore"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopNav />
      <main
        className={cn(
          "pt-16 transition-all duration-300",
          sidebarCollapsed ? "pl-[72px]" : "pl-[280px]"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

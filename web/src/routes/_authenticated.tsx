import AppSidebar from "@components/app-sidebar"
import AppSidebarNav from "@components/app-sidebar-nav"
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { SidebarInset, SidebarProvider } from "@components/ui/sidebar"
import { api } from "@lib/api"
import { memo, useRef, type JSX } from "react"

// Memoize the outlet wrapper to prevent sidebar re-renders
const MemoizedContent = memo(function MemoizedContent() {
  return (
    <SidebarInset>
      <AppSidebarNav />
      <div className="p-4 lg:p-6">
        <Outlet />
      </div>
    </SidebarInset>
  )
})

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    if (!api.isAuthenticated()) {
      throw redirect({
        to: "/auth/login",
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  // Freeze the sidebar element so it never re-renders or reconciles on route changes
  const sidebarRef = useRef<JSX.Element | null>(null)
  if (!sidebarRef.current) {
    sidebarRef.current = <AppSidebar collapsible="dock" intent="inset" />
  }

  return (
    <SidebarProvider>
      {sidebarRef.current}
      <MemoizedContent />
    </SidebarProvider>
  )
}

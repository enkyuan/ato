import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import AppSidebarNav from "@/components/app-sidebar-nav"
import { api } from "@/lib/api"

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
  return (
    <SidebarProvider>
      <AppSidebar collapsible="dock" intent="inset" />
      <SidebarInset>
        <AppSidebarNav />
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

"use client"

import { IconDashboard, IconLogout, IconSettings } from "@intentui/icons"
import {
  Menu,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuLabel,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
} from "@components/ui/menu"
import { SidebarNav, SidebarTrigger } from "@components/ui/sidebar"
import { api } from "@lib/api"
import { useNavigate } from "@tanstack/react-router"
import Avvvatars from "avvvatars-react"
import { TaskActions } from "@/components/task-actions"

export default function AppSidebarNav() {
  return (
    <SidebarNav>
      <span className="flex items-center gap-x-2">
        <SidebarTrigger className="-ml-2" />
      </span>
      <div className="ml-auto flex items-center gap-x-2">
        <TaskActions />
        <UserMenu />
      </div>
    </SidebarNav>
  )
}

function UserMenu() {
  const navigate = useNavigate()
  const user = api.getUser()

  const handleLogout = async () => {
    await api.logout()
    navigate({ to: "/auth/login" })
  }

  return (
    <Menu>
      <MenuTrigger className="ml-auto md:hidden" aria-label="Open Menu">
        <Avvvatars value={user?.email || "user@domain.com"} style="shape" />
      </MenuTrigger>
      <MenuContent popover={{ placement: "bottom end" }} className="min-w-64">
        <MenuSection>
          <MenuHeader separator>
            <span className="block">{user?.name || "User"}</span>
            <span className="font-normal text-muted-fg">{user?.email || "user@domain.com"}</span>
          </MenuHeader>
        </MenuSection>
        <MenuItem href="/dashboard">
          <IconDashboard />
          <MenuLabel>Dashboard</MenuLabel>
        </MenuItem>
        <MenuItem href="/settings">
          <IconSettings />
          <MenuLabel>Settings</MenuLabel>
        </MenuItem>
        <MenuSeparator />
        <MenuItem href="#contact">
          <MenuLabel>Contact Support</MenuLabel>
        </MenuItem>
        <MenuSeparator />
        <MenuItem onAction={handleLogout}>
          <IconLogout />
          <MenuLabel>Log out</MenuLabel>
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}

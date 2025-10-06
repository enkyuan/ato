"use client"

import { IconDashboard, IconLogout, IconSettings } from "@intentui/icons"
import { Avatar } from "@/components/ui/avatar"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import {
  Menu,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuLabel,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import { SidebarNav, SidebarTrigger } from "@/components/ui/sidebar"
import { api } from "@/lib/api"
import { useNavigate } from "@tanstack/react-router"

export default function AppSidebarNav() {
  return (
    <SidebarNav>
      <span className="flex items-center gap-x-4">
        <SidebarTrigger className="-ml-2" />
        <Breadcrumbs className="hidden md:flex">
          <Breadcrumbs.Item href="/todos">Todos</Breadcrumbs.Item>
        </Breadcrumbs>
      </span>
      <UserMenu />
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
        <Avatar isSquare initials={user?.name?.charAt(0).toUpperCase() || "U"} />
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

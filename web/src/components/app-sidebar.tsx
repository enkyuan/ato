"use client"

import {
  IconChevronsY,
  IconDashboardFill,
  IconHeadphonesFill,
  IconLogout,
  IconSettingsFill,
  IconShieldFill,
} from "@intentui/icons"
import { Avatar } from "@/components/ui/avatar"
import { Link } from "@/components/ui/link"
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarRail,
  SidebarSection,
  SidebarSectionGroup,
} from "@/components/ui/sidebar"
import { api } from "@/lib/api"
import { Monicon } from "@monicon/react"
import logo from "@/logo.svg"
import { useNavigate } from "@tanstack/react-router"

export default function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate()
  const user = api.getUser()

  const handleLogout = async () => {
    await api.logout()
    navigate({ to: "/auth/login" })
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link href="/today" className="flex items-center gap-x-2">
          <img src={logo} alt="Ato" className="size-8 shrink-0" />
          <SidebarLabel className="font-gaseok-one font-bold">Ato</SidebarLabel>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarSectionGroup>
          <SidebarSection>
            <SidebarItem tooltip="Today" isCurrent href="/today">
              <Monicon name="hugeicons:inbox" />
              <SidebarLabel className="ml-2">Today</SidebarLabel>
            </SidebarItem>

            <SidebarItem tooltip="Upcoming" href="/upcoming">
              <Monicon name="hugeicons:calendar-01" />
              <SidebarLabel className="ml-2">Upcoming</SidebarLabel>
            </SidebarItem>
          </SidebarSection>
        </SidebarSectionGroup>
      </SidebarContent>

      <SidebarFooter className="flex flex-row justify-between gap-4 group-data-[state=collapsed]:flex-col">
        <Menu>
          <MenuTrigger className="flex w-full items-center justify-between" aria-label="Profile">
            <div className="flex items-center gap-x-2">
              <Avatar
                className="size-8 *:size-8 group-data-[state=collapsed]:size-6 group-data-[state=collapsed]:*:size-6"
                isSquare
                initials={user?.name?.charAt(0).toUpperCase() || "U"}
              />

              <div className="in-data-[collapsible=dock]:hidden text-sm">
                <SidebarLabel>{user?.name || "User"}</SidebarLabel>
                <span className="-mt-0.5 block text-muted-fg">
                  {user?.email || "user@domain.com"}
                </span>
              </div>
            </div>
            <IconChevronsY data-slot="chevron" />
          </MenuTrigger>
          <MenuContent
            className="in-data-[sidebar-collapsible=collapsed]:min-w-56 min-w-(--trigger-width)"
            placement="bottom right"
          >
            <MenuSection>
              <MenuHeader separator>
                <span className="block">{user?.name || "User"}</span>
                <span className="font-normal text-muted-fg">
                  {user?.email || "user@domain.com"}
                </span>
              </MenuHeader>
            </MenuSection>

            <MenuItem href="/dashboard">
              <IconDashboardFill />
              <MenuLabel>Dashboard</MenuLabel>
            </MenuItem>
            <MenuItem href="/settings">
              <IconSettingsFill />
              <MenuLabel>Settings</MenuLabel>
            </MenuItem>
            <MenuItem href="/security">
              <IconShieldFill />
              <MenuLabel>Security</MenuLabel>
            </MenuItem>
            <MenuSeparator />

            <MenuItem href="#contact">
              <IconHeadphonesFill />
              <MenuLabel>Customer Support</MenuLabel>
            </MenuItem>
            <MenuSeparator />
            <MenuItem onAction={handleLogout}>
              <IconLogout />
              <MenuLabel>Log out</MenuLabel>
            </MenuItem>
          </MenuContent>
        </Menu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

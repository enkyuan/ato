"use client"

import {
  IconChevronsY,
  IconMessageFill,
  IconLogout,
  IconSettingsFill,
  IconPlus,
} from "@intentui/icons"
import { useState, useEffect, memo, useMemo, useCallback } from "react"
import { Link } from "@components/ui/link"
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
  useSidebar,
} from "@components/ui/sidebar"
import { Button } from "@components/ui/button"
import { api } from "@lib/api"
import { Monicon } from "@monicon/react"
import { useNavigate } from "@tanstack/react-router"
import Avvvatars from "avvvatars-react"
import logo from "/logo.svg"
import { QuickAddMenu } from "@components/quick-add-menu"
import { useGroupsStore } from "@/stores/groups-store"
import { GroupsTree } from "@components/groups-tree"

const AppSidebar = memo(function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate()
  const user = useMemo(() => api.getUser(), [])
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const groups = useGroupsStore((state) => state.groups)
  const loadGroups = useGroupsStore((state) => state.loadGroups)
  const setGroups = useGroupsStore((state) => state.setGroups)
  const { state, isMobile } = useSidebar()

  // Load groups once on mount - use empty deps to run only once
  useEffect(() => {
    loadGroups()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadGroups])

  const handleCreateGroup = useCallback(async () => {
    try {
      const newGroup = await api.createGroup("")
      setGroups([...groups, newGroup])
      navigate({ to: `/groups/${newGroup.id}` })
    } catch (error) {
      console.error("Failed to create group:", error)
    }
  }, [groups, navigate, setGroups])

  const handleLogout = useCallback(async () => {
    await api.logout()
    navigate({ to: "/auth/login" })
  }, [navigate])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-x-2">
          <Link href="/today" className="flex flex-1 items-center gap-x-2">
            <img
              src={logo}
              alt="Ato"
              className="size-8 shrink-0 rounded-sm"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <SidebarLabel className="font-display text-2xl text-[var(--secondary)]">
              Ato
            </SidebarLabel>
          </Link>
          <div className="w-9 shrink-0">
            {(state === "expanded" || isMobile) && (
              <Button size="sq-md" aria-label="Add new" onPress={() => setIsQuickAddOpen(true)}>
                <IconPlus className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarSectionGroup>
          <SidebarSection>
            <SidebarItem tooltip="Today" href="/today">
              <Monicon name="solar:inbox-linear" />
              <SidebarLabel className="ml-2">Today</SidebarLabel>
            </SidebarItem>

            <SidebarItem tooltip="Upcoming" href="/upcoming">
              <Monicon name="solar:calendar-date-linear" />
              <SidebarLabel className="ml-2">Upcoming</SidebarLabel>
            </SidebarItem>
          </SidebarSection>

          {groups.length > 0 && (
            <SidebarSection className="mt-4">
              <GroupsTree />
            </SidebarSection>
          )}
        </SidebarSectionGroup>
      </SidebarContent>

      <SidebarFooter className="flex flex-row justify-between gap-4 group-data-[state=collapsed]:flex-col">
        <Menu>
          <MenuTrigger className="flex w-full items-center justify-between" aria-label="Profile">
            <div className="flex items-center gap-x-2">
              <Avvvatars value={user?.email || "user@domain.com"} style="shape" />
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

            <MenuItem href="/settings">
              <IconSettingsFill />
              <MenuLabel>Settings</MenuLabel>
            </MenuItem>
            <MenuItem href="#contact">
              <IconMessageFill />
              <MenuLabel>Contact</MenuLabel>
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

      <QuickAddMenu
        isOpen={isQuickAddOpen}
        onOpenChange={setIsQuickAddOpen}
        onCreateGroup={handleCreateGroup}
      />
    </Sidebar>
  )
})

export default AppSidebar

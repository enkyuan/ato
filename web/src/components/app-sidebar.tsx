"use client"

import { IconChevronsY, IconMessageFill, IconLogout, IconSettingsFill } from "@intentui/icons"
import { useState } from "react"
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
import { useNavigate, useRouterState } from "@tanstack/react-router"
import Avvvatars from "avvvatars-react"
import logo from "@/logo.svg"
import { QuickAddMenu } from "@components/quick-add-menu"
import { useGroups } from "@/contexts/groups-context"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SortableGroupItemProps {
  group: { id: number; name: string }
  currentPath: string
}

function SortableGroupItem({ group, currentPath }: SortableGroupItemProps) {
  const { editingGroupId, tempGroupName } = useGroups()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({ id: group.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const displayName = editingGroupId === group.id ? tempGroupName : group.name

  return (
    <div ref={setNodeRef} style={style} className="contents">
      <SidebarItem
        tooltip={displayName || "Untitled"}
        href={`/groups/${group.id}`}
        isCurrent={currentPath === `/groups/${group.id}`}
      >
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="flex items-center cursor-grab active:cursor-grabbing"
        >
          <img src="/icons/group.svg" alt="" className="size-4" />
        </div>
        <SidebarLabel className="ml-2">{displayName || "Untitled"}</SidebarLabel>
      </SidebarItem>
    </div>
  )
}

export default function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate()
  const user = api.getUser()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const { groups, setGroups, reorderGroups } = useGroups()
  const { state, isMobile } = useSidebar()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = groups.findIndex((g) => g.id === active.id)
      const newIndex = groups.findIndex((g) => g.id === over.id)
      reorderGroups(oldIndex, newIndex)
    }
  }

  const handleCreateGroup = async () => {
    try {
      const newGroup = await api.createGroup("")
      setGroups([...groups, newGroup])
      navigate({ to: `/groups/${newGroup.id}` })
    } catch (error) {
      console.error("Failed to create group:", error)
    }
  }

  const handleLogout = async () => {
    await api.logout()
    navigate({ to: "/auth/login" })
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-x-2">
          <Link href="/today" className="flex items-center gap-x-2 flex-1">
            <img src={logo} alt="Ato" className="size-8 shrink-0" />
            <SidebarLabel className="font-display text-2xl">Ato</SidebarLabel>
          </Link>
          <div className="w-9 shrink-0">
            {(state === "expanded" || isMobile) && (
              <Button size="sq-md" aria-label="Add new" onPress={() => setIsQuickAddOpen(true)}>
                <div className="size-4">
                  <Monicon name="hugeicons:add-01" />
                </div>
              </Button>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarSectionGroup>
          <SidebarSection>
            <SidebarItem tooltip="Today" href="/today" isCurrent={currentPath === "/today"}>
              <Monicon name="hugeicons:inbox" />
              <SidebarLabel className="ml-2">Today</SidebarLabel>
            </SidebarItem>

            <SidebarItem
              tooltip="Upcoming"
              href="/upcoming"
              isCurrent={currentPath === "/upcoming"}
            >
              <Monicon name="hugeicons:calendar-01" />
              <SidebarLabel className="ml-2">Upcoming</SidebarLabel>
            </SidebarItem>
          </SidebarSection>

          {groups.length > 0 && (
            <SidebarSection className="mt-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={groups.map((g) => g.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {groups.map((group) => (
                    <SortableGroupItem key={group.id} group={group} currentPath={currentPath} />
                  ))}
                </SortableContext>
              </DndContext>
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
}

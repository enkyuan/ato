"use client"

import { GroupIcon } from "@components/icons/group-icon"
import { Button } from "@components/ui/button"
import { SidebarItem, SidebarLabel } from "@components/ui/sidebar"
import { IconDotsVertical } from "@intentui/icons"
import type { Group } from "@lib/api"

interface DragOverlayContentProps {
  group: Group
}

export function DragOverlayContent({ group }: DragOverlayContentProps) {
  return (
    <div className="w-[--sidebar-width] px-4">
      <div className="grid grid-cols-[auto_1fr] gap-y-0.5">
        <SidebarItem
          tooltip={group.name || "Untitled"}
          href={`/groups/${group.id}`}
          className="cursor-grabbing"
        >
          <GroupIcon className="size-5 shrink-0 sm:size-4" data-slot="icon" />
          <SidebarLabel className="ml-2">{group.name || "Untitled"}</SidebarLabel>
          <Button
            data-slot="menu-action-trigger"
            size="sq-xs"
            intent="plain"
            className="!size-6 !w-6 !h-6 !right-1 !p-0 before:hidden relative"
            isDisabled
          >
            <IconDotsVertical className="size-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </Button>
        </SidebarItem>
      </div>
    </div>
  )
}

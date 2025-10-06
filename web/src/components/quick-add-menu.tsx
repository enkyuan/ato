"use client"

import {
  CommandMenu,
  CommandMenuItem,
  CommandMenuList,
  CommandMenuSearch,
  CommandMenuSection,
} from "@components/ui/command-menu"
import { Monicon } from "@monicon/react"
import { MenuLabel } from "@components/ui/menu"

interface QuickAddMenuProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCreateGroup?: () => void
}

export function QuickAddMenu({ isOpen, onOpenChange, onCreateGroup }: QuickAddMenuProps) {
  const handleCreateGroup = () => {
    onOpenChange(false)
    onCreateGroup?.()
  }

  return (
    <CommandMenu isBlurred isOpen={isOpen} onOpenChange={onOpenChange}>
      <CommandMenuSearch placeholder="Quick add..." />
      <CommandMenuList>
        <CommandMenuSection title="Create">
          <CommandMenuItem href="#" textValue="new task">
            <Monicon name="hugeicons:task-01" />
            <MenuLabel className="ml-2">New Task</MenuLabel>
          </CommandMenuItem>
          <CommandMenuItem href="#" textValue="new group" onAction={handleCreateGroup}>
            <Monicon name="hugeicons:layers-01" />
            <MenuLabel className="ml-2">New Group</MenuLabel>
          </CommandMenuItem>
          <CommandMenuItem href="#" textValue="new project">
            <Monicon name="hugeicons:folder-01" />
            <MenuLabel className="ml-2">New Project</MenuLabel>
          </CommandMenuItem>
          <CommandMenuItem href="#" textValue="new note">
            <Monicon name="hugeicons:note" />
            <MenuLabel className="ml-2">New Note</MenuLabel>
          </CommandMenuItem>
        </CommandMenuSection>
        <CommandMenuSection title="Navigate">
          <CommandMenuItem href="/today" textValue="today">
            <Monicon name="hugeicons:inbox" />
            <MenuLabel className="ml-2">Today</MenuLabel>
          </CommandMenuItem>
          <CommandMenuItem href="/upcoming" textValue="upcoming">
            <Monicon name="hugeicons:calendar-01" />
            <MenuLabel className="ml-2">Upcoming</MenuLabel>
          </CommandMenuItem>
        </CommandMenuSection>
      </CommandMenuList>
    </CommandMenu>
  )
}

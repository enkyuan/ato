"use client"

import {
  CommandMenu,
  CommandMenuItem,
  CommandMenuList,
  CommandMenuSearch,
  CommandMenuSection,
} from "@components/ui/command-menu"
import { MenuLabel } from "@components/ui/menu"
import { Monicon } from "@monicon/react"
import { GroupIcon } from "./icons/group-icon"

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
            <Monicon name="solar:checklist-minimalistic-linear" />
            <MenuLabel className="ml-2">New Task</MenuLabel>
          </CommandMenuItem>
          <CommandMenuItem href="#" textValue="new group" onAction={handleCreateGroup}>
            <GroupIcon variant="static" data-slot="icon" />
            <MenuLabel className="ml-2">New Group</MenuLabel>
          </CommandMenuItem>
          <CommandMenuItem href="#" textValue="new project">
            <Monicon name="solar:folder-2-linear" />
            <MenuLabel className="ml-2">New Project</MenuLabel>
          </CommandMenuItem>
          <CommandMenuItem href="#" textValue="new note">
            <Monicon name="solar:notes-outline" />
            <MenuLabel className="ml-2">New Note</MenuLabel>
          </CommandMenuItem>
        </CommandMenuSection>
        <CommandMenuSection title="Navigate to">
          <CommandMenuItem href="/today" textValue="today">
            <Monicon name="solar:inbox-linear" />
            <MenuLabel className="ml-2">Today</MenuLabel>
          </CommandMenuItem>
          <CommandMenuItem href="/upcoming" textValue="upcoming">
            <Monicon name="solar:calendar-date-linear" />
            <MenuLabel className="ml-2">Upcoming</MenuLabel>
          </CommandMenuItem>
        </CommandMenuSection>
      </CommandMenuList>
    </CommandMenu>
  )
}

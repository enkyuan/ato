"use client"

import { IconDotsHorizontal } from "@intentui/icons"
import { useState, useEffect } from "react"
import { Input } from "@components/ui/field"
import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from "@components/ui/menu"
import type { Group } from "@lib/api"
import { useGroups } from "@/contexts/groups-context"

interface GroupHeaderProps {
  group: Group
  onNameChange: (name: string) => void
  onDelete: () => void
}

export function GroupHeader({ group, onNameChange, onDelete }: GroupHeaderProps) {
  const [name, setName] = useState(group.name)
  const { setEditingGroupId, setTempGroupName, updateGroupName } = useGroups()

  useEffect(() => {
    setName(group.name)
  }, [group.name])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    setEditingGroupId(group.id)
    setTempGroupName(newName)
  }

  const handleBlur = () => {
    setEditingGroupId(null)
    if (name.trim() && name !== group.name) {
      onNameChange(name.trim())
      updateGroupName(group.id, name.trim())
    } else {
      setName(group.name)
      setTempGroupName(group.name)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      ;(e.target as HTMLInputElement).blur()
    } else if (e.key === "Escape") {
      setName(group.name)
      setTempGroupName(group.name)
      setEditingGroupId(null)
      ;(e.target as HTMLInputElement).blur()
    }
  }

  return (
    <div className="flex items-center gap-x-3 px-4 py-4">
      <img src="/icons/group.svg" alt="Group" className="size-8 shrink-0" />
      <Input
        type="text"
        value={name}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Untitled"
        className="!text-2xl font-semibold placeholder:!text-2xl placeholder:text-muted-fg !px-2 !py-0"
        autoFocus={!group.name}
      />
      <Menu>
        <MenuTrigger className="text-muted-fg hover:text-fg">
          <IconDotsHorizontal className="size-5" />
        </MenuTrigger>
        <MenuContent placement="bottom end">
          <MenuItem onAction={onDelete} className="text-danger">
            <MenuLabel>Delete Group</MenuLabel>
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  )
}

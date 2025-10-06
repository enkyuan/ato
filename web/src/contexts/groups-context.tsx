"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api, type Group } from "@lib/api"

interface GroupsContextType {
  groups: Group[]
  setGroups: (groups: Group[]) => void
  updateGroupName: (groupId: number, name: string) => void
  updateGroupPosition: (groupId: number, newPosition: number) => Promise<void>
  reorderGroups: (oldIndex: number, newIndex: number) => void
  loadGroups: () => Promise<void>
  editingGroupId: number | null
  setEditingGroupId: (id: number | null) => void
  tempGroupName: string
  setTempGroupName: (name: string) => void
  isLoading: boolean
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined)

export function GroupsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([])
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null)
  const [tempGroupName, setTempGroupName] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const loadGroups = async () => {
    try {
      setIsLoading(true)
      const fetchedGroups = await api.getGroups()
      setGroups(fetchedGroups)
    } catch (error) {
      console.error("Failed to load groups:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadGroups()
  }, [])

  const updateGroupName = (groupId: number, name: string) => {
    setGroups((prev) => prev.map((group) => (group.id === groupId ? { ...group, name } : group)))
  }

  const updateGroupPosition = async (groupId: number, newPosition: number) => {
    try {
      await api.updateGroupPosition(groupId, newPosition)
    } catch (error) {
      console.error("Failed to update group position:", error)
      // Reload groups on error to get correct state
      await loadGroups()
    }
  }

  const reorderGroups = (oldIndex: number, newIndex: number) => {
    setGroups((prev) => {
      const newGroups = [...prev]
      const [movedGroup] = newGroups.splice(oldIndex, 1)
      newGroups.splice(newIndex, 0, movedGroup)

      // Update positions for all affected groups
      newGroups.forEach((group, index) => {
        if (group.position !== index) {
          updateGroupPosition(group.id, index)
        }
      })

      return newGroups.map((group, index) => ({ ...group, position: index }))
    })
  }

  return (
    <GroupsContext.Provider
      value={{
        groups,
        setGroups,
        updateGroupName,
        updateGroupPosition,
        reorderGroups,
        loadGroups,
        editingGroupId,
        setEditingGroupId,
        tempGroupName,
        setTempGroupName,
        isLoading,
      }}
    >
      {children}
    </GroupsContext.Provider>
  )
}

export function useGroups() {
  const context = useContext(GroupsContext)
  if (!context) {
    throw new Error("useGroups must be used within a GroupsProvider")
  }
  return context
}

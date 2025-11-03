"use client"

import { api, type Group } from "@lib/api"
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

// Split context into data and editing state to prevent unnecessary re-renders
interface GroupsDataContextType {
  groups: Group[]
  setGroups: (groups: Group[]) => void
  updateGroupName: (groupId: number, name: string) => void
  renameGroup: (groupId: number, name: string) => Promise<void>
  deleteGroup: (groupId: number) => Promise<void>
  updateGroupPosition: (groupId: number, newPosition: number) => Promise<void>
  reorderGroups: (oldIndex: number, newIndex: number) => void
  loadGroups: () => Promise<void>
  isLoading: boolean
}

interface GroupsEditingContextType {
  editingGroupId: number | null
  setEditingGroupId: (id: number | null) => void
  tempGroupName: string
  setTempGroupName: (name: string) => void
}

// Legacy combined context type for backward compatibility
interface GroupsContextType extends GroupsDataContextType, GroupsEditingContextType {}

const GroupsDataContext = createContext<GroupsDataContextType | undefined>(undefined)
const GroupsEditingContext = createContext<GroupsEditingContextType | undefined>(undefined)

export function GroupsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([])
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null)
  const [tempGroupName, setTempGroupName] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const loadGroups = useCallback(async () => {
    try {
      setIsLoading(true)
      const fetchedGroups = await api.getGroups()
      setGroups(fetchedGroups)
    } catch (error) {
      console.error("Failed to load groups:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const updateGroupName = useCallback((groupId: number, name: string) => {
    setGroups((prev) => {
      const index = prev.findIndex((g) => g.id === groupId)
      if (index === -1 || prev[index].name === name) return prev // No change, return same reference
      const newGroups = [...prev]
      newGroups[index] = { ...prev[index], name }
      return newGroups
    })
  }, [])

  const renameGroup = useCallback(
    async (groupId: number, name: string) => {
      try {
        await api.updateGroupName(groupId, name)
        updateGroupName(groupId, name)
      } catch (error) {
        console.error("Failed to rename group:", error)
        throw error
      }
    },
    [updateGroupName],
  )

  const deleteGroup = useCallback(async (groupId: number) => {
    try {
      await api.deleteGroup(groupId)
      setGroups((prev) => prev.filter((group) => group.id !== groupId))
    } catch (error) {
      console.error("Failed to delete group:", error)
      throw error
    }
  }, [])

  const updateGroupPosition = useCallback(
    async (groupId: number, newPosition: number) => {
      try {
        await api.updateGroupPosition(groupId, newPosition)
      } catch (error) {
        console.error("Failed to update group position:", error)
        // Reload groups on error to get correct state
        await loadGroups()
      }
    },
    [loadGroups],
  )

  const reorderGroups = useCallback(
    (oldIndex: number, newIndex: number) => {
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
    },
    [updateGroupPosition],
  )

  // Memoize data context separately from editing context
  const dataContextValue = useMemo(
    () => ({
      groups,
      setGroups,
      updateGroupName,
      renameGroup,
      deleteGroup,
      updateGroupPosition,
      reorderGroups,
      loadGroups,
      isLoading,
    }),
    [
      groups,
      updateGroupName,
      renameGroup,
      deleteGroup,
      updateGroupPosition,
      reorderGroups,
      loadGroups,
      isLoading,
    ],
  )

  // Memoize editing context separately to prevent re-renders
  const editingContextValue = useMemo(
    () => ({
      editingGroupId,
      setEditingGroupId,
      tempGroupName,
      setTempGroupName,
    }),
    [editingGroupId, tempGroupName],
  )

  return (
    <GroupsDataContext.Provider value={dataContextValue}>
      <GroupsEditingContext.Provider value={editingContextValue}>
        {children}
      </GroupsEditingContext.Provider>
    </GroupsDataContext.Provider>
  )
}

// Hook to access group data (most common use case)
export function useGroupsData() {
  const context = useContext(GroupsDataContext)
  if (!context) {
    throw new Error("useGroupsData must be used within a GroupsProvider")
  }
  return context
}

// Hook to access editing state (only for components that need it)
export function useGroupsEditing() {
  const context = useContext(GroupsEditingContext)
  if (!context) {
    throw new Error("useGroupsEditing must be used within a GroupsProvider")
  }
  return context
}

// Combined hook for backward compatibility
export function useGroups(): GroupsContextType {
  const dataContext = useGroupsData()
  const editingContext = useGroupsEditing()

  return useMemo(
    () => ({
      ...dataContext,
      ...editingContext,
    }),
    [dataContext, editingContext],
  )
}

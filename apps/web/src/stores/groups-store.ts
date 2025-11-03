import { create } from "zustand"
import { api, type Group } from "@lib/api"

interface GroupsStore {
  groups: Group[]
  isLoading: boolean
  editingGroupId: number | null
  tempGroupName: string

  // Actions
  setGroups: (groups: Group[]) => void
  loadGroups: () => Promise<void>
  updateGroupName: (groupId: number, name: string) => void
  renameGroup: (groupId: number, name: string) => Promise<void>
  deleteGroup: (groupId: number) => Promise<void>
  updateGroupPosition: (groupId: number, newPosition: number) => Promise<void>
  reorderGroups: (oldIndex: number, newIndex: number) => void
  setEditingGroupId: (id: number | null) => void
  setTempGroupName: (name: string) => void
}

export const useGroupsStore = create<GroupsStore>((set, get) => ({
  groups: [],
  isLoading: true,
  editingGroupId: null,
  tempGroupName: "",

  setGroups: (groups) => set({ groups }),

  loadGroups: async () => {
    try {
      set({ isLoading: true })
      const fetchedGroups = await api.getGroups()
      set({ groups: fetchedGroups })
    } catch (error) {
      console.error("Failed to load groups:", error)
    } finally {
      set({ isLoading: false })
    }
  },

  updateGroupName: (groupId, name) => {
    set((state) => {
      const index = state.groups.findIndex((g) => g.id === groupId)
      if (index === -1 || state.groups[index].name === name) return state
      const newGroups = [...state.groups]
      newGroups[index] = { ...newGroups[index], name }
      return { groups: newGroups }
    })
  },

  renameGroup: async (groupId, name) => {
    try {
      await api.updateGroupName(groupId, name)
      get().updateGroupName(groupId, name)
    } catch (error) {
      console.error("Failed to rename group:", error)
      throw error
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await api.deleteGroup(groupId)
      set((state) => ({
        groups: state.groups.filter((group) => group.id !== groupId),
      }))
    } catch (error) {
      console.error("Failed to delete group:", error)
      throw error
    }
  },

  updateGroupPosition: async (groupId, newPosition) => {
    try {
      await api.updateGroupPosition(groupId, newPosition)
    } catch (error) {
      console.error("Failed to update group position:", error)
      await get().loadGroups()
    }
  },

  reorderGroups: (oldIndex, newIndex) => {
    set((state) => {
      const newGroups = [...state.groups]
      const [movedGroup] = newGroups.splice(oldIndex, 1)
      newGroups.splice(newIndex, 0, movedGroup)

      // Update positions for all affected groups
      newGroups.forEach((group, index) => {
        if (group.position !== index) {
          get().updateGroupPosition(group.id, index)
        }
      })

      return {
        groups: newGroups.map((group, index) => ({
          ...group,
          position: index,
        })),
      }
    })
  },

  setEditingGroupId: (id) => set({ editingGroupId: id }),
  setTempGroupName: (name) => set({ tempGroupName: name }),
}))

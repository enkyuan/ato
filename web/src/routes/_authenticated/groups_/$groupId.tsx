import { GroupHeader } from "@components/group-header"
import { api } from "@lib/api"
import { createFileRoute } from "@tanstack/react-router"
import { useMemo } from "react"
import { useGroupsStore } from "@/stores/groups-store"

export const Route = createFileRoute("/_authenticated/groups_/$groupId")({
  component: GroupPage,
})

function GroupPage() {
  const { groupId } = Route.useParams()
  const navigate = Route.useNavigate()
  const groups = useGroupsStore((state) => state.groups)
  const updateGroupName = useGroupsStore((state) => state.updateGroupName)
  const setGroups = useGroupsStore((state) => state.setGroups)
  const isLoading = useGroupsStore((state) => state.isLoading)

  // Use useMemo to prevent unnecessary re-renders when groups array reference changes
  const group = useMemo(() => {
    return groups.find((g) => g.id === Number(groupId)) || null
  }, [groupId, groups])

  const handleNameChange = async (name: string) => {
    if (!group) return

    try {
      await api.updateGroupName(group.id, name)
      updateGroupName(group.id, name)
    } catch (error) {
      console.error("Failed to update group name:", error)
    }
  }

  const handleDelete = async () => {
    if (!group) return

    try {
      await api.deleteGroup(group.id)
      setGroups(groups.filter((g) => g.id !== group.id))
      navigate({ to: "/today" })
    } catch (error) {
      console.error("Failed to delete group:", error)
    }
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  if (!group) {
    return <div className="p-4">Group not found</div>
  }

  return (
    <div className="flex h-full flex-col">
      <GroupHeader group={group} onNameChange={handleNameChange} onDelete={handleDelete} />
      {/* Group content will go here */}
    </div>
  )
}

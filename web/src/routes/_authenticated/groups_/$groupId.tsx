import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { GroupHeader } from "@components/group-header"
import { api, type Group } from "@lib/api"
import { useGroups } from "@/contexts/groups-context"

export const Route = createFileRoute("/_authenticated/groups_/$groupId")({
  component: GroupPage,
})

function GroupPage() {
  const { groupId } = Route.useParams()
  const navigate = Route.useNavigate()
  const { groups, updateGroupName, setGroups, isLoading } = useGroups()
  const [group, setGroup] = useState<Group | null>(null)

  useEffect(() => {
    const foundGroup = groups.find((g) => g.id === Number(groupId))
    setGroup(foundGroup || null)
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
    <div className="flex flex-col h-full">
      <GroupHeader group={group} onNameChange={handleNameChange} onDelete={handleDelete} />
      {/* Group content will go here */}
    </div>
  )
}

"use client"

import { SidebarItem, SidebarLabel } from "@/components/ui/sidebar"
import { useGroups } from "@/contexts/groups-context"
import { useRouterState } from "@tanstack/react-router"
import type { Group } from "@/lib/api"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"
import { GroupIcon } from "@/components/icons/group-icon"

interface SortableGroupItemProps {
  group: Group
  isCurrent: boolean
  isOver: boolean
  onDelete: (groupId: number) => void
}

function SortableGroupItem({ group, isCurrent, isOver }: SortableGroupItemProps) {
  const { setNodeRef, transform, transition, isDragging, listeners, attributes } = useSortable({
    id: group.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <>
      {isOver && <div className="col-span-full h-0.5 bg-primary rounded-full mx-2 mb-1" />}
      <SidebarItem
        ref={setNodeRef as any}
        style={style}
        tooltip={group.name}
        href={`/groups/${group.id}`}
        isCurrent={isCurrent}
        className="cursor-grab active:cursor-grabbing touch-none"
        onClick={(e) => {
          if (isDragging) {
            e.preventDefault()
          }
        }}
        {...attributes}
        {...listeners}
      >
        <GroupIcon className="size-5 shrink-0 sm:size-4" data-slot="icon" />
        <SidebarLabel className="ml-2">{group.name || "Untitled"}</SidebarLabel>
      </SidebarItem>
    </>
  )
}

function DragOverlayContent({ group, isCurrent }: { group: Group; isCurrent: boolean }) {
  return (
    <div className="w-[--sidebar-width] px-4">
      <div className="grid grid-cols-[auto_1fr] gap-y-0.5">
        <SidebarItem
          tooltip={group.name || "Untitled"}
          href={`/groups/${group.id}`}
          isCurrent={isCurrent}
          className="cursor-grabbing"
        >
          <GroupIcon className="size-5 shrink-0 sm:size-4" data-slot="icon" />
          <SidebarLabel className="ml-2">{group.name || "Untitled"}</SidebarLabel>
        </SidebarItem>
      </div>
    </div>
  )
}

export function GroupsTree() {
  const { groups, reorderGroups } = useGroups()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const [activeId, setActiveId] = useState<number | null>(null)
  const [overId, setOverId] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as number | null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = groups.findIndex((g) => g.id === active.id)
      const newIndex = groups.findIndex((g) => g.id === over.id)
      reorderGroups(oldIndex, newIndex)
    }

    setActiveId(null)
    setOverId(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setOverId(null)
  }

  if (groups.length === 0) {
    return null
  }

  const activeGroup = groups.find((g) => g.id === activeId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={groups.map((g) => g.id)} strategy={verticalListSortingStrategy}>
        {groups.map((group) => {
          const isCurrent = currentPath === `/groups/${group.id}`
          const isOver = overId === group.id && activeId !== group.id
          return (
            <SortableGroupItem
              key={group.id}
              group={group}
              isCurrent={isCurrent}
              isOver={isOver}
              onDelete={function (): void {
                throw new Error("Function not implemented.")
              }}
            />
          )
        })}
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeGroup ? (
          <DragOverlayContent
            group={activeGroup}
            isCurrent={currentPath === `/groups/${activeGroup.id}`}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

"use client"

import { DragOverlayContent } from "@components/drag-overlay-content"
import { SortableGroupItem } from "@components/sortable-group-item"
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { memo, useCallback, useMemo, useState } from "react"
import { useGroupsStore } from "@/stores/groups-store"

export const GroupsTree = memo(function GroupsTree() {
  const groups = useGroupsStore((state) => state.groups)
  const reorderGroups = useGroupsStore((state) => state.reorderGroups)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [overId, setOverId] = useState<number | null>(null)

  // Memoize sensors to prevent recreation on every render
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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id as number | null)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const oldIndex = groups.findIndex((g) => g.id === active.id)
        const newIndex = groups.findIndex((g) => g.id === over.id)
        reorderGroups(oldIndex, newIndex)
      }

      setActiveId(null)
      setOverId(null)
    },
    [groups, reorderGroups],
  )

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    setOverId(null)
  }, [])

  const activeGroup = useMemo(() => groups.find((g) => g.id === activeId), [groups, activeId])

  const groupIds = useMemo(() => groups.map((g) => g.id), [groups])

  if (groups.length === 0) {
    return null
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={groupIds} strategy={verticalListSortingStrategy}>
        {groups.map((group) => {
          const isOver = overId === group.id && activeId !== group.id
          return <SortableGroupItem key={group.id} group={group} isOver={isOver} />
        })}
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeGroup ? <DragOverlayContent group={activeGroup} /> : null}
      </DragOverlay>
    </DndContext>
  )
})

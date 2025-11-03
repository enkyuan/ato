"use client"

import { GroupIcon } from "@components/icons/group-icon"
import { Button } from "@components/ui/button"
import { FieldGroup, Input } from "@components/ui/field"
import { Menu, MenuContent, MenuItem } from "@components/ui/menu"
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@components/ui/modal"
import { SidebarItem, SidebarLabel, useSidebar } from "@components/ui/sidebar"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { IconDotsVertical } from "@intentui/icons"
import type { Group } from "@lib/api"
import { memo, useState } from "react"
import { useGroupsStore } from "@/stores/groups-store"

interface SortableGroupItemProps {
  group: Group
  isOver: boolean
}

export const SortableGroupItem = memo(
  function SortableGroupItem({ group, isOver }: SortableGroupItemProps) {
    const { setNodeRef, transform, transition, isDragging, listeners, attributes } = useSortable({
      id: group.id,
    })
    const renameGroup = useGroupsStore((state) => state.renameGroup)
    const deleteGroup = useGroupsStore((state) => state.deleteGroup)
    const { state, isMobile } = useSidebar()
    const [newName, setNewName] = useState(group.name || "")
    const [isDeleting, setIsDeleting] = useState(false)
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const isCollapsed = state === "collapsed" && !isMobile

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.4 : 1,
    }

    const handleRename = async () => {
      if (newName.trim() && newName !== group.name) {
        try {
          await renameGroup(group.id, newName.trim())
          setIsRenameModalOpen(false)
        } catch (error) {
          console.error("Failed to rename group:", error)
        }
      }
    }

    const handleDelete = async () => {
      setIsDeleting(true)
      try {
        await deleteGroup(group.id)
        setIsDeleteModalOpen(false)
      } catch (error) {
        console.error("Failed to delete group:", error)
        setIsDeleting(false)
      }
    }

    return (
      <>
        {isOver && <div className="col-span-full mx-2 mb-1 h-0.5 rounded-full bg-primary" />}
        <SidebarItem
          // @ts-expect-error - dnd-kit ref type mismatch with react-aria
          ref={setNodeRef}
          style={style}
          tooltip={group.name}
          href={`/groups/${group.id}`}
          className="group cursor-grab touch-none active:cursor-grabbing"
          onClick={(e) => {
            if (isDragging) {
              e.preventDefault()
            }
          }}
          {...attributes}
          {...(isRenameModalOpen || isDeleteModalOpen ? {} : listeners)}
        >
          <GroupIcon className="size-5 shrink-0 sm:size-4" data-slot="icon" />
          <SidebarLabel className="ml-2">{group.name || "Untitled"}</SidebarLabel>
          {!isCollapsed && (
            <>
              <Menu>
                <Button
                  data-slot="menu-action-trigger"
                  size="sq-xs"
                  intent="plain"
                  className="!size-6 !min-w-6 !right-1 opacity-0 group-hover:opacity-100 transition-opacity !p-0 relative hover:bg-transparent pressed:bg-transparent"
                  isDisabled={isDeleting}
                  excludeFromTabOrder
                  preventFocusOnPress
                >
                  <IconDotsVertical className="size-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </Button>
                <MenuContent placement="bottom">
                  <MenuItem
                    onAction={() => {
                      setNewName(group.name || "")
                      setIsRenameModalOpen(true)
                    }}
                  >
                    Rename
                  </MenuItem>
                  <MenuItem onAction={() => console.log("Add todo", group.id)}>Add todo</MenuItem>
                  <MenuItem intent="danger" onAction={() => setIsDeleteModalOpen(true)}>
                    Delete
                  </MenuItem>
                </MenuContent>
              </Menu>
              <Modal isOpen={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
                <ModalContent>
                  {() => (
                    <>
                      <ModalHeader>
                        <ModalTitle>Rename Group</ModalTitle>
                      </ModalHeader>
                      <ModalBody>
                        <div className="flex flex-col gap-2">
                          <FieldGroup>
                            <Input
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleRename()
                                }
                              }}
                              placeholder="Enter group name"
                              autoFocus
                            />
                          </FieldGroup>
                        </div>
                      </ModalBody>
                      <ModalFooter>
                        <ModalClose intent="plain">Cancel</ModalClose>
                        <Button onPress={handleRename} isDisabled={!newName.trim()}>
                          Rename
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
              <Modal isOpen={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <ModalContent role="alertdialog">
                  {() => (
                    <>
                      <ModalHeader>
                        <ModalTitle>Delete Group?</ModalTitle>
                        <ModalDescription>
                          This will permanently delete "{group.name || "Untitled"}" and all its
                          contents. This action cannot be undone.
                        </ModalDescription>
                      </ModalHeader>
                      <ModalFooter>
                        <ModalClose intent="plain">Cancel</ModalClose>
                        <Button intent="danger" onPress={handleDelete} isDisabled={isDeleting}>
                          Delete Group
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </>
          )}
        </SidebarItem>
      </>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.group.id === nextProps.group.id &&
      prevProps.group.name === nextProps.group.name &&
      prevProps.isOver === nextProps.isOver
    )
  },
)

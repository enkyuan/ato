"use client"

import { Button } from "@components/ui/button"
import { ButtonGroup } from "@components/ui/button-group"
import { IconArrowLeft, IconDotsHorizontal } from "@intentui/icons"

export function TaskActions() {
  return (
    <ButtonGroup orientation="horizontal">
      <Button intent="outline" size="sm" aria-label="Go back" onPress={() => window.history.back()}>
        <IconArrowLeft />
      </Button>

      <Button
        intent="outline"
        size="sm"
        aria-label="Archive"
        onPress={() => {
          // TODO: Archive action
          console.log("Archive task")
        }}
      >
        Archive
      </Button>

      <Button
        intent="outline"
        size="sm"
        aria-label="Complete"
        onPress={() => {
          // TODO: Complete action
          console.log("Complete task")
        }}
      >
        Complete
      </Button>

      <Button
        intent="outline"
        size="sm"
        aria-label="Snooze"
        onPress={() => {
          // TODO: Snooze action
          console.log("Snooze task")
        }}
      >
        Snooze
      </Button>

      <Button
        intent="outline"
        size="sq-sm"
        aria-label="More options"
        onPress={() => {
          // TODO: More options menu
          console.log("More options")
        }}
      >
        <IconDotsHorizontal />
      </Button>
    </ButtonGroup>
  )
}

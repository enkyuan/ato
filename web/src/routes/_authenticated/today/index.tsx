import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/today/")({
  component: TodayPage,
})

function TodayPage() {
  return <div className="mx-auto max-w-4xl">{/* Task list will go here */}</div>
}

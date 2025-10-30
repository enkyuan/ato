import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/upcoming/")({
  component: UpcomingPage,
})

function UpcomingPage() {
  return <div className="mx-auto max-w-4xl">{/* Task list will go here */}</div>
}

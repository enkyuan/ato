import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/upcoming/")({
  component: UpcomingPage,
})

function UpcomingPage() {
  return <div className="max-w-4xl mx-auto">{/* Task list will go here */}</div>
}

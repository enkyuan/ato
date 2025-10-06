import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/today")({
  component: TodayPage,
})

function TodayPage() {
  return <div className="max-w-4xl mx-auto"></div>
}

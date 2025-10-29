import { createFileRoute, redirect } from "@tanstack/react-router"
import { api } from "@/lib/api"

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    if (api.isAuthenticated()) {
      throw redirect({
        to: "/today",
      })
    }
    throw redirect({
      to: "/auth/login",
    })
  },
})

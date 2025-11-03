import { api } from "@lib/api"
import { createFileRoute, redirect } from "@tanstack/react-router"

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

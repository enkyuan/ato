import { TanStackDevtools } from "@tanstack/react-devtools"
import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  ),
  notFoundComponent: () => {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-4xl">404</h1>
          <p className="text-muted-fg">Page not found</p>
        </div>
      </div>
    )
  },
})

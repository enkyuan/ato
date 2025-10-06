import { createFileRoute, Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import logo from "../logo.svg"

export const Route = createFileRoute("/")({
  component: App,
})

function App() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="text-center">
        <header className="min-h-screen flex flex-col items-center justify-center">
          <img
            src={logo}
            className="h-[40vmin] pointer-events-none animate-[spin_20s_linear_infinite]"
            alt="logo"
          />
          <h1 className="text-4xl font-bold mb-4">Welcome to Ato</h1>
          <p className="text-muted-fg mb-8">Your personal todo management application</p>

          <div className="flex gap-4">
            <Link to="/auth/login">
              <Button intent="primary" size="lg">
                Sign In
              </Button>
            </Link>
            <Link to="/auth/signup">
              <Button intent="outline" size="lg">
                Create Account
              </Button>
            </Link>
          </div>
        </header>
      </div>
    </div>
  )
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FieldGroup, Input, Label } from "@/components/ui/field"
import { Link as UILink } from "@/components/ui/link"
import { Checkbox } from "react-aria-components"
import logo from "../../logo.svg"
import { api, ApiError } from "@/lib/api"

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await api.login({ email, password })
      // Redirect to todos
      navigate({ to: "/today" })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="size-12 rounded-lg overflow-hidden">
              <img src={logo} alt="Ato" className="size-full" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-fg">Sign in</h1>
              <p className="text-muted-fg text-sm">
                Access your account to manage projects, view analytics, and collaborate with your
                team.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <FieldGroup>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </FieldGroup>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <UILink href="#" intent="primary" className="text-sm hover:underline">
                    Forgot password?
                  </UILink>
                </div>
                <FieldGroup>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sssh, it's a secret"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </FieldGroup>
              </div>

              {/* Remember Me Checkbox */}
              <div className="space-y-1">
                <Checkbox
                  id="remember"
                  isSelected={rememberMe}
                  onChange={setRememberMe}
                  className="group flex items-center gap-2"
                >
                  <div className="flex size-4 items-center justify-center rounded border border-border bg-bg transition-colors group-data-[selected]:border-primary group-data-[selected]:bg-primary">
                    {rememberMe && (
                      <svg
                        className="size-3 text-primary-fg"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <label htmlFor="remember" className="text-sm text-fg cursor-pointer select-none">
                    Remember me
                  </label>
                </Checkbox>
                <p className="text-xs text-muted-fg pl-6">
                  Keep me signed in on this device for faster access next time.
                </p>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                intent="primary"
                size="md"
                className="w-full"
                isPending={isLoading}
              >
                Sign in
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-sm text-muted-fg">
              Don't have an account?{" "}
              <Link to="/auth/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

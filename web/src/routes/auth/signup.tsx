import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FieldGroup, Input, Label } from "@/components/ui/field"
import { Checkbox } from "react-aria-components"
import logo from "../../logo.svg"
import { api, ApiError } from "@/lib/api"

export const Route = createFileRoute("/auth/signup")({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setApiError(null)

    // Validation
    const newErrors: Record<string, string> = {}

    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!agreeToTerms) {
      newErrors.terms = "You must agree to the terms and conditions"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      await api.register({ name, email, password })
      // Redirect to todos
      navigate({ to: "/today" })
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message)
      } else {
        setApiError("An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="size-12 rounded-lg overflow-hidden">
              <img src={logo} alt="Ato" className="size-full" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-fg">Create an account</h1>
              <p className="text-muted-fg text-sm">Get started with your free account today</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* API Error Display */}
              {apiError && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                  {apiError}
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                </Label>
                <FieldGroup>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </FieldGroup>
              </div>

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
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <FieldGroup>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </FieldGroup>
                {errors.password && <p className="text-sm text-danger">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <FieldGroup>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </FieldGroup>
                {errors.confirmPassword && (
                  <p className="text-sm text-danger">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="space-y-2">
                <Checkbox
                  id="terms"
                  isSelected={agreeToTerms}
                  onChange={setAgreeToTerms}
                  className="group flex items-start gap-2"
                >
                  <div className="flex size-4 mt-0.5 items-center justify-center rounded border border-border bg-bg transition-colors group-data-[selected]:border-primary group-data-[selected]:bg-primary">
                    {agreeToTerms && (
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
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-fg cursor-pointer select-none"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </Checkbox>
                {errors.terms && <p className="text-sm text-danger">{errors.terms}</p>}
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                intent="primary"
                size="md"
                className="w-full"
                isPending={isLoading}
              >
                Create account
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-sm text-muted-fg">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

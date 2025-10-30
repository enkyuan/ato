import { Button } from "@components/ui/button"
import { FieldGroup, Input, Label } from "@components/ui/field"
import { ApiError, api } from "@lib/api"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useId, useState } from "react"
import { Checkbox } from "react-aria-components"
import logo from "/logo.svg"

export const Route = createFileRoute("/auth/signup")({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const nameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const confirmPasswordId = useId()
  const termsId = useId()
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
        // Extract user-friendly error message
        const errorMessage =
          err.status === 409
            ? "An account with this email already exists. Please sign in instead."
            : err.status === 400
              ? "Please check your information and try again."
              : err.status === 0
                ? "Unable to connect to the server. Please check your internet connection."
                : err.message && typeof err.message === "string"
                  ? err.message
                  : "An error occurred during registration. Please try again."
        setApiError(errorMessage)
      } else {
        setApiError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="size-12 overflow-hidden rounded-lg">
              <img src={logo} alt="Ato" className="size-full" />
            </div>
            <div className="space-y-2">
              <h1 className="font-semibold text-2xl text-fg">Create an account</h1>
              <p className="text-muted-fg text-sm">Get started with your free account today</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* API Error Display */}
              {apiError && (
                <div className="rounded-lg border border-danger/20 bg-danger/10 p-3 text-danger text-sm">
                  {apiError}
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor={nameId} className="font-medium text-sm">
                  Name
                </Label>
                <FieldGroup>
                  <Input
                    id={nameId}
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
                <Label htmlFor={emailId} className="font-medium text-sm">
                  Email
                </Label>
                <FieldGroup>
                  <Input
                    id={emailId}
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
                <Label htmlFor={passwordId} className="font-medium text-sm">
                  Password
                </Label>
                <FieldGroup>
                  <Input
                    id={passwordId}
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </FieldGroup>
                {errors.password && <p className="text-danger text-sm">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor={confirmPasswordId} className="font-medium text-sm">
                  Confirm Password
                </Label>
                <FieldGroup>
                  <Input
                    id={confirmPasswordId}
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </FieldGroup>
                {errors.confirmPassword && (
                  <p className="text-danger text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="space-y-2">
                <Checkbox
                  id={termsId}
                  isSelected={agreeToTerms}
                  onChange={setAgreeToTerms}
                  className="group flex items-start gap-2"
                >
                  <div className="mt-0.5 flex size-4 items-center justify-center rounded border border-border bg-bg transition-colors group-data-[selected]:border-primary group-data-[selected]:bg-primary">
                    {agreeToTerms && (
                      <svg
                        className="size-3 text-secondary-fg"
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
                    htmlFor={termsId}
                    className="cursor-pointer select-none text-muted-fg text-sm"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-secondary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-secondary hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </Checkbox>
                {errors.terms && <p className="text-danger text-sm">{errors.terms}</p>}
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                intent="secondary"
                size="md"
                className="w-full"
                isPending={isLoading}
              >
                Create account
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-muted-fg text-sm">
              Already have an account?{" "}
              <Link to="/auth/login" className="font-medium text-secondary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

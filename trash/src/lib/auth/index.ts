// Re-export everything from Convex Auth React
export { useAuthActions, useAuthToken, ConvexAuthProvider } from "@convex-dev/auth/react";

// Export our custom hooks and utilities
export { useAuth, useGoogleAuth, useOTPAuth } from "../../hooks/use-auth";
export { AuthProvider } from "./provider";
export { authConfig } from "./config";
export { convex } from "../convex/client";
export {
  isValidEmail,
  isValidOTPCode,
  formatOTPCode,
  getRedirectUrl,
  handleAuthError,
  type AuthError
} from "./utils";

// Re-export Convex React hooks for convenience
export { useConvexAuth } from "convex/react";

// Export types
export type {
  User,
  AuthState,
  GoogleAuthOptions,
  OTPAuthOptions,
  OTPVerificationOptions,
  SignInResult,
  AuthProviderType,
  AuthActions
} from "../types";
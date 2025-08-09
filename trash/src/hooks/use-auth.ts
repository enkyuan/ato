import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const token = useAuthToken();

  return {
    isLoading,
    isAuthenticated,
    token,
    signIn,
    signOut,
  };
}

export function useGoogleAuth() {
  const { signIn } = useAuthActions();

  const signInWithGoogle = async (redirectTo?: string) => {
    const params = redirectTo ? { redirectTo } : undefined;
    return await signIn("google", params);
  };

  return { signInWithGoogle };
}

export function useOTPAuth() {
  const { signIn } = useAuthActions();

  const sendOTP = async (email: string, redirectTo?: string) => {
    const params = { email, ...(redirectTo && { redirectTo }) };
    return await signIn("resend-otp", params);
  };

  const verifyOTP = async (email: string, code: string, redirectTo?: string) => {
    const params = { email, code, ...(redirectTo && { redirectTo }) };
    return await signIn("resend-otp", params);
  };

  return { sendOTP, verifyOTP };
}
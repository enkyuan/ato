export interface User {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  emailVerified?: boolean;
}

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user?: User;
  token?: string | null;
}

export interface GoogleAuthOptions {
  redirectTo?: string;
}

export interface OTPAuthOptions {
  email: string;
  redirectTo?: string;
}

export interface OTPVerificationOptions {
  email: string;
  code: string;
  redirectTo?: string;
}

export interface SignInResult {
  signingIn: boolean;
  redirect?: URL;
}

export type AuthProviderType = "google" | "resend-otp";

export interface AuthActions {
  signIn: (provider: AuthProviderType, params?: any) => Promise<SignInResult>;
  signOut: () => Promise<void>;
}
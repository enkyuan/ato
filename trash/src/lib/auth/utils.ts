import { env } from "../env";

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidOTPCode(code: string): boolean {
  // Assuming OTP codes are 6 digits
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(code);
}

export function formatOTPCode(code: string): string {
  // Remove any non-digit characters and limit to 6 digits
  return code.replace(/\D/g, '').slice(0, 6);
}

export function getRedirectUrl(path?: string): string {
  return path ? `${env.WAKU_SITE_URL}${path}` : env.WAKU_SITE_URL;
}

export interface AuthError {
  message: string;
  code?: string;
}

export function handleAuthError(error: unknown): AuthError {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'AUTH_ERROR'
    };
  }
  
  return {
    message: 'An unexpected authentication error occurred',
    code: 'UNKNOWN_ERROR'
  };
}
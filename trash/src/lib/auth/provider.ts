import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { convex } from "../convex/client";
import { ReactNode } from "react";

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return ConvexAuthProvider({ 
    client: convex, 
    children 
  });
}
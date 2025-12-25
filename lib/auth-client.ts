import { createAuthClient } from "better-auth/react";
import type { SessionData } from "@/types/auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

// Export individual methods and hooks
export const {
  signUp,
  signOut,
  useSession,
  updateUser,
  changePassword,
  resetPassword,
  verifyEmail,
} = authClient;

// Export signIn with all its methods (email, social, etc.)
export const signIn = authClient.signIn;

// Type-safe wrapper for useSession
export function useTypedSession() {
  const session = useSession();
  return session as {
    data: SessionData | null;
    isPending: boolean;
    error: Error | null;
  };
}

// Helper functions for OAuth sign in
export const signInWithGitHub = async (callbackURL?: string) => {
  return await authClient.signIn.social({
    provider: "github",
    callbackURL: callbackURL || "/dashboard",
  });
};

export const signInWithGoogle = async (callbackURL?: string) => {
  return await authClient.signIn.social({
    provider: "google",
    callbackURL: callbackURL || "/dashboard",
  });
};

// Helper for email/password sign in
export const signInWithEmail = async (email: string, password: string) => {
  return await authClient.signIn.email({
    email,
    password,
  });
};

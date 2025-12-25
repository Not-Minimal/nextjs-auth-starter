// Types for better-auth with custom fields

export type UserRole = "ADMIN" | "EDITOR" | "SUBSCRIBER" | "READER";

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  // Custom fields
  role: UserRole;
  locale: string;
  bio?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionData {
  session: AuthSession;
  user: AuthUser;
}

// Hook return type
export interface UseSessionReturn {
  data: SessionData | null;
  isPending: boolean;
  error: Error | null;
}

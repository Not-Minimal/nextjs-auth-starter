// Tipos extendidos para better-auth con campos personalizados
export interface ExtendedUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  // Campos personalizados
  role: "ADMIN" | "EDITOR" | "SUBSCRIBER" | "READER";
  locale: string;
  bio?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtendedSession {
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
  session: ExtendedSession;
  user: ExtendedUser;
}

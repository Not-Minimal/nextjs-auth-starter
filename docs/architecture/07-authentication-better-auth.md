# Autenticación con better-auth - Stories of Software

## 📋 Tabla de Contenidos

- [Visión General](#-visión-general)
- [¿Por qué better-auth?](#-por-qué-better-auth)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Configuración del Servidor](#-configuración-del-servidor)
- [Configuración del Cliente](#-configuración-del-cliente)
- [Modelos de Base de Datos](#-modelos-de-base-de-datos)
- [Middleware y Protección de Rutas](#-middleware-y-protección-de-rutas)
- [Estrategias de Autenticación](#-estrategias-de-autenticación)
- [RBAC (Control de Acceso Basado en Roles)](#-rbac-control-de-acceso-basado-en-roles)
- [Sesiones y Seguridad](#-sesiones-y-seguridad)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Visión General

**better-auth** es una biblioteca moderna de autenticación para TypeScript que proporciona:

- 🔐 Múltiples estrategias de autenticación (email/password, OAuth, magic links)
- 🍪 Gestión de sesiones con cookies seguras (httpOnly, sameSite)
- 🛡️ Protección CSRF integrada
- 🚦 Rate limiting automático
- 📝 TypeScript-first con tipos completos
- 🔄 Renovación automática de sesiones
- 📧 Verificación de email out-of-the-box
- 🎨 Framework agnostic (funciona con Next.js, Express, Fastify, etc.)

---

## 💡 ¿Por qué better-auth?

### Comparación con Alternativas

| Característica | better-auth | NextAuth.js | Lucia | Auth0 |
|---------------|-------------|-------------|-------|-------|
| TypeScript-first | ✅ | ⚠️ Parcial | ✅ | ❌ |
| Self-hosted | ✅ | ✅ | ✅ | ❌ |
| OAuth integrado | ✅ | ✅ | ❌ | ✅ |
| Email/Password | ✅ | ⚠️ Manual | ✅ | ✅ |
| Magic Links | ✅ | ⚠️ Manual | ❌ | ✅ |
| RBAC integrado | ✅ | ❌ | ❌ | ✅ |
| Framework agnostic | ✅ | ❌ (Next.js) | ✅ | ✅ |
| Costo | Gratis | Gratis | Gratis | 💰 |
| API moderna | ✅ | ⚠️ | ✅ | ✅ |
| Rate limiting | ✅ | ❌ | ❌ | ✅ |

### Ventajas para Stories of Software

1. **Configuración simplificada**: Setup en minutos vs días
2. **Type-safe**: Reduce errores con tipos completos
3. **Self-hosted**: Control total de los datos
4. **Multi-provider**: OAuth + email/password sin código extra
5. **Seguridad por defecto**: httpOnly cookies, CSRF, rate limiting
6. **Documentación excelente**: https://better-auth.com

---

## 📦 Instalación y Configuración

### 1. Instalar Dependencias

```bash
# Backend (si aún no está instalado)
npm install better-auth

# Cliente React/Next.js
npm install better-auth
```

### 2. Variables de Entorno

```bash
# .env

# better-auth Core
BETTER_AUTH_SECRET=your-super-secret-key-min-32-characters-long
BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_TRUST_HOST=true

# Base de datos (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/storiesofsoftware

# OAuth Providers (opcional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Provider (para verificación)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
SMTP_FROM=noreply@storiesofsoftware.com
```

### 3. Generar Secret

```bash
# Generar un secret seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔧 Configuración del Servidor

### Archivo de Configuración Principal

```typescript
// backend/src/infrastructure/auth/auth.config.ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/infrastructure/database/prisma"

export const auth = betterAuth({
  // Adaptador de base de datos
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  
  // Configuración de email y password
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Validación personalizada de password
    passwordValidation: (password) => {
      const hasUpperCase = /[A-Z]/.test(password)
      const hasLowerCase = /[a-z]/.test(password)
      const hasNumber = /[0-9]/.test(password)
      
      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        return {
          valid: false,
          message: "Password must contain uppercase, lowercase, and numbers"
        }
      }
      
      return { valid: true }
    }
  },
  
  // Proveedores OAuth
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // Scopes personalizados
      scope: ["read:user", "user:email"]
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scope: ["openid", "email", "profile"]
    }
  },
  
  // Configuración de sesiones
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // Actualizar cada 24 horas
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // Cache de 5 minutos
    }
  },
  
  // Campos adicionales del usuario
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "READER",
        input: false // No permitir que el usuario establezca su propio rol
      },
      locale: {
        type: "string",
        required: false,
        defaultValue: "es"
      },
      bio: {
        type: "string",
        required: false
      }
    }
  },
  
  // Rate limiting
  rateLimit: {
    enabled: true,
    window: 60, // 1 minuto
    max: 10 // 10 requests por minuto
  },
  
  // Configuración avanzada
  advanced: {
    generateId: () => crypto.randomUUID(),
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false
    },
    cookiePrefix: "sos" // Stories of Software prefix
  },
  
  // Email configuration
  emailVerification: {
    sendVerificationEmail: async ({ user, token, url }) => {
      // Integrar con SendGrid u otro proveedor
      await sendEmail({
        to: user.email,
        subject: "Verify your email - Stories of Software",
        html: `
          <h1>Welcome to Stories of Software!</h1>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${url}">Verify Email</a>
          <p>Or copy this link: ${url}</p>
          <p>This link expires in 24 hours.</p>
        `
      })
    },
    sendPasswordResetEmail: async ({ user, token, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password - Stories of Software",
        html: `
          <h1>Reset your password</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${url}">Reset Password</a>
          <p>Or copy this link: ${url}</p>
          <p>This link expires in 1 hour.</p>
        `
      })
    }
  },
  
  // Callbacks / Hooks
  callbacks: {
    onSignUp: async ({ user }) => {
      console.log(`New user signed up: ${user.email}`)
      
      // Agregar a lista de newsletter (opcional)
      // await addToNewsletter(user.email)
      
      // Enviar email de bienvenida
      // await sendWelcomeEmail(user)
    },
    
    onSignIn: async ({ user, session }) => {
      console.log(`User signed in: ${user.email}`)
      
      // Actualizar last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })
    }
  }
})

export type Auth = typeof auth
```

### Integración con Fastify

```typescript
// backend/src/presentation/http/server.ts
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { auth } from '@/infrastructure/auth/auth.config'
import { toNodeHandler } from 'better-auth/node'

const app = Fastify({
  logger: true
})

// CORS
await app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
})

// better-auth handler
app.all('/api/auth/*', async (request, reply) => {
  return toNodeHandler(auth)(request.raw, reply.raw)
})

// Tus otras rutas...
```

### Integración con Express (alternativa)

```typescript
// backend/src/presentation/http/server.ts
import express from 'express'
import { auth } from '@/infrastructure/auth/auth.config'
import { toNodeHandler } from 'better-auth/node'

const app = express()

// better-auth handler
app.all('/api/auth/*', toNodeHandler(auth))
```

---

## 💻 Configuración del Cliente

### Setup del Cliente

```typescript
// frontend/src/lib/auth/auth.client.ts
import { createAuthClient } from "better-auth/react"
import type { Auth } from "@/../../backend/src/infrastructure/auth/auth.config"

export const authClient = createAuthClient<Auth>({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  credentials: "include" // Importante para cookies
})

// Exportar funciones y hooks
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  updateUser,
  changePassword,
  resetPassword,
  verifyEmail
} = authClient
```

### Provider para Next.js App Router

```typescript
// frontend/src/components/providers/AuthProvider.tsx
"use client"

import { SessionProvider } from "better-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

```typescript
// frontend/src/app/layout.tsx
import { AuthProvider } from "@/components/providers/AuthProvider"

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### Hooks Personalizados

```typescript
// frontend/src/hooks/useAuth.ts
import { useSession } from '@/lib/auth/auth.client'

export function useAuth() {
  const { data: session, isPending, error } = useSession()
  
  return {
    user: session?.user ?? null,
    session: session ?? null,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    error
  }
}

// Hook para verificar roles
export function useRequireRole(allowedRoles: string[]) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && (!user || !allowedRoles.includes(user.role))) {
      router.push('/auth/sign-in?error=unauthorized')
    }
  }, [user, isLoading, allowedRoles, router])
  
  return {
    user,
    isLoading,
    hasAccess: user && allowedRoles.includes(user.role)
  }
}

// Hook para verificar ownership
export function useRequireOwnership(resourceUserId?: string) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  const isOwner = user && resourceUserId && user.id === resourceUserId
  const isAdmin = user && user.role === 'ADMIN'
  const hasAccess = isOwner || isAdmin
  
  useEffect(() => {
    if (!isLoading && !hasAccess) {
      router.push('/auth/sign-in?error=forbidden')
    }
  }, [hasAccess, isLoading, router])
  
  return { user, isLoading, hasAccess, isOwner, isAdmin }
}
```

---

## 🗄️ Modelos de Base de Datos

### Schema de Prisma Completo

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified Boolean   @default(false) @map("email_verified")
  name          String?
  image         String?
  
  // Campos personalizados
  role          UserRole  @default(READER)
  locale        String    @default("es")
  bio           String?
  lastLoginAt   DateTime? @map("last_login_at")
  
  // Relaciones better-auth
  accounts      Account[]
  sessions      Session[]
  
  // Relaciones de la aplicación
  posts         Post[]
  books         Book[]
  purchases     Purchase[]
  subscribers   Subscriber[]
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@map("users")
}

enum UserRole {
  ADMIN
  EDITOR
  SUBSCRIBER
  READER
}

// Modelo de Session de better-auth
model Session {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  expiresAt DateTime @map("expires_at")
  token     String   @unique
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@index([userId])
  @@map("sessions")
}

// Modelo de Account de better-auth (para OAuth)
model Account {
  id            String    @id @default(cuid())
  userId        String    @map("user_id")
  accountId     String    @map("account_id")
  providerId    String    @map("provider_id")
  accessToken   String?   @map("access_token")
  refreshToken  String?   @map("refresh_token")
  idToken       String?   @map("id_token")
  expiresAt     DateTime? @map("expires_at")
  password      String?   // Para email/password auth
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@unique([providerId, accountId])
  @@index([userId])
  @@map("accounts")
}

// Modelo de Verification (para verificación de email)
model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime @map("expires_at")
  
  createdAt  DateTime @default(now()) @map("created_at")
  
  @@unique([identifier, value])
  @@map("verifications")
}
```

### Migración

```bash
# Crear migración
npx prisma migrate dev --name add_better_auth_models

# Aplicar migración en producción
npx prisma migrate deploy

# Generar cliente
npx prisma generate
```

---

## 🛡️ Middleware y Protección de Rutas

### Middleware de Autenticación

```typescript
// backend/src/presentation/http/middlewares/auth.middleware.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { auth } from '@/infrastructure/auth/auth.config'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      name: string | null
      role: string
      locale: string
    }
    session?: any
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers as Record<string, string>
    })
    
    if (!session) {
      return reply.code(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    request.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      locale: session.user.locale
    }
    
    request.session = session
    
  } catch (error) {
    return reply.code(401).send({
      error: {
        code: 'INVALID_SESSION',
        message: 'Invalid or expired session'
      }
    })
  }
}

// Middleware opcional (no falla si no hay sesión)
export async function optionalAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers as Record<string, string>
    })
    
    if (session) {
      request.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        locale: session.user.locale
      }
      request.session = session
    }
  } catch (error) {
    // Silenciar errores
  }
}
```

### Middleware RBAC

```typescript
// backend/src/presentation/http/middlewares/rbac.middleware.ts
import { FastifyRequest, FastifyReply } from 'fastify'

export function requireRole(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user
    
    if (!user) {
      return reply.code(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    if (!allowedRoles.includes(user.role)) {
      return reply.code(403).send({
        error: {
          code: 'FORBIDDEN',
          message: `Role required: ${allowedRoles.join(' or ')}`
        }
      })
    }
  }
}

// Verificar ownership o rol
export function requireOwnershipOr(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user
    
    if (!user) {
      return reply.code(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
    }

    // Check role first
    if (allowedRoles.includes(user.role)) {
      return
    }

    // Check ownership
    const resourceUserId = request.params['userId'] || request.body?.userId
    
    if (resourceUserId !== user.id) {
      return reply.code(403).send({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own resources'
        }
      })
    }
  }
}
```

### Uso en Rutas

```typescript
// backend/src/presentation/http/routes/posts.routes.ts
import { FastifyInstance } from 'fastify'
import { authMiddleware, optionalAuthMiddleware } from '@/presentation/http/middlewares/auth.middleware'
import { requireRole } from '@/presentation/http/middlewares/rbac.middleware'

export async function postsRoutes(app: FastifyInstance) {
  // Ruta pública con info opcional de usuario
  app.get('/api/posts', {
    preHandler: [optionalAuthMiddleware]
  }, async (request, reply) => {
    // request.user estará disponible si el usuario está autenticado
  })
  
  // Ruta protegida (cualquier usuario autenticado)
  app.post('/api/posts/draft', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    // request.user siempre estará disponible
  })
  
  // Ruta protegida por rol
  app.post('/api/posts', {
    preHandler: [authMiddleware, requireRole('ADMIN', 'EDITOR')]
  }, async (request, reply) => {
    // Solo ADMIN o EDITOR pueden acceder
  })
  
  // Ruta con ownership
  app.get('/api/users/:userId/drafts', {
    preHandler: [authMiddleware, requireOwnershipOr('ADMIN')]
  }, async (request, reply) => {
    // Solo el owner o ADMIN pueden acceder
  })
}
```

---

## 🔑 Estrategias de Autenticación

### 1. Email y Password

```typescript
// Componente de Sign Up
import { signUp } from '@/lib/auth/auth.client'

async function handleSignUp(email: string, password: string, name: string) {
  try {
    await signUp.email({
      email,
      password,
      name,
      callbackURL: '/dashboard'
    })
    
    // Redirigir a verificación de email
    router.push('/auth/verify-email')
  } catch (error) {
    console.error('Sign up failed:', error)
  }
}
```

```typescript
// Componente de Sign In
import { signIn } from '@/lib/auth/auth.client'

async function handleSignIn(email: string, password: string) {
  try {
    await signIn.email({
      email,
      password,
      callbackURL: '/dashboard'
    })
  } catch (error) {
    console.error('Sign in failed:', error)
  }
}
```

### 2. OAuth (GitHub, Google)

```typescript
import { signIn } from '@/lib/auth/auth.client'

async function handleOAuthSignIn(provider: 'github' | 'google') {
  await signIn.social({
    provider,
    callbackURL: '/dashboard'
  })
}
```

### 3. Password Reset

```typescript
import { resetPassword } from '@/lib/auth/auth.client'

// Solicitar reset
async function handleRequestReset(email: string) {
  try {
    await resetPassword({
      email,
      callbackURL: '/auth/reset-password'
    })
    
    alert('Check your email for reset instructions')
  } catch (error) {
    console.error('Reset request failed:', error)
  }
}

// Confirmar reset con token
async function handleConfirmReset(token: string, newPassword: string) {
  try {
    await resetPassword.confirm({
      token,
      password: newPassword
    })
    
    router.push('/auth/sign-in?success=password_reset')
  } catch (error) {
    console.error('Reset failed:', error)
  }
}
```

### 4. Email Verification

```typescript
import { verifyEmail } from '@/lib/auth/auth.client'

async function handleVerifyEmail(token: string) {
  try {
    await verifyEmail({
      token
    })
    
    router.push('/dashboard?success=email_verified')
  } catch (error) {
    console.error('Verification failed:', error)
  }
}
```

---

## 👥 RBAC (Control de Acceso Basado en Roles)

### Definición de Roles

```typescript
// types/auth.ts
export enum UserRole {
  ADMIN = 'ADMIN',       // Acceso total
  EDITOR = 'EDITOR',     // Puede publicar contenido
  SUBSCRIBER = 'SUBSCRIBER', // Acceso a contenido premium
  READER = 'READER'      // Acceso básico
}

export const ROLE_PERMISSIONS = {
  ADMIN: [
    'posts:create',
    'posts:edit',
    'posts:delete',
    'posts:publish',
    'books:create',
    'books:edit',
    'users:manage',
    'settings:manage'
  ],
  EDITOR: [
    'posts:create',
    'posts:edit',
    'posts:publish',
    'books:create',
    'books:edit'
  ],
  SUBSCRIBER: [
    'posts:read_premium',
    'books:read_premium'
  ],
  READER: [
    'posts:read_public',
    'books:read_public'
  ]
} as const
```

### Helper de Permisos

```typescript
// utils/permissions.ts
import { ROLE_PERMISSIONS } from '@/types/auth'

export function hasPermission(
  userRole: string,
  permission: string
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS]
  return permissions?.includes(permission) ?? false
}

export function hasAnyPermission(
  userRole: string,
  permissions: string[]
): boolean {
  return permissions.some(p => hasPermission(userRole, p))
}

export function hasAllPermissions(
  userRole: string,
  permissions: string[]
): boolean {
  return permissions.every(p => hasPermission(userRole, p))
}
```

### Componente con Permisos

```typescript
// components/ProtectedButton.tsx
import { useAuth } from '@/hooks/useAuth'
import { hasPermission } from '@/utils/permissions'

interface Props {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedButton({ permission, children, fallback }: Props) {
  const { user } = useAuth()
  
  if (!user || !hasPermission(user.role, permission)) {
    return fallback || null
  }
  
  return <>{children}</>
}

// Uso
<ProtectedButton permission="posts:delete">
  <button onClick={handleDelete}>Delete Post</button>
</ProtectedButton>
```

---

## 🔒 Sesiones y Seguridad

### Configuración de Cookies

```typescript
// auth.config.ts
export const auth = betterAuth({
  // ...
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // Renovar cada 24h
    
    // Cookie configuration
    cookieOptions: {
      httpOnly: true, // No accesible desde JS
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en prod
      sameSite: 'lax', // Protección CSRF
      path: '/',
      domain: process.env.COOKIE_DOMAIN // .storiesofsoftware.com
    }
  }
})
```

### Rate Limiting

```typescript
// auth.config.ts con rate limiting avanzado
export const auth = betterAuth({
  // ...
  rateLimit: {
    enabled: true,
    
    // Límites por endpoint
    signIn: {
      window: 60, // 1 minuto
      max: 5 // 5 intentos
    },
    signUp: {
      window: 60 * 60, // 1 hora
      max: 3 // 3 registros
    },
    passwordReset: {
      window: 60 * 60, // 1 hora
      max: 3 // 3 solicitudes
    }
  }
})
```

### CSRF Protection

better-auth incluye protección CSRF automática usando el patrón Double Submit Cookie. No requiere configuración adicional.

### Logging y Auditoría

```typescript
// infrastructure/auth/auth-logger.ts
import { prisma } from '@/infrastructure/database/prisma'

export async function logAuthEvent(
  event: string,
  userId: string,
  metadata?: Record<string, any>
) {
  await prisma.auditLog.create({
    data: {
      userId,
      event,
      metadata,
      timestamp: new Date(),
      ipAddress: metadata?.ip,
      userAgent: metadata?.userAgent
    }
  })
}

// Uso en callbacks
callbacks: {
  onSignIn: async ({ user, session }) => {
    await logAuthEvent('SIGN_IN', user.id, {
      ip: session.ipAddress,
      userAgent: session.userAgent
    })
  },
  onSignOut: async ({ user }) => {
    await logAuthEvent('SIGN_OUT', user.id)
  }
}
```

---

## 🧪 Testing

### Setup de Tests

```typescript
// tests/setup.ts
import { beforeEach, afterEach } from 'vitest'
import { prisma } from '@/infrastructure/database/prisma'

beforeEach(async () => {
  // Limpiar base de datos de test
  await prisma.$transaction([
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.verification.deleteMany(),
    prisma.user.deleteMany()
  ])
})

afterEach(async () => {
  await prisma.$disconnect()
})
```

### Test de Registro

```typescript
// tests/auth/signup.test.ts
import { describe, it, expect } from 'vitest'
import { auth } from '@/infrastructure/auth/auth.config'

describe('Sign Up', () => {
  it('should create a new user', async () => {
    const result = await auth.api.signUp({
      email: 'test@example.com',
      password: 'SecurePass123',
      name: 'Test User'
    })
    
    expect(result.user).toBeDefined()
    expect(result.user.email).toBe('test@example.com')
    expect(result.user.name).toBe('Test User')
    expect(result.user.role).toBe('READER')
  })
  
  it('should reject weak passwords', async () => {
    await expect(
      auth.api.signUp({
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User'
      })
    ).rejects.toThrow()
  })
  
  it('should reject duplicate emails', async () => {
    await auth.api.signUp({
      email: 'test@example.com',
      password: 'SecurePass123',
      name: 'User 1'
    })
    
    await expect(
      auth.api.signUp({
        email: 'test@example.com',
        password: 'SecurePass456',
        name: 'User 2'
      })
    ).rejects.toThrow()
  })
})
```

### Test de Autenticación

```typescript
// tests/auth/signin.test.ts
describe('Sign In', () => {
  it('should authenticate with correct credentials', async () => {
    // Create user
    await auth.api.signUp({
      email: 'test@example.com',
      password: 'SecurePass123',
      name: 'Test User'
    })
    
    // Sign in
    const result = await auth.api.signIn({
      email: 'test@example.com',
      password: 'SecurePass123'
    })
    
    expect(result.session).toBeDefined()
    expect(result.user.email).toBe('test@example.com')
  })
  
  it('should reject incorrect password', async () => {
    await auth.api.signUp({
      email: 'test@example.com',
      password: 'SecurePass123',
      name: 'Test User'
    })
    
    await expect(
      auth.api.signIn({
        email: 'test@example.com',
        password: 'WrongPass123'
      })
    ).rejects.toThrow()
  })
})
```

### Test de Middleware

```typescript
// tests/middleware/auth.test.ts
import { describe, it, expect } from 'vitest'
import { buildServer } from '@/presentation/http/server'

describe('Auth Middleware', () => {
  it('should reject requests without session', async () => {
    const server = await buildServer()
    
    const response = await server.inject({
      method: 'GET',
      url: '/api/posts/drafts'
    })
    
    expect(response.statusCode).toBe(401)
  })
  
  it('should allow requests with valid session', async () => {
    const server = await buildServer()
    
    // Create session
    const signInResponse = await server.inject({
      method: 'POST',
      url: '/api/auth/sign-in',
      payload: {
        email: 'test@example.com',
        password: 'SecurePass123'
      }
    })
    
    const cookies = signInResponse.cookies
    
    // Make authenticated request
    const response = await server.inject({
      method: 'GET',
      url: '/api/posts/drafts',
      cookies
    })
    
    expect(response.statusCode).toBe(200)
  })
})
```

---

## 🔧 Troubleshooting

### Problema: Sesión no persiste

**Síntomas**: El usuario inicia sesión pero la sesión se pierde al recargar.

**Soluciones**:

1. Verificar que las cookies estén habilitadas en el cliente
2. Asegurar que `credentials: "include"` esté en el cliente
3. Verificar CORS: `credentials: true` en el servidor
4. Revisar `sameSite` y `secure` en cookies

```typescript
// Solución en el cliente
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include" // ✅ Importante
})

// Solución en el servidor (Fastify)
await app.register(cors, {
  origin: process.env.FRONTEND_URL,
  credentials: true // ✅ Importante
})
```

### Problema: CORS errors

**Síntomas**: Error "CORS policy blocked" en la consola.

**Solución**:

```typescript
// Backend CORS config
await app.register(cors, {
  origin: [
    'http://localhost:3000',
    'https://storiesofsoftware.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
})
```

### Problema: Rate limit alcanzado

**Síntomas**: Error 429 "Too Many Requests".

**Solución**: Ajustar configuración de rate limiting

```typescript
export const auth = betterAuth({
  // ...
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20 // Aumentar límite
  }
})
```

### Problema: Email verification no llega

**Síntomas**: Usuario no recibe email de verificación.

**Checklist**:

1. ✅ Verificar variables SMTP en `.env`
2. ✅ Comprobar logs del servidor de email
3. ✅ Revisar carpeta de spam
4. ✅ Validar callback `sendVerificationEmail`

```typescript
// Debug email sending
emailVerification: {
  sendVerificationEmail: async ({ user, url }) => {
    console.log('Sending verification email to:', user.email)
    console.log('Verification URL:', url)
    
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        html: `<a href="${url}">Verify</a>`
      })
      console.log('Email sent successfully')
    } catch (error) {
      console.error('Email send failed:', error)
      throw error
    }
  }
}
```

### Problema: Session expira muy rápido

**Solución**: Ajustar `expiresIn` y `updateAge`

```typescript
export const auth = betterAuth({
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 días en lugar de 7
    updateAge: 60 * 60 * 24 // Renovar cada 24h
  }
})
```

### Problema: OAuth redirect loop

**Síntomas**: Usuario entra en loop infinito después de OAuth.

**Solución**: Verificar `callbackURL` y configuración del provider

```typescript
// Asegurar que el callback URL coincida con el configurado en GitHub/Google
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: `${process.env.BETTER_AUTH_URL}/api/auth/callback/github`
  }
}

// En GitHub OAuth App settings:
// Authorization callback URL: https://api.storiesofsoftware.com/api/auth/callback/github
```

---

## 📚 Referencias

### Documentación Oficial

- [better-auth Docs](https://better-auth.com)
- [better-auth GitHub](https://github.com/better-auth/better-auth)
- [Prisma Adapter](https://better-auth.com/docs/adapters/prisma)

### Recursos Adicionales

- [OAuth 2.0 Spec](https://oauth.net/2/)
- [OWASP Auth Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

### Ejemplos

- [better-auth Examples](https://github.com/better-auth/better-auth/tree/main/examples)
- [Next.js + better-auth](https://better-auth.com/docs/frameworks/nextjs)

---

## 🎯 Checklist de Implementación

### Backend

- [ ] Instalar `better-auth`
- [ ] Configurar variables de entorno
- [ ] Crear `auth.config.ts`
- [ ] Actualizar schema de Prisma
- [ ] Ejecutar migraciones
- [ ] Montar rutas de auth en el servidor
- [ ] Crear middlewares de auth y RBAC
- [ ] Configurar OAuth providers (opcional)
- [ ] Configurar email verification
- [ ] Escribir tests

### Frontend

- [ ] Instalar `better-auth`
- [ ] Crear `auth.client.ts`
- [ ] Agregar `AuthProvider`
- [ ] Crear hooks personalizados (`useAuth`, etc.)
- [ ] Crear páginas de auth (sign-in, sign-up, etc.)
- [ ] Implementar componentes de autenticación
- [ ] Proteger rutas que requieren auth
- [ ] Agregar manejo de errores
- [ ] Implementar loading states
- [ ] Escribir tests

### DevOps

- [ ] Configurar secretos en CI/CD
- [ ] Configurar variables en producción
- [ ] Verificar CORS en producción
- [ ] Configurar HTTPS/SSL
- [ ] Configurar OAuth callbacks en providers
- [ ] Testear flujos en staging
- [ ] Monitorear logs de autenticación
- [ ] Configurar alertas para fallos de auth

---

**Última actualización**: 2025  
**Mantenido por**: Equipo de Backend - Stories of Software
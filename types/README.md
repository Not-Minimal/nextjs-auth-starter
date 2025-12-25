# 📝 Types Documentation

Este directorio contiene todas las definiciones de tipos TypeScript centralizadas del proyecto.

## 📋 Estructura

```
types/
├── auth.ts       # Tipos de autenticación y sesión
├── index.ts      # Barrel export de todos los tipos
└── README.md     # Esta documentación
```

## 🔐 Tipos de Autenticación (`auth.ts`)

### `UserRole`

Enum de roles de usuario disponibles en el sistema.

```typescript
type UserRole = "ADMIN" | "EDITOR" | "SUBSCRIBER" | "READER";
```

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `ADMIN` | Administrador del sistema | Acceso completo |
| `EDITOR` | Editor de contenido | Crear y editar contenido |
| `SUBSCRIBER` | Suscriptor premium | Acceso a contenido premium |
| `READER` | Lector básico | Acceso a contenido público |

### `AuthUser`

Tipo completo del usuario autenticado con todos los campos personalizados.

```typescript
interface AuthUser {
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
```

**Campos estándar de better-auth:**
- `id` - ID único del usuario (cuid)
- `email` - Email del usuario
- `emailVerified` - Si el email ha sido verificado
- `name` - Nombre completo del usuario
- `image` - URL del avatar (principalmente de OAuth)

**Campos personalizados:**
- `role` - Rol del usuario en el sistema
- `locale` - Idioma preferido (ej: "es", "en")
- `bio` - Biografía del usuario
- `lastLoginAt` - Fecha del último login
- `createdAt` - Fecha de creación de la cuenta
- `updatedAt` - Fecha de última actualización

### `AuthSession`

Información de la sesión activa del usuario.

```typescript
interface AuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

**Campos:**
- `id` - ID único de la sesión
- `userId` - ID del usuario propietario
- `expiresAt` - Fecha de expiración (7 días por defecto)
- `token` - Token de sesión (almacenado en cookie httpOnly)
- `ipAddress` - Dirección IP desde donde se creó la sesión
- `userAgent` - User agent del navegador
- `createdAt` - Fecha de creación de la sesión
- `updatedAt` - Fecha de última actualización

### `SessionData`

Tipo combinado que incluye usuario y sesión, retornado por `useTypedSession()`.

```typescript
interface SessionData {
  session: AuthSession;
  user: AuthUser;
}
```

### `UseSessionReturn`

Tipo de retorno del hook `useTypedSession()`.

```typescript
interface UseSessionReturn {
  data: SessionData | null;
  isPending: boolean;
  error: Error | null;
}
```

**Campos:**
- `data` - Datos de sesión y usuario (null si no hay sesión)
- `isPending` - true mientras se carga la sesión
- `error` - Error si algo salió mal

## 📚 Uso en el Código

### Importar tipos

```typescript
// Importar tipos específicos
import type { AuthUser, UserRole, SessionData } from "@/types/auth";

// O importar todo desde el barrel
import type { AuthUser, UserRole } from "@/types";
```

### En componentes

```typescript
"use client";

import { useTypedSession } from "@/lib/auth-client";
import type { AuthUser } from "@/types/auth";

export function UserProfile() {
  const { data: session, isPending } = useTypedSession();
  
  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;
  
  // session.user está completamente tipado como AuthUser
  const user: AuthUser = session.user;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Role: {user.role}</p>
      <p>Locale: {user.locale}</p>
    </div>
  );
}
```

### Verificar roles

```typescript
import type { UserRole } from "@/types/auth";

function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    READER: 0,
    SUBSCRIBER: 1,
    EDITOR: 2,
    ADMIN: 3,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Uso
const canEdit = hasPermission(user.role, "EDITOR");
```

### Type guards

```typescript
import type { AuthUser, SessionData } from "@/types/auth";

function isAdmin(user: AuthUser): boolean {
  return user.role === "ADMIN";
}

function hasSession(
  session: SessionData | null
): session is SessionData {
  return session !== null;
}

// Uso
if (hasSession(session) && isAdmin(session.user)) {
  // TypeScript sabe que session no es null y user es admin
}
```

## 🔄 Sincronización con Prisma

Los tipos en `auth.ts` deben coincidir con el schema de Prisma:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String?
  image         String?
  role          UserRole  @default(READER)
  locale        String    @default("es")
  bio           String?
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum UserRole {
  ADMIN
  EDITOR
  SUBSCRIBER
  READER
}
```

**Importante:** Si modificas el schema de Prisma, actualiza también los tipos TypeScript.

## ✨ Mejores Prácticas

### 1. Siempre importar tipos con `type`

```typescript
// ✅ Correcto
import type { AuthUser } from "@/types/auth";

// ❌ Evitar (aumenta el bundle size)
import { AuthUser } from "@/types/auth";
```

### 2. Usar tipos en lugar de `any`

```typescript
// ❌ Evitar
const user = session.user as any;
console.log(user.role);

// ✅ Correcto
const user: AuthUser = session.user;
console.log(user.role); // TypeScript sabe que role existe
```

### 3. Aprovechar la inferencia de tipos

```typescript
// ✅ TypeScript infiere el tipo automáticamente
const { data: session } = useTypedSession();

if (session) {
  // TypeScript sabe que session.user es AuthUser
  console.log(session.user.role);
}
```

### 4. Crear tipos derivados cuando sea necesario

```typescript
// Tipo para formularios (sin campos autogenerados)
type UserFormData = Pick<AuthUser, "name" | "email" | "locale" | "bio">;

// Tipo parcial para actualizaciones
type UserUpdate = Partial<Pick<AuthUser, "name" | "locale" | "bio">>;

// Tipo sin campos sensibles para API pública
type PublicUser = Omit<AuthUser, "email" | "emailVerified" | "lastLoginAt">;
```

## 🚀 Extensión de Tipos

### Agregar nuevos campos al usuario

1. **Actualizar Prisma schema:**
   ```prisma
   model User {
     // ...campos existentes
     phoneNumber String?
   }
   ```

2. **Ejecutar migración:**
   ```bash
   pnpm prisma migrate dev --name add_phone_number
   ```

3. **Actualizar tipo TypeScript:**
   ```typescript
   export interface AuthUser {
     // ...campos existentes
     phoneNumber?: string | null;
   }
   ```

4. **Actualizar configuración de better-auth:**
   ```typescript
   user: {
     additionalFields: {
       // ...campos existentes
       phoneNumber: {
         type: "string",
         required: false,
       },
     },
   }
   ```

### Crear nuevos tipos

Agrega nuevos archivos en el directorio `types/`:

```typescript
// types/content.ts
export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  authorId: string;
  // ...
}

export type PostStatus = "DRAFT" | "PUBLISHED" | "PREMIUM";
```

Y exporta desde `types/index.ts`:

```typescript
export * from "./auth";
export * from "./content";
```

## 📖 Referencias

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [better-auth Types](https://better-auth.com/docs/concepts/typescript)
- [Prisma Types](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/type-safety)

---

**Última actualización:** 2025-12-25
**Mantenido por:** Equipo de Stories of Software
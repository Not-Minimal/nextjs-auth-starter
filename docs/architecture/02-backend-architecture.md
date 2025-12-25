# Backend Architecture - Stories of Software

**Versión:** 1.0  
**Stack:** Node.js, Fastify, PostgreSQL, Prisma  
**Patrón:** Clean Architecture + Domain-Driven Design

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Clean Architecture](#clean-architecture)
4. [Modelo de Datos](#modelo-de-datos)
5. [API Design](#api-design)
6. [Servicios y Casos de Uso](#servicios-y-casos-de-uso)
7. [Autenticación y Autorización](#autenticación-y-autorización)
8. [Procesamiento de Markdown](#procesamiento-de-markdown)
9. [Cache Strategy](#cache-strategy)
10. [Error Handling](#error-handling)

---

## 🎯 Visión General

El backend de Stories of Software es una API RESTful diseñada con Clean Architecture, proporcionando:

- **API REST** para consumo del frontend
- **GraphQL** (opcional) para queries complejas
- **Gestión de contenido** multilenguaje
- **Autenticación JWT** con refresh tokens
- **Procesamiento Markdown** a HTML
- **Sistema de eventos** para automatización
- **Control de acceso** a contenido premium

### Principios Fundamentales

1. **Domain-Driven Design**: Lógica de negocio en el dominio
2. **Dependency Inversion**: Dependencias hacia abstracciones
3. **Single Responsibility**: Cada módulo una responsabilidad
4. **API-First**: Contratos bien definidos
5. **Event-Driven**: Comunicación desacoplada vía eventos

---

## 📁 Estructura del Proyecto

```
/apps/api/
├── src/
│   ├── domain/                     # Capa de Dominio (Entities, Value Objects)
│   │   ├── entities/
│   │   │   ├── Post.ts
│   │   │   ├── Book.ts
│   │   │   ├── Chapter.ts
│   │   │   ├── User.ts
│   │   │   └── Product.ts
│   │   │
│   │   ├── value-objects/
│   │   │   ├── Email.ts
│   │   │   ├── Slug.ts
│   │   │   ├── ContentStatus.ts
│   │   │   └── Locale.ts
│   │   │
│   │   ├── repositories/           # Interfaces de repositorios
│   │   │   ├── IPostRepository.ts
│   │   │   ├── IBookRepository.ts
│   │   │   ├── IUserRepository.ts
│   │   │   └── IProductRepository.ts
│   │   │
│   │   └── events/                 # Domain Events
│   │       ├── PostPublished.ts
│   │       ├── BookCreated.ts
│   │       └── PurchaseCompleted.ts
│   │
│   ├── application/                # Capa de Aplicación (Use Cases)
│   │   ├── use-cases/
│   │   │   ├── posts/
│   │   │   │   ├── CreatePost.ts
│   │   │   │   ├── UpdatePost.ts
│   │   │   │   ├── PublishPost.ts
│   │   │   │   ├── DeletePost.ts
│   │   │   │   ├── GetPost.ts
│   │   │   │   └── ListPosts.ts
│   │   │   │
│   │   │   ├── books/
│   │   │   │   ├── CreateBook.ts
│   │   │   │   ├── AddChapter.ts
│   │   │   │   ├── PublishBook.ts
│   │   │   │   └── GetBook.ts
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── Register.ts
│   │   │   │   ├── Login.ts
│   │   │   │   ├── RefreshToken.ts
│   │   │   │   └── ResetPassword.ts
│   │   │   │
│   │   │   └── payments/
│   │   │       ├── CreateProduct.ts
│   │   │       ├── GrantAccess.ts
│   │   │       └── VerifyAccess.ts
│   │   │
│   │   ├── dto/                    # Data Transfer Objects
│   │   │   ├── PostDTO.ts
│   │   │   ├── BookDTO.ts
│   │   │   └── UserDTO.ts
│   │   │
│   │   └── services/               # Application Services
│   │       ├── MarkdownProcessor.ts
│   │       ├── EventPublisher.ts
│   │       └── EmailService.ts
│   │
│   ├── infrastructure/             # Capa de Infraestructura
│   │   ├── database/
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma
│   │   │   │   ├── migrations/
│   │   │   │   └── seed.ts
│   │   │   │
│   │   │   └── repositories/       # Implementaciones de repositorios
│   │   │       ├── PrismaPostRepository.ts
│   │   │       ├── PrismaBookRepository.ts
│   │   │       ├── PrismaUserRepository.ts
│   │   │       └── PrismaProductRepository.ts
│   │   │
│   │   ├── cache/
│   │   │   ├── RedisClient.ts
│   │   │   └── CacheService.ts
│   │   │
│   │   ├── storage/
│   │   │   ├── S3Client.ts
│   │   │   └── FileStorage.ts
│   │   │
│   │   ├── events/
│   │   │   ├── EventEmitter.ts
│   │   │   └── WebhookService.ts
│   │   │
│   │   └── external/               # Servicios externos
│   │       ├── StripeClient.ts
│   │       ├── SendGridClient.ts
│   │       └── N8nClient.ts
│   │
│   ├── presentation/               # Capa de Presentación (HTTP)
│   │   ├── http/
│   │   │   ├── routes/
│   │   │   │   ├── posts.routes.ts
│   │   │   │   ├── books.routes.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── payments.routes.ts
│   │   │   │   └── webhooks.routes.ts
│   │   │   │
│   │   │   ├── controllers/
│   │   │   │   ├── PostController.ts
│   │   │   │   ├── BookController.ts
│   │   │   │   ├── AuthController.ts
│   │   │   │   └── PaymentController.ts
│   │   │   │
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── rbac.middleware.ts
│   │   │   │   ├── rate-limit.middleware.ts
│   │   │   │   ├── validation.middleware.ts
│   │   │   │   └── error.middleware.ts
│   │   │   │
│   │   │   └── validators/
│   │   │       ├── post.validator.ts
│   │   │       ├── book.validator.ts
│   │   │       └── auth.validator.ts
│   │   │
│   │   └── graphql/                # GraphQL (opcional)
│   │       ├── schema.graphql
│   │       ├── resolvers/
│   │       └── context.ts
│   │
│   ├── shared/                     # Código compartido
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── crypto.ts
│   │   │   └── date.ts
│   │   │
│   │   ├── constants/
│   │   │   ├── errors.ts
│   │   │   ├── roles.ts
│   │   │   └── statuses.ts
│   │   │
│   │   └── types/
│   │       ├── common.ts
│   │       └── config.ts
│   │
│   ├── config/                     # Configuración
│   │   ├── database.ts
│   │   ├── cache.ts
│   │   ├── storage.ts
│   │   ├── auth.ts
│   │   └── env.ts
│   │
│   └── server.ts                   # Entry point
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/
│   ├── seed.ts
│   └── migrate.ts
│
├── .env.example
├── .env.test
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## 🏛️ Clean Architecture

### Capas y Responsabilidades

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (HTTP Controllers, Routes, Middlewares, GraphQL Resolvers) │
│  - Request validation                                        │
│  - Response formatting                                       │
│  - HTTP concerns                                             │
└────────────────────────┬────────────────────────────────────┘
                         │ Dependencies point inward
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│         (Use Cases, Application Services, DTOs)              │
│  - Orchestration logic                                       │
│  - Business workflows                                        │
│  - Transaction boundaries                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                            │
│    (Entities, Value Objects, Domain Events, Interfaces)      │
│  - Business rules                                            │
│  - Domain logic                                              │
│  - Core abstractions                                         │
└────────────────────────▲────────────────────────────────────┘
                         │
                         │ Implements interfaces
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                        │
│  (Database, Cache, Storage, External APIs, Events)           │
│  - Database access (Prisma)                                  │
│  - External services                                         │
│  - Technical details                                         │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Rule

**Regla fundamental**: Las dependencias solo pueden apuntar hacia adentro. Las capas internas no conocen las externas.

```typescript
// ✅ CORRECTO: Infrastructure depende de Domain
// infrastructure/database/repositories/PrismaPostRepository.ts
import { IPostRepository } from '@/domain/repositories/IPostRepository'
import { Post } from '@/domain/entities/Post'

export class PrismaPostRepository implements IPostRepository {
  async save(post: Post): Promise<void> {
    // Implementación con Prisma
  }
}

// ✅ CORRECTO: Application depende de Domain
// application/use-cases/posts/CreatePost.ts
import { IPostRepository } from '@/domain/repositories/IPostRepository'
import { Post } from '@/domain/entities/Post'

export class CreatePostUseCase {
  constructor(private postRepository: IPostRepository) {}
  
  async execute(data: CreatePostDTO): Promise<Post> {
    const post = Post.create(data)
    await this.postRepository.save(post)
    return post
  }
}

// ❌ INCORRECTO: Domain NO debe depender de Infrastructure
// domain/entities/Post.ts
import { PrismaClient } from '@prisma/client' // ❌ NUNCA!
```

---

## 🗄️ Modelo de Datos

### Prisma Schema

```prisma
// infrastructure/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER & AUTHENTICATION
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified Boolean   @default(false) @map("email_verified")
  name          String?
  image         String?   // better-auth usa 'image' en lugar de 'avatar'
  role          UserRole  @default(READER)
  locale        String    @default("es")
  
  // better-auth requiere estos campos
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  // Relaciones
  posts         Post[]
  books         Book[]
  purchases     Purchase[]
  accounts      Account[]
  sessions      Session[]
  
  @@map("users")
}

enum UserRole {
  ADMIN
  EDITOR
  SUBSCRIBER
  READER
}

// better-auth Session model
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

// better-auth Account model (para OAuth providers)
model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  accountId         String  @map("account_id")
  providerId        String  @map("provider_id")
  accessToken       String? @map("access_token")
  refreshToken      String? @map("refresh_token")
  idToken           String? @map("id_token")
  expiresAt         DateTime? @map("expires_at")
  password          String? // Para email/password auth
  
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  
  @@unique([providerId, accountId])
  @@index([userId])
  @@map("accounts")
}

// Opcional: Para tokens de verificación de email
model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime @map("expires_at")
  
  createdAt  DateTime @default(now()) @map("created_at")
  
  @@unique([identifier, value])
  @@map("verifications")
}

// ============================================
// CONTENT - POSTS
// ============================================

model Post {
  id            String        @id @default(cuid())
  slug          String
  locale        String        @default("es")
  
  title         String
  excerpt       String        @db.Text
  content       String        @db.Text
  contentHtml   String        @map("content_html") @db.Text
  
  coverImage    String?       @map("cover_image")
  readingTime   Int           @map("reading_time")
  
  status        ContentStatus @default(DRAFT)
  isPremium     Boolean       @default(false) @map("is_premium")
  
  authorId      String        @map("author_id")
  author        User          @relation(fields: [authorId], references: [id])
  
  categoryId    String?       @map("category_id")
  category      Category?     @relation(fields: [categoryId], references: [id])
  
  tags          PostTag[]
  versions      PostVersion[]
  
  publishedAt   DateTime?     @map("published_at")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  
  @@unique([slug, locale])
  @@index([authorId])
  @@index([status])
  @@index([locale])
  @@index([publishedAt])
  @@map("posts")
}

model PostVersion {
  id            String    @id @default(cuid())
  postId        String    @map("post_id")
  post          Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  version       Int
  content       String    @db.Text
  contentHtml   String    @map("content_html") @db.Text
  
  createdAt     DateTime  @default(now()) @map("created_at")
  
  @@unique([postId, version])
  @@map("post_versions")
}

enum ContentStatus {
  DRAFT
  READY
  PUBLISHED
  ARCHIVED
}

// ============================================
// CONTENT - BOOKS
// ============================================

model Book {
  id            String        @id @default(cuid())
  slug          String
  locale        String        @default("es")
  
  title         String
  description   String        @db.Text
  coverImage    String?       @map("cover_image")
  
  status        ContentStatus @default(DRAFT)
  isPremium     Boolean       @default(false) @map("is_premium")
  
  authorId      String        @map("author_id")
  author        User          @relation(fields: [authorId], references: [id])
  
  chapters      Chapter[]
  products      Product[]
  
  publishedAt   DateTime?     @map("published_at")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  
  @@unique([slug, locale])
  @@index([authorId])
  @@index([status])
  @@map("books")
}

model Chapter {
  id            String        @id @default(cuid())
  bookId        String        @map("book_id")
  book          Book          @relation(fields: [bookId], references: [id], onDelete: Cascade)
  
  slug          String
  order         Int
  
  title         String
  content       String        @db.Text
  contentHtml   String        @map("content_html") @db.Text
  
  status        ContentStatus @default(DRAFT)
  isFree        Boolean       @default(false) @map("is_free")
  
  publishedAt   DateTime?     @map("published_at")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  
  @@unique([bookId, slug])
  @@unique([bookId, order])
  @@index([bookId])
  @@map("chapters")
}

// ============================================
// TAXONOMY
// ============================================

model Category {
  id            String    @id @default(cuid())
  slug          String    @unique
  name          String
  description   String?   @db.Text
  
  posts         Post[]
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@map("categories")
}

model Tag {
  id            String    @id @default(cuid())
  slug          String    @unique
  name          String
  
  posts         PostTag[]
  
  createdAt     DateTime  @default(now()) @map("created_at")
  
  @@map("tags")
}

model PostTag {
  postId        String    @map("post_id")
  post          Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  tagId         String    @map("tag_id")
  tag           Tag       @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([postId, tagId])
  @@map("post_tags")
}

// ============================================
// MONETIZATION
// ============================================

model Product {
  id            String    @id @default(cuid())
  name          String
  description   String    @db.Text
  
  price         Decimal   @db.Decimal(10, 2)
  currency      String    @default("USD")
  
  paymentLink   String    @map("payment_link")
  
  // Polymorphic relation
  resourceType  String    @map("resource_type") // POST, BOOK, COURSE
  resourceId    String    @map("resource_id")
  
  bookId        String?   @map("book_id")
  book          Book?     @relation(fields: [bookId], references: [id])
  
  purchases     Purchase[]
  
  isActive      Boolean   @default(true) @map("is_active")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@index([resourceType, resourceId])
  @@map("products")
}

model Purchase {
  id            String    @id @default(cuid())
  
  userId        String    @map("user_id")
  user          User      @relation(fields: [userId], references: [id])
  
  productId     String    @map("product_id")
  product       Product   @relation(fields: [productId], references: [id])
  
  amount        Decimal   @db.Decimal(10, 2)
  currency      String
  
  provider      String    // STRIPE, LEMON_SQUEEZY
  transactionId String    @map("transaction_id")
  
  status        PurchaseStatus @default(PENDING)
  
  purchasedAt   DateTime  @default(now()) @map("purchased_at")
  
  @@unique([provider, transactionId])
  @@index([userId])
  @@index([productId])
  @@map("purchases")
}

enum PurchaseStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

// ============================================
// NEWSLETTER
// ============================================

model Subscriber {
  id            String    @id @default(cuid())
  email         String    @unique
  locale        String    @default("es")
  
  isActive      Boolean   @default(true) @map("is_active")
  confirmedAt   DateTime? @map("confirmed_at")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@index([locale])
  @@map("subscribers")
}
```

---

## 🔌 API Design

### REST Endpoints

#### Posts API

```typescript
// GET /api/posts
// List all published posts
Query Parameters:
  - locale: string (es|en)
  - page: number
  - limit: number
  - category: string
  - tag: string
  - status: string (admin only)

Response: {
  data: Post[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// GET /api/posts/:slug
// Get post by slug
Query Parameters:
  - locale: string (es|en)

Response: {
  data: Post
}

// POST /api/posts
// Create new post (admin only)
Authorization: Bearer <token>

Body: {
  slug: string
  locale: string
  title: string
  excerpt: string
  content: string
  coverImage?: string
  isPremium: boolean
  categoryId?: string
  tags?: string[]
}

Response: {
  data: Post
}

// PUT /api/posts/:id
// Update post (admin only)
Authorization: Bearer <token>

Body: Partial<CreatePostDTO>

Response: {
  data: Post
}

// PATCH /api/posts/:id/publish
// Publish post (admin only)
Authorization: Bearer <token>

Response: {
  data: Post
}

// DELETE /api/posts/:id
// Delete post (admin only)
Authorization: Bearer <token>

Response: {
  success: boolean
}
```

#### Books API

```typescript
// GET /api/books
// List all books
Query Parameters:
  - locale: string (es|en)

Response: {
  data: Book[]
}

// GET /api/books/:slug
// Get book with chapters
Query Parameters:
  - locale: string (es|en)

Response: {
  data: {
    book: Book
    chapters: Chapter[]
    userHasAccess: boolean
  }
}

// GET /api/books/:slug/chapters/:chapterSlug
// Get chapter content
Query Parameters:
  - locale: string (es|en)
Authorization: Bearer <token> (if premium)

Response: {
  data: Chapter
}

// POST /api/books
// Create book (admin only)
Authorization: Bearer <token>

Body: {
  slug: string
  locale: string
  title: string
  description: string
  coverImage?: string
  isPremium: boolean
}

Response: {
  data: Book
}

// POST /api/books/:id/chapters
// Add chapter to book (admin only)
Authorization: Bearer <token>

Body: {
  slug: string
  title: string
  content: string
  order: number
  isFree: boolean
}

Response: {
  data: Chapter
}
```

#### Auth API

> **Nota**: La autenticación se gestiona con **better-auth**, una biblioteca moderna que proporciona autenticación segura con múltiples estrategias (email/password, OAuth, magic links) y gestión de sesiones integrada.

```typescript
// POST /api/auth/sign-up
// Gestionado por better-auth
Body: {
  email: string
  password: string
  name: string
  callbackURL?: string
}

Response: {
  user: User
  session: Session
}

// POST /api/auth/sign-in
// Gestionado por better-auth
Body: {
  email: string
  password: string
}

Response: {
  user: User
  session: Session
}

// POST /api/auth/sign-out
// Gestionado por better-auth
Authorization: Session cookie

Response: {
  success: boolean
}

// GET /api/auth/session
// Gestionado por better-auth
Authorization: Session cookie

Response: {
  user: User
  session: Session
}

// OAuth Endpoints (automáticos con better-auth)
// GET /api/auth/oauth/github
// GET /api/auth/oauth/google
// Callback: /api/auth/oauth/callback/:provider
```

#### Payments API

```typescript
// POST /api/payments/products
// Create product (admin only)
Authorization: Bearer <token>

Body: {
  name: string
  description: string
  price: number
  currency: string
  paymentLink: string
  resourceType: string
  resourceId: string
}

Response: {
  data: Product
}

// GET /api/payments/products/:id
// Get product details

Response: {
  data: Product
}

// POST /api/webhooks/stripe
// Stripe webhook for purchase confirmation
Headers:
  - stripe-signature: string

Body: StripeEvent

Response: {
  received: true
}

// GET /api/payments/verify-access
// Verify user has access to resource
Authorization: Bearer <token>
Query Parameters:
  - resourceType: string
  - resourceId: string

Response: {
  hasAccess: boolean
  purchase?: Purchase
}
```

### Error Response Format

```typescript
// Standard error response
{
  error: {
    code: string        // ERROR_CODE
    message: string     // Human-readable message
    details?: any       // Additional error details
    timestamp: string   // ISO 8601 timestamp
    path: string        // Request path
  }
}

// Examples
{
  error: {
    code: "POST_NOT_FOUND",
    message: "Post with slug 'invalid' not found",
    timestamp: "2025-12-15T10:30:00Z",
    path: "/api/posts/invalid"
  }
}

{
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid request data",
    details: {
      email: ["Invalid email format"],
      password: ["Password must be at least 8 characters"]
    },
    timestamp: "2025-12-15T10:30:00Z",
    path: "/api/auth/register"
  }
}
```

---

## 🎯 Servicios y Casos de Uso

### Use Case Pattern

```typescript
// application/use-cases/posts/CreatePost.ts
import { IPostRepository } from '@/domain/repositories/IPostRepository'
import { Post } from '@/domain/entities/Post'
import { EventPublisher } from '@/application/services/EventPublisher'
import { MarkdownProcessor } from '@/application/services/MarkdownProcessor'

export interface CreatePostDTO {
  slug: string
  locale: string
  title: string
  excerpt: string
  content: string
  authorId: string
  isPremium: boolean
  categoryId?: string
  tags?: string[]
}

export class CreatePostUseCase {
  constructor(
    private postRepository: IPostRepository,
    private markdownProcessor: MarkdownProcessor,
    private eventPublisher: EventPublisher
  ) {}

  async execute(dto: CreatePostDTO): Promise<Post> {
    // 1. Process markdown content
    const contentHtml = await this.markdownProcessor.process(dto.content)
    const readingTime = this.markdownProcessor.calculateReadingTime(dto.content)

    // 2. Create domain entity
    const post = Post.create({
      ...dto,
      contentHtml,
      readingTime,
      status: 'DRAFT'
    })

    // 3. Validate business rules
    await this.validateUniqueSlug(dto.slug, dto.locale)

    // 4. Persist
    await this.postRepository.save(post)

    // 5. Emit domain event
    await this.eventPublisher.publish({
      type: 'post.created',
      payload: { postId: post.id }
    })

    return post
  }

  private async validateUniqueSlug(slug: string, locale: string): Promise<void> {
    const existing = await this.postRepository.findBySlug(slug, locale)
    if (existing) {
      throw new Error('POST_SLUG_ALREADY_EXISTS')
    }
  }
}
```

### Publish Post Use Case

```typescript
// application/use-cases/posts/PublishPost.ts
import { IPostRepository } from '@/domain/repositories/IPostRepository'
import { EventPublisher } from '@/application/services/EventPublisher'

export class PublishPostUseCase {
  constructor(
    private postRepository: IPostRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(postId: string, userId: string): Promise<void> {
    // 1. Get post
    const post = await this.postRepository.findById(postId)
    if (!post) {
      throw new Error('POST_NOT_FOUND')
    }

    // 2. Verify ownership
    if (post.authorId !== userId) {
      throw new Error('UNAUTHORIZED')
    }

    // 3. Validate can publish
    if (post.status === 'PUBLISHED') {
      throw new Error('POST_ALREADY_PUBLISHED')
    }

    // 4. Update status
    post.publish()

    // 5. Save
    await this.postRepository.update(post)

    // 6. Emit event for automation (n8n)
    await this.eventPublisher.publish({
      type: 'post.published',
      payload: {
        postId: post.id,
        slug: post.slug,
        locale: post.locale,
        title: post.title,
        excerpt: post.excerpt,
        publishedAt: post.publishedAt
      }
    })
  }
}
```

### Verify Access Use Case

```typescript
// application/use-cases/payments/VerifyAccess.ts
import { IPostRepository } from '@/domain/repositories/IPostRepository'
import { IBookRepository } from '@/domain/repositories/IBookRepository'
import { IPurchaseRepository } from '@/domain/repositories/IPurchaseRepository'

export class VerifyAccessUseCase {
  constructor(
    private postRepository: IPostRepository,
    private bookRepository: IBookRepository,
    private purchaseRepository: IPurchaseRepository
  ) {}

  async execute(
    userId: string,
    resourceType: string,
    resourceId: string
  ): Promise<boolean> {
    // 1. Get resource
    let resource
    if (resourceType === 'POST') {
      resource = await this.postRepository.findById(resourceId)
    } else if (resourceType === 'BOOK') {
      resource = await this.bookRepository.findById(resourceId)
    } else {
      throw new Error('INVALID_RESOURCE_TYPE')
    }

    if (!resource) {
      throw new Error('RESOURCE_NOT_FOUND')
    }

    // 2. If not premium, allow access
    if (!resource.isPremium) {
      return true
    }

    // 3. Check if user has purchased
    const purchase = await this.purchaseRepository.findByUserAndResource(
      userId,
      resourceType,
      resourceId
    )

    return purchase !== null && purchase.status === 'COMPLETED'
  }
}
```

---

## 🔐 Autenticación y Autorización

> **Implementación con better-auth**: Este proyecto utiliza [better-auth](https://better-auth.com), una biblioteca moderna y segura para autenticación en Node.js que proporciona:
> - Múltiples estrategias de autenticación (email/password, OAuth, magic links)
> - Gestión de sesiones con cookies seguras (httpOnly)
> - Soporte para CSRF protection
> - Rate limiting integrado
> - TypeScript-first con tipos completos

### better-auth Configuration

```typescript
// infrastructure/auth/auth.config.ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/infrastructure/database/prisma"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // Actualizar cada 24 horas
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // 5 minutos
    }
  },
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
      }
    }
  },
  rateLimit: {
    enabled: true,
    window: 60, // 1 minuto
    max: 10 // 10 requests por minuto
  },
  advanced: {
    generateId: () => crypto.randomUUID(),
    crossSubDomainCookies: {
      enabled: false
    }
  }
})

export type Auth = typeof auth
```

### Auth Middleware with better-auth

```typescript
// presentation/http/middlewares/auth.middleware.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { auth } from '@/infrastructure/auth/auth.config'

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // better-auth verifica automáticamente la sesión desde las cookies
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

    // Obtener el usuario completo
    const user = session.user
    
    // Attach user to request
    request.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      locale: user.locale
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

// Middleware opcional para rutas públicas que pueden beneficiarse de la sesión
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
    // Silenciar errores en middleware opcional
  }
}
```

### RBAC Middleware

```typescript
// presentation/http/middlewares/rbac.middleware.ts
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
          message: 'Insufficient permissions'
        }
      })
    }
  }
}

// Helper para verificar ownership
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

    // Si el usuario tiene un rol permitido, permitir acceso
    if (allowedRoles.includes(user.role)) {
      return
    }

    // Si no, verificar ownership basado en el resourceId
    const resourceUserId = request.params.userId || request.body?.userId
    
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

// Usage in routes
app.post('/api/posts', {
  preHandler: [authMiddleware, requireRole('ADMIN', 'EDITOR')]
}, createPostHandler)

app.get('/api/users/:userId/purchases', {
  preHandler: [authMiddleware, requireOwnershipOr('ADMIN')]
}, getUserPurchasesHandler)
```

### Auth Routes Setup

```typescript
// presentation/http/routes/auth.routes.ts
import { FastifyInstance } from 'fastify'
import { auth } from '@/infrastructure/auth/auth.config'

export async function authRoutes(app: FastifyInstance) {
  // better-auth proporciona todas las rutas automáticamente
  // Solo necesitamos montarlas en nuestro servidor Fastify
  
  app.all('/api/auth/*', async (request, reply) => {
    // Convertir la request de Fastify a Request estándar
    const response = await auth.handler({
      method: request.method,
      path: request.url,
      headers: request.headers as Record<string, string>,
      body: request.body,
      query: request.query as Record<string, string>
    })
    
    // Enviar la respuesta
    reply
      .code(response.status)
      .headers(response.headers)
      .send(response.body)
  })
  
  // Rutas personalizadas adicionales si se necesitan
  
  // Verificar estado de la sesión
  app.get('/api/auth/status', {
    preHandler: [optionalAuthMiddleware]
  }, async (request, reply) => {
    if (request.user) {
      return reply.send({
        authenticated: true,
        user: {
          id: request.user.id,
          email: request.user.email,
          name: request.user.name,
          role: request.user.role,
          locale: request.user.locale
        }
      })
    }
    
    return reply.send({
      authenticated: false
    })
  })
}
```

### Environment Variables

```bash
# .env
# better-auth Configuration
BETTER_AUTH_SECRET=your-super-secret-key-here-min-32-chars
BETTER_AUTH_URL=http://localhost:3001

# OAuth Providers (opcional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Provider (para verificación de email)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@storiesofsoftware.com
```

---

## 📝 Procesamiento de Markdown

### Markdown Processor Service

```typescript
// application/services/MarkdownProcessor.ts
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'

export class MarkdownProcessor {
  async process(markdown: string): Promise<string> {
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
      .use(rehypeHighlight, { ignoreMissing: true })
      .use(rehypeStringify)
      .process(markdown)

    return String(result)
  }

  calculateReadingTime(markdown: string): number {
    const wordsPerMinute = 200
    const words = markdown.split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  extractExcerpt(markdown: string, maxLength: number = 200): string {
    // Remove markdown syntax
    const plainText = markdown
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`(.+?)`/g, '$1')

    if (plainText.length <= maxLength) {
      return plainText
    }

    return plainText.substring(0, maxLength) + '...'
  }

  extractHeadings(markdown: string): Array<{ level: number; text: string; slug: string }> {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const headings = []
    let match

    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length
      const text = match[2]
      const slug = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      
      headings.push({ level, text, slug })
    }

    return headings
  }
}
```

---

## 💾 Cache Strategy

### Redis Cache Service

```typescript
// infrastructure/cache/CacheService.ts
import Redis from 'ioredis'

export class CacheService {
  private redis: Redis

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: 0
    })
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key)
    if (!value) return null
    return JSON.parse(value)
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, serialized)
    } else {
      await this.redis.set(key, serialized)
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key)
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key)
    return result === 1
  }
}
```

### Cache Keys Strategy

```typescript
// shared/constants/cache-keys.ts
export const CacheKeys = {
  // Posts
  POST_BY_SLUG: (slug: string, locale: string) => `post:${locale}:${slug}`,
  POST_LIST: (locale: string, page: number) => `posts:${locale}:page:${page}`,
  POST_BY_CATEGORY: (categorySlug: string, locale: string) => 
    `posts:category:${categorySlug}:${locale}`,
  
  // Books
  BOOK_BY_SLUG: (slug: string, locale: string) => `book:${locale}:${slug}`,
  BOOK_CHAPTERS: (bookId: string) => `book:${bookId}:chapters`,
  
  // User
  USER_BY_ID: (userId: string) => `user:${userId}`,
  USER_PURCHASES: (userId: string) => `user:${userId}:purchases`,
  
  // Patterns for invalidation
  POSTS_PATTERN: 'posts:*',
  POST_PATTERN: (locale: string) => `post:${locale}:*`,
  BOOK_PATTERN: (locale: string) => `book:${locale}:*`,
}

// Cache TTLs (in seconds)
export const CacheTTL = {
  POST: 3600,        // 1 hour
  POST_LIST: 300,    // 5 minutes
  BOOK: 7200,        // 2 hours
  USER: 1800,        // 30 minutes
}
```

### Cached Repository Decorator

```typescript
// infrastructure/database/repositories/CachedPostRepository.ts
import { IPostRepository } from '@/domain/repositories/IPostRepository'
import { Post } from '@/domain/entities/Post'
import { CacheService } from '@/infrastructure/cache/CacheService'
import { CacheKeys, CacheTTL } from '@/shared/constants/cache-keys'

export class CachedPostRepository implements IPostRepository {
  constructor(
    private repository: IPostRepository,
    private cache: CacheService
  ) {}

  async findBySlug(slug: string, locale: string): Promise<Post | null> {
    const cacheKey = CacheKeys.POST_BY_SLUG(slug, locale)
    
    // Try cache first
    const cached = await this.cache.get<Post>(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from database
    const post = await this.repository.findBySlug(slug, locale)
    
    // Cache result
    if (post) {
      await this.cache.set(cacheKey, post, CacheTTL.POST)
    }

    return post
  }

  async save(post: Post): Promise<void> {
    // Save to database
    await this.repository.save(post)
    
    // Invalidate related caches
    await this.cache.invalidatePattern(CacheKeys.POST_PATTERN(post.locale))
    await this.cache.invalidatePattern(CacheKeys.POSTS_PATTERN)
  }

  async update(post: Post): Promise<void> {
    await this.repository.update(post)
    
    // Invalidate specific post cache
    await this.cache.del(CacheKeys.POST_BY_SLUG(post.slug, post.locale))
    await this.cache.invalidatePattern(CacheKeys.POSTS_PATTERN)
  }

  // ... implement other methods
}
```

---

## ❌ Error Handling

### Custom Error Classes

```typescript
// shared/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly details?: any
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier: string) {
    super(
      `${resource.toUpperCase()}_NOT_FOUND`,
      `${resource} with identifier '${identifier}' not found`,
      404
    )
  }
}

export class ValidationError extends AppError {
  constructor(details: any) {
    super(
      'VALIDATION_ERROR',
      'Request validation failed',
      400,
      details
    )
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message, 403)
  }
}
```

### Error Handler Middleware

```typescript
// presentation/http/middlewares/error.middleware.ts
import { FastifyError, FastifyRequest, FastifyReply } from 'fastify'
import { AppError } from '@/shared/errors/AppError'
import { logger } from '@/shared/utils/logger'

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error
  logger.error({
    error: error.message,
    stack: error.stack,
    path: request.url,
    method: request.method
  })

  // Handle custom AppError
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        path: request.url
      }
    })
  }

  // Handle Fastify validation errors
  if (error.validation) {
    return reply.code(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.validation,
        timestamp: new Date().toISOString(),
        path: request.url
      }
    })
  }

  // Default server error
  return reply.code(500).send({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      path: request.url
    }
  })
}
```

---

## 🚀 Server Setup

### Main Server File

```typescript
// src/server.ts
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { errorHandler } from '@/presentation/http/middlewares/error.middleware'
import { setupRoutes } from '@/presentation/http/routes'
import { logger } from '@/shared/utils/logger'

async function buildServer() {
  const server = Fastify({
    logger: true,
    ajv: {
      customOptions: {
        removeAdditional: 'all',
        coerceTypes: true,
        useDefaults: true
      }
    }
  })

  // Security
  await server.register(helmet)
  await server.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  })

  // Rate limiting
  await server.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes'
  })

  // Routes
  setupRoutes(server)

  // Error handling
  server.setErrorHandler(errorHandler)

  // Health check
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  return server
}

async function start() {
  try {
    const server = await buildServer()
    const port = parseInt(process.env.PORT || '3001')
    
    await server.listen({ port, host: '0.0.0.0' })
    
    logger.info(`Server listening on port ${port}`)
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
```

---

## 📚 Referencias

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [REST API Design Best Practices](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/)

---

**Próximo**: `03-data-model.md` - Modelo de datos detallado con diagramas ER

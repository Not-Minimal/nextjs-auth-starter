# Diagramas de Arquitectura - Stories of Software
## Visual Architecture Diagrams

**Versión:** 1.0  
**Formato:** Mermaid Diagrams  
**Propósito:** Documentación visual de la arquitectura

---

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Flujo de Datos](#flujo-de-datos)
3. [Modelo de Dominio](#modelo-de-dominio)
4. [Workflows de Automatización](#workflows-de-automatización)
5. [Deployment Architecture](#deployment-architecture)
6. [Secuencia de Casos de Uso](#secuencia-de-casos-de-uso)

---

## 🏗️ Arquitectura General

### High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "CDN & Edge"
        CDN[Cloudflare CDN]
        Edge[Edge Functions]
    end

    subgraph "Application Layer"
        Frontend[Next.js Frontend<br/>Port 3000]
        API[Backend API<br/>Port 3001]
        N8N[n8n Automation<br/>Port 5678]
    end

    subgraph "Data Layer"
        Postgres[(PostgreSQL<br/>Port 5432)]
        Redis[(Redis Cache<br/>Port 6379)]
        S3[S3 Storage<br/>MinIO]
    end

    subgraph "External Services"
        Medium[Medium API]
        DevTo[Dev.to API]
        Stripe[Stripe]
        SendGrid[SendGrid]
    end

    Browser --> CDN
    Mobile --> CDN
    CDN --> Frontend
    Frontend --> API
    API --> Postgres
    API --> Redis
    API --> S3
    API --> N8N
    N8N --> Medium
    N8N --> DevTo
    N8N --> Stripe
    N8N --> SendGrid
    N8N --> API

    style Frontend fill:#0070f3,color:#fff
    style API fill:#68a063,color:#fff
    style N8N fill:#ff6d5a,color:#fff
    style Postgres fill:#336791,color:#fff
    style Redis fill:#dc382d,color:#fff
```

### Frontend Architecture

```mermaid
graph LR
    subgraph "Next.js App Router"
        Root[app/]
        Locale[app/\[locale\]/]
        
        subgraph "Routes"
            Home[Home Page]
            Blog[Blog Section]
            Books[Books Section]
            Admin[Admin Dashboard]
        end
    end

    subgraph "Components"
        UI[UI Components<br/>shadcn/ui]
        Layout[Layout Components]
        Features[Feature Components]
    end

    subgraph "State & Data"
        Query[React Query<br/>Server State]
        Zustand[Zustand<br/>Client State]
        i18n[next-intl<br/>Translations]
    end

    Root --> Locale
    Locale --> Home
    Locale --> Blog
    Locale --> Books
    Locale --> Admin
    
    Home --> UI
    Blog --> UI
    Books --> UI
    Admin --> UI
    
    Home --> Layout
    Blog --> Layout
    
    Home --> Features
    
    Features --> Query
    Features --> Zustand
    Layout --> i18n

    style Root fill:#0070f3,color:#fff
    style Query fill:#ff4154,color:#fff
    style Zustand fill:#443e38,color:#fff
```

### Backend Architecture - Clean Architecture Layers

```mermaid
graph TB
    subgraph "Presentation Layer"
        Controllers[Controllers]
        Routes[HTTP Routes]
        Middlewares[Middlewares]
        Validators[Validators]
    end

    subgraph "Application Layer"
        UseCases[Use Cases]
        DTOs[DTOs]
        Services[App Services]
    end

    subgraph "Domain Layer"
        Entities[Entities]
        ValueObjects[Value Objects]
        Interfaces[Repository Interfaces]
        Events[Domain Events]
    end

    subgraph "Infrastructure Layer"
        Repositories[Prisma Repositories]
        Cache[Redis Cache]
        Storage[S3 Storage]
        External[External APIs]
    end

    Controllers --> UseCases
    Routes --> Controllers
    Middlewares --> Routes
    Validators --> Controllers
    
    UseCases --> Entities
    UseCases --> Services
    UseCases --> Interfaces
    
    Entities --> ValueObjects
    Events --> Entities
    
    Repositories -.implements.-> Interfaces
    Cache -.implements.-> Interfaces
    Storage --> Services
    External --> Services
    
    UseCases --> Repositories

    style Domain Layer fill:#4a90e2,color:#fff
    style Application Layer fill:#50e3c2,color:#000
    style Presentation Layer fill:#f5a623,color:#fff
    style Infrastructure Layer fill:#7ed321,color:#fff
```

---

## 🔄 Flujo de Datos

### Publishing Flow - Post Publication

```mermaid
sequenceDiagram
    participant Admin as Admin User
    participant Frontend as Frontend
    participant API as Backend API
    participant DB as PostgreSQL
    participant N8N as n8n
    participant Medium as Medium API
    participant DevTo as Dev.to API
    participant Email as SendGrid

    Admin->>Frontend: Create post (ES)
    Frontend->>API: POST /api/posts
    API->>DB: Save post (status: draft)
    API-->>Frontend: Post created
    
    Admin->>Frontend: Create post (EN)
    Frontend->>API: POST /api/posts
    API->>DB: Save post (status: draft)
    API-->>Frontend: Post created
    
    Admin->>Frontend: Publish post (EN)
    Frontend->>API: PATCH /api/posts/:id/publish
    API->>DB: Update status to published
    API->>N8N: Webhook: post.published
    API-->>Frontend: Published
    
    N8N->>Medium: Create publication
    Medium-->>N8N: Success
    
    N8N->>DevTo: Create article
    DevTo-->>N8N: Success
    
    N8N->>Email: Send to newsletter queue
    Email-->>N8N: Queued
    
    N8N->>API: Update sync status
    API->>DB: Save sync metadata
```

### User Authentication Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Frontend as Frontend
    participant API as Backend API
    participant DB as PostgreSQL
    participant Redis as Redis Cache

    User->>Frontend: Login (email, password)
    Frontend->>API: POST /api/auth/login
    API->>DB: Find user by email
    DB-->>API: User data
    API->>API: Verify password hash
    API->>API: Generate JWT tokens
    API->>Redis: Store refresh token
    Redis-->>API: Stored
    API-->>Frontend: {accessToken, refreshToken}
    Frontend->>Frontend: Store tokens
    Frontend-->>User: Logged in
    
    User->>Frontend: Access protected route
    Frontend->>API: GET /api/posts (Auth header)
    API->>API: Verify access token
    API->>DB: Fetch posts
    DB-->>API: Posts data
    API-->>Frontend: Posts
    Frontend-->>User: Display content
```

### Premium Content Access Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Frontend as Frontend
    participant API as Backend API
    participant Stripe as Stripe
    participant DB as PostgreSQL
    participant N8N as n8n

    User->>Frontend: View premium post
    Frontend->>API: GET /api/posts/:slug
    API->>DB: Fetch post
    DB-->>API: Post (isPremium: true)
    API-->>Frontend: Post preview + paywall
    Frontend-->>User: Show preview + Buy button
    
    User->>Frontend: Click "Buy"
    Frontend->>API: GET /api/products/:id
    API->>DB: Fetch product
    DB-->>API: Product with payment link
    API-->>Frontend: Payment link
    Frontend->>Stripe: Redirect to checkout
    
    User->>Stripe: Complete payment
    Stripe->>API: Webhook: checkout.session.completed
    API->>DB: Create purchase record
    API->>DB: Grant access to content
    API->>N8N: Webhook: purchase.completed
    N8N->>N8N: Send confirmation email
    Stripe-->>Frontend: Redirect to success page
    
    Frontend->>API: GET /api/posts/:slug (with auth)
    API->>DB: Check user access
    DB-->>API: Has access
    API-->>Frontend: Full content
    Frontend-->>User: Display full post
```

---

## 📊 Modelo de Dominio

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Post : creates
    User ||--o{ Book : authors
    User ||--o{ Purchase : makes
    User ||--o{ Session : has
    
    Post ||--o{ PostTag : has
    Post }o--|| Category : belongs_to
    Post ||--o{ PostVersion : has_versions
    
    Book ||--o{ Chapter : contains
    Book ||--o{ Product : has
    
    Tag ||--o{ PostTag : used_in
    
    Product ||--o{ Purchase : sold_as
    
    User {
        string id PK
        string email UK
        string passwordHash
        string name
        string role
        string locale
        timestamp createdAt
    }
    
    Post {
        string id PK
        string slug
        string locale UK
        string title
        text content
        text contentHtml
        string status
        boolean isPremium
        string authorId FK
        timestamp publishedAt
    }
    
    Book {
        string id PK
        string slug
        string locale UK
        string title
        text description
        string status
        boolean isPremium
        string authorId FK
    }
    
    Chapter {
        string id PK
        string bookId FK
        string slug
        int order
        string title
        text content
        boolean isFree
    }
    
    Product {
        string id PK
        string name
        decimal price
        string currency
        string paymentLink
        string resourceType
        string resourceId
    }
    
    Purchase {
        string id PK
        string userId FK
        string productId FK
        decimal amount
        string status
        timestamp purchasedAt
    }
    
    Category {
        string id PK
        string slug UK
        string name
    }
    
    Tag {
        string id PK
        string slug UK
        string name
    }
```

### Domain Model - Core Entities

```mermaid
classDiagram
    class Post {
        +string id
        +Slug slug
        +Locale locale
        +string title
        +string content
        +ContentStatus status
        +boolean isPremium
        +publish()
        +unpublish()
        +archive()
        +canBePublished() bool
    }
    
    class Book {
        +string id
        +Slug slug
        +Locale locale
        +string title
        +ContentStatus status
        +Chapter[] chapters
        +addChapter(Chapter)
        +removeChapter(string)
        +reorderChapters()
        +publish()
    }
    
    class Chapter {
        +string id
        +string bookId
        +Slug slug
        +int order
        +string title
        +string content
        +boolean isFree
        +canAccess(User) bool
    }
    
    class User {
        +string id
        +Email email
        +string passwordHash
        +UserRole role
        +Locale locale
        +authenticate(string password) bool
        +hasRole(UserRole) bool
        +hasPurchased(Product) bool
    }
    
    class Product {
        +string id
        +string name
        +Money price
        +string paymentLink
        +ResourceType resourceType
        +string resourceId
        +isActive() bool
    }
    
    class Purchase {
        +string id
        +string userId
        +string productId
        +Money amount
        +PurchaseStatus status
        +complete()
        +refund()
        +isCompleted() bool
    }
    
    class Slug {
        <<ValueObject>>
        +string value
        +validate()
    }
    
    class Email {
        <<ValueObject>>
        +string value
        +validate()
    }
    
    class Locale {
        <<ValueObject>>
        +string value
        +isValid() bool
    }
    
    class Money {
        <<ValueObject>>
        +decimal amount
        +string currency
        +add(Money)
        +subtract(Money)
    }
    
    Post --> Slug
    Post --> Locale
    Book --> Slug
    Book --> Locale
    Book --> Chapter
    User --> Email
    User --> Locale
    Product --> Money
    Purchase --> Money
```

---

## 🤖 Workflows de Automatización

### Publishing Workflow (n8n)

```mermaid
flowchart TD
    Start([Webhook: post.published]) --> Validate{Validate<br/>Payload}
    
    Validate -->|Invalid| Error[Send Error<br/>Notification]
    Validate -->|Valid| Extract[Extract Data]
    
    Extract --> CheckLocale{Locale?}
    
    CheckLocale -->|EN| Medium[Sync to Medium]
    CheckLocale -->|EN| DevTo[Sync to Dev.to]
    CheckLocale -->|ES| SkipExternal[Skip External Sync]
    
    Medium --> MediumSuccess{Success?}
    MediumSuccess -->|Yes| LogMedium[Log Success]
    MediumSuccess -->|No| RetryMedium[Retry 3x]
    
    DevTo --> DevToSuccess{Success?}
    DevToSuccess -->|Yes| LogDevTo[Log Success]
    DevToSuccess -->|No| RetryDevTo[Retry 3x]
    
    LogMedium --> GenerateSocial[Generate Social<br/>Media Content]
    LogDevTo --> GenerateSocial
    SkipExternal --> GenerateSocial
    
    GenerateSocial --> StoreSocial[Store in Queue]
    StoreSocial --> Newsletter{Add to<br/>Newsletter?}
    
    Newsletter -->|Yes| AddQueue[Add to Newsletter Queue]
    Newsletter -->|No| UpdateBackend
    
    AddQueue --> UpdateBackend[Update Backend<br/>Sync Status]
    UpdateBackend --> Notify[Send Success<br/>Notification]
    
    Notify --> End([End])
    Error --> End

    style Start fill:#4ade80,color:#000
    style End fill:#f87171,color:#000
    style Medium fill:#000,color:#fff
    style DevTo fill:#000,color:#fff
```

### Newsletter Workflow (n8n)

```mermaid
flowchart TD
    Start([Cron: Monday 9 AM]) --> GetPostsES[Get Recent Posts<br/>Spanish]
    Start --> GetPostsEN[Get Recent Posts<br/>English]
    
    GetPostsES --> CheckES{Has Posts?}
    GetPostsEN --> CheckEN{Has Posts?}
    
    CheckES -->|No| SkipES[Skip Spanish]
    CheckES -->|Yes| GenerateES[Generate HTML<br/>Newsletter ES]
    
    CheckEN -->|No| SkipEN[Skip English]
    CheckEN -->|Yes| GenerateEN[Generate HTML<br/>Newsletter EN]
    
    GenerateES --> GetSubsES[Get Subscribers<br/>Spanish]
    GenerateEN --> GetSubsEN[Get Subscribers<br/>English]
    
    GetSubsES --> SendES[Send via SendGrid<br/>Batch 100]
    GetSubsEN --> SendEN[Send via SendGrid<br/>Batch 100]
    
    SendES --> LogES[Log Sent ES]
    SendEN --> LogEN[Log Sent EN]
    
    LogES --> Report[Generate Report]
    LogEN --> Report
    SkipES --> Report
    SkipEN --> Report
    
    Report --> Notify[Send Summary<br/>to Slack]
    Notify --> End([End])

    style Start fill:#4ade80,color:#000
    style End fill:#f87171,color:#000
    style SendES fill:#ea580c,color:#fff
    style SendEN fill:#ea580c,color:#fff
```

### Backup Workflow (n8n)

```mermaid
flowchart LR
    Start([Cron: Daily 2 AM]) --> ExportDB[Export PostgreSQL]
    Start --> ExportRedis[Export Redis]
    Start --> ExportN8N[Export n8n Workflows]
    
    ExportDB --> CompressDB[Compress .sql.gz]
    ExportRedis --> CompressRedis[Compress dump.rdb]
    ExportN8N --> CompressN8N[Compress .tar.gz]
    
    CompressDB --> UploadS3[Upload to S3]
    CompressRedis --> UploadS3
    CompressN8N --> UploadS3
    
    UploadS3 --> Verify{Verify Upload}
    
    Verify -->|Success| Cleanup[Cleanup Local<br/>Keep 7 days]
    Verify -->|Failed| Retry[Retry Upload]
    
    Retry --> Verify
    
    Cleanup --> Notify[Send Success<br/>Notification]
    Notify --> End([End])

    style Start fill:#4ade80,color:#000
    style End fill:#f87171,color:#000
    style UploadS3 fill:#ff9900,color:#000
```

---

## 🚀 Deployment Architecture

### Production Infrastructure

```mermaid
graph TB
    subgraph "Internet"
        Users[Users]
        DNS[DNS - Cloudflare]
    end

    subgraph "Edge Layer"
        CDN[CDN - Cloudflare]
        LB[Load Balancer]
    end

    subgraph "Application Servers"
        subgraph "Server 1"
            Nginx1[Nginx]
            Frontend1[Frontend Container]
            API1[API Container]
        end
        
        subgraph "Server 2"
            Nginx2[Nginx]
            Frontend2[Frontend Container]
            API2[API Container]
        end
    end

    subgraph "Data Tier"
        subgraph "Primary DB Server"
            PG_Primary[(PostgreSQL Primary)]
        end
        
        subgraph "Replica DB Server"
            PG_Replica[(PostgreSQL Replica)]
        end
        
        subgraph "Cache Server"
            Redis_Master[(Redis Master)]
            Redis_Slave[(Redis Slave)]
        end
    end

    subgraph "Storage & Services"
        S3[S3 Storage]
        N8N_Server[n8n Server]
        Backup[Backup Server]
    end

    subgraph "Monitoring"
        Prometheus[Prometheus]
        Grafana[Grafana]
        Logs[Loki Logs]
    end

    Users --> DNS
    DNS --> CDN
    CDN --> LB
    LB --> Nginx1
    LB --> Nginx2
    
    Nginx1 --> Frontend1
    Nginx1 --> API1
    Nginx2 --> Frontend2
    Nginx2 --> API2
    
    API1 --> PG_Primary
    API2 --> PG_Primary
    API1 --> Redis_Master
    API2 --> Redis_Master
    
    PG_Primary -.replicate.-> PG_Replica
    Redis_Master -.replicate.-> Redis_Slave
    
    API1 --> S3
    API2 --> S3
    N8N_Server --> API1
    N8N_Server --> S3
    
    Backup -.backup.-> PG_Primary
    Backup -.backup.-> Redis_Master
    
    Prometheus --> API1
    Prometheus --> API2
    Grafana --> Prometheus
    Logs --> API1
    Logs --> API2

    style CDN fill:#f97316,color:#fff
    style PG_Primary fill:#336791,color:#fff
    style Redis_Master fill:#dc382d,color:#fff
```

### Docker Compose Services

```mermaid
graph LR
    subgraph "Docker Compose Stack"
        Frontend[frontend:3000]
        API[api:3001]
        Postgres[postgres:5432]
        Redis[redis:6379]
        N8N[n8n:5678]
        MinIO[minio:9000/9001]
        Nginx[nginx:80/443]
        
        Frontend -.depends.-> API
        API -.depends.-> Postgres
        API -.depends.-> Redis
        N8N -.depends.-> Postgres
        N8N -.depends.-> Redis
        Nginx -.proxy.-> Frontend
        Nginx -.proxy.-> API
        Nginx -.proxy.-> N8N
        API --> MinIO
    end

    style Frontend fill:#0070f3,color:#fff
    style API fill:#68a063,color:#fff
    style Postgres fill:#336791,color:#fff
    style Redis fill:#dc382d,color:#fff
    style N8N fill:#ff6d5a,color:#fff
```

---

## 📱 Secuencia de Casos de Uso

### Use Case: User Registration

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant Validator
    participant UserService
    participant Database
    participant EmailService

    User->>Frontend: Fill registration form
    User->>Frontend: Submit
    Frontend->>Frontend: Client-side validation
    Frontend->>API: POST /api/auth/register
    API->>Validator: Validate request data
    
    alt Invalid data
        Validator-->>API: Validation errors
        API-->>Frontend: 400 Bad Request
        Frontend-->>User: Show errors
    else Valid data
        Validator-->>API: Valid
        API->>UserService: Create user
        UserService->>Database: Check if email exists
        
        alt Email exists
            Database-->>UserService: User found
            UserService-->>API: Email already exists
            API-->>Frontend: 409 Conflict
            Frontend-->>User: Email taken
        else Email available
            Database-->>UserService: Not found
            UserService->>UserService: Hash password
            UserService->>Database: Save user
            Database-->>UserService: User created
            UserService->>EmailService: Send welcome email
            UserService-->>API: Success + tokens
            API-->>Frontend: 201 Created + tokens
            Frontend->>Frontend: Store tokens
            Frontend-->>User: Redirect to dashboard
        end
    end
```

### Use Case: Create and Publish Post

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend
    participant API
    participant MarkdownProcessor
    participant Database
    participant CacheService
    participant N8N

    Admin->>Frontend: Write post in Markdown
    Admin->>Frontend: Click "Save Draft"
    Frontend->>API: POST /api/posts
    
    API->>MarkdownProcessor: Process Markdown
    MarkdownProcessor->>MarkdownProcessor: Convert to HTML
    MarkdownProcessor->>MarkdownProcessor: Calculate reading time
    MarkdownProcessor->>MarkdownProcessor: Extract headings
    MarkdownProcessor-->>API: Processed content
    
    API->>Database: Save post (status: draft)
    Database-->>API: Post saved
    API-->>Frontend: Post created
    Frontend-->>Admin: Saved as draft
    
    Admin->>Frontend: Click "Publish"
    Frontend->>API: PATCH /api/posts/:id/publish
    
    API->>Database: Update status to published
    API->>Database: Set publishedAt timestamp
    Database-->>API: Updated
    
    API->>CacheService: Invalidate post cache
    CacheService-->>API: Cache cleared
    
    API->>N8N: POST /webhook/post-published
    N8N-->>API: Webhook received
    
    API-->>Frontend: Published successfully
    Frontend-->>Admin: Post is live!
    
    N8N->>N8N: Execute publishing workflow
```

### Use Case: Access Premium Content

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant Database
    participant Stripe
    participant EmailService

    User->>Frontend: Browse to premium post
    Frontend->>API: GET /api/posts/:slug
    API->>Database: Fetch post
    Database-->>API: Post (isPremium: true)
    
    alt User not authenticated
        API-->>Frontend: Post preview only
        Frontend-->>User: Show preview + Login prompt
    else User authenticated
        API->>Database: Check user purchases
        
        alt User has purchased
            Database-->>API: Purchase found
            API-->>Frontend: Full content
            Frontend-->>User: Display full post
        else User hasn't purchased
            Database-->>API: No purchase
            API->>Database: Get product info
            Database-->>API: Product + price
            API-->>Frontend: Preview + purchase option
            Frontend-->>User: Show preview + Buy button
            
            User->>Frontend: Click "Buy Now"
            Frontend->>Stripe: Create checkout session
            Stripe-->>Frontend: Session URL
            Frontend->>User: Redirect to Stripe
            
            User->>Stripe: Complete payment
            Stripe->>API: Webhook: payment.success
            API->>Database: Create purchase record
            API->>Database: Grant access
            API->>EmailService: Send receipt
            Stripe-->>User: Redirect to success page
            
            User->>Frontend: Return to post
            Frontend->>API: GET /api/posts/:slug
            API->>Database: Check purchases
            Database-->>API: Purchase found
            API-->>Frontend: Full content
            Frontend-->>User: Display full post
        end
    end
```

---

## 🔄 State Machine Diagrams

### Post Status State Machine

```mermaid
stateDiagram-v2
    [*] --> Draft: Create post
    
    Draft --> Ready: Mark as ready
    Ready --> Draft: Revert to draft
    
    Ready --> Published: Publish
    Published --> Published: Update content
    
    Published --> Archived: Archive
    Archived --> Published: Restore
    
    Draft --> [*]: Delete
    Archived --> [*]: Delete permanently
    
    note right of Draft
        Author working on content
        Not visible to public
    end note
    
    note right of Published
        Live content
        Visible to users
        Can sync to external platforms
    end note
```

### Purchase Status State Machine

```mermaid
stateDiagram-v2
    [*] --> Pending: Initiate purchase
    
    Pending --> Completed: Payment successful
    Pending --> Failed: Payment failed
    
    Failed --> Pending: Retry payment
    Failed --> [*]: Cancel
    
    Completed --> Refunded: Process refund
    Refunded --> [*]: Finalize
    
    Completed --> [*]: Access granted
    
    note right of Completed
        User has access
        Send confirmation email
        Grant content access
    end note
```

---

## 📊 System Metrics Dashboard

### Key Metrics Overview

```mermaid
graph TB
    subgraph "Performance Metrics"
        TTFB[TTFB < 200ms]
        LCP[LCP < 2.5s]
        FID[FID < 100ms]
    end
    
    subgraph "API Metrics"
        Response[Response Time p95 < 500ms]
        ErrorRate[Error Rate < 0.1%]
        Throughput[Requests/sec]
    end
    
    subgraph "Database Metrics"
        DBConn[Active Connections]
        QueryTime[Query Time p95]
        CacheHit[Cache Hit Rate > 90%]
    end
    
    subgraph "Business Metrics"
        Posts[Total Posts]
        Users[Active Users]
        Conversions[Premium Conversions]
    end

    style TTFB fill:#10b981,color:#fff
    style LCP fill:#10b981,color:#fff
    style FID fill:#10b981,color:#fff
    style Response fill:#3b82f6,color:#fff
    style CacheHit fill:#8b5cf6,color:#fff
```

---

## 🎨 UI/UX Flow

### User Journey - Reading a Blog Post

```mermaid
journey
    title User Reading Journey
    section Discovery
      Search on Google: 5: User
      Click result: 5: User
      Land on blog post: 5: User, Frontend
    section Reading
      Load post content: 4: Frontend, API
      Read article: 5: User
      View code examples: 4: User
      Scroll through: 5: User
    section Engagement
      Like the post: 4: User, API
      Share on social: 3: User
      Subscribe to newsletter: 5: User, API
    section Conversion
      See premium content teaser: 4: User
      Click "Buy": 5: User
      Complete purchase: 4: User, Stripe
      Access full content: 5: User, API
```

---

**Nota:** Estos diagramas pueden ser renderizados en cualquier herramienta compatible con Mermaid (GitHub, GitLab, VS Code con extensión Mermaid, etc.)

**Para editar:** Copia el código Mermaid en [Mermaid Live Editor](https://mermaid.live/)
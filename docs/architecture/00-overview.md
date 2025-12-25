# Arquitectura Técnica - Stories of Software
## Plataforma Editorial Moderna para Ingeniería de Software

**Versión:** 1.0  
**Fecha:** 2025  
**Estado:** Diseño Arquitectónico

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Principios de Diseño](#principios-de-diseño)
3. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
4. [Stack Tecnológico](#stack-tecnológico)
5. [Componentes Principales](#componentes-principales)
6. [Flujos de Datos](#flujos-de-datos)
7. [Decisiones Arquitectónicas](#decisiones-arquitectónicas)

---

## 🎯 Visión General

Stories of Software es una plataforma editorial moderna diseñada para publicar, distribuir y monetizar contenido técnico sobre ingeniería de software. La arquitectura está diseñada con tres pilares fundamentales:

### Objetivos Principales

1. **Write Once, Publish Everywhere**: Escribir contenido una sola vez en Markdown y distribuirlo automáticamente a múltiples canales
2. **Multilenguaje Nativo**: Soporte completo para español e inglés desde el núcleo
3. **Automatización Máxima**: Reducir intervención manual mediante flujos automatizados
4. **Monetización Digital**: Venta de contenido premium y productos digitales
5. **Escalabilidad**: Desde blog personal hasta plataforma editorial completa

### Casos de Uso Principales

- Publicación de artículos técnicos bilingües
- Gestión de libros digitales por capítulos
- Distribución automatizada a newsletters
- Sincronización con plataformas externas (Medium, Dev.to, Hashnode)
- Venta de contenido premium
- Generación automática de versiones derivadas (resúmenes, extractos)

---

## 🏛️ Principios de Diseño

### 1. Separation of Concerns
- Frontend solo consume APIs
- Backend no conoce detalles de presentación
- Automatización orquesta pero no almacena estado crítico

### 2. API-First
- Toda funcionalidad expuesta vía API REST/GraphQL
- Contratos claros y versionados
- Documentación automática

### 3. Content as Code
- Markdown como formato fuente
- Versionamiento en Git
- Transformaciones programáticas

### 4. i18n by Design
- No traducción como post-proceso
- Contenido localizado desde origen
- Fallback inteligente de idiomas

### 5. Automation by Default
- Flujos declarativos en n8n
- Webhooks para eventos
- Cron jobs para tareas recurrentes

### 6. Security First
- Autenticación JWT
- RBAC (Role-Based Access Control)
- Separación público/premium
- Rate limiting

### 7. Cloud Native
- Contenedores Docker
- Stateless services
- Horizontal scaling ready
- Infrastructure as Code

---

## 🏗️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                         USUARIOS                             │
│  (Lectores, Suscriptores, Administradores)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │     i18n     │  │   UI/UX      │      │
│  │   SSR/SSG    │  │   routing    │  │  Components  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/REST/GraphQL
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                       API GATEWAY                            │
│          (Rate Limiting, Auth, Routing)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Content    │ │    User      │ │   Payment    │
│   Service    │ │   Service    │ │   Service    │
│              │ │              │ │              │
│ - Posts      │ │ - Auth       │ │ - Products   │
│ - Books      │ │ - Profiles   │ │ - Access     │
│ - i18n       │ │ - RBAC       │ │ - Links      │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │     S3/      │  │    Redis     │      │
│  │   (Metadata) │  │  Blob Storage│  │    (Cache)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  AUTOMATION LAYER (n8n)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Publishing Workflows  │  Newsletter  │  Sync Flows  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│  [Medium] [Dev.to] [Hashnode] [Stripe] [SendGrid]          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **i18n**: next-intl
- **State Management**: React Query + Zustand
- **Forms**: React Hook Form + Zod
- **Markdown**: react-markdown + remark/rehype
- **SEO**: Next.js Metadata API

### Backend
- **Runtime**: Node.js 20+ LTS
- **Framework**: Fastify / Express
- **Language**: TypeScript
- **API**: REST + GraphQL (Apollo Server)
- **ORM**: Prisma / Drizzle
- **Validation**: Zod
- **Authentication**: better-auth (con soporte para OAuth, email/password, sesiones)
- **File Processing**: unified (remark/rehype)
- **Queue**: BullMQ + Redis

### Database & Storage
- **Primary DB**: PostgreSQL 16+
- **Cache**: Redis 7+
- **File Storage**: S3-compatible (AWS S3 / MinIO)
- **Search**: PostgreSQL Full-Text Search / Typesense

### Automation
- **Platform**: n8n (self-hosted)
- **Triggers**: Webhooks, Cron, Events
- **Integrations**: HTTP Requests, API calls

### Infrastructure
- **Containers**: Docker + Docker Compose
- **Orchestration**: Kubernetes (optional, para escala)
- **Proxy**: Nginx / Caddy
- **Monitoring**: Prometheus + Grafana
- **Logs**: Loki / ELK Stack
- **CI/CD**: GitHub Actions

### External Services
- **Payment**: Stripe / Lemon Squeezy
- **Email**: SendGrid / Resend
- **Analytics**: Plausible / Umami
- **CDN**: Cloudflare

---

## 🧩 Componentes Principales

### 1. Frontend Application (Next.js)
**Responsabilidad**: Presentación, UX, SEO, SSR/SSG

**Características**:
- Server-Side Rendering para SEO
- Static Generation para contenido estático
- Routing multilenguaje (`/en/blog`, `/es/blog`)
- Páginas públicas y protegidas
- Formularios de suscripción
- Preview de contenido premium
- Sistema de temas (light/dark)

**Páginas principales**:
- Home (`/`, `/es`)
- Blog (`/blog`, `/es/blog`)
- Libros (`/books`, `/es/libros`)
- Newsletter (`/newsletter`, `/es/newsletter`)
- About (`/about`, `/es/acerca`)
- Admin Dashboard (`/admin/*`)

### 2. Content Service (Backend)
**Responsabilidad**: Gestión de contenido técnico

**Funcionalidades**:
- CRUD de contenido en Markdown
- Versionamiento de contenido
- Gestión de estados (draft, ready, published, premium)
- Sistema de taxonomías (tags, categories)
- Búsqueda full-text
- Transformación Markdown → HTML
- Generación de excerpts
- Gestión de assets (imágenes, diagramas)

**Modelos principales**:
- `Post`: artículos de blog
- `Book`: libros digitales
- `Chapter`: capítulos de libros
- `ContentVersion`: versiones históricas
- `Tag`, `Category`: taxonomías

### 3. User Service (Backend)
**Responsabilidad**: Autenticación, autorización, perfiles

**Funcionalidades**:
- Registro y login
- JWT + Refresh tokens
- RBAC (roles: admin, editor, subscriber, reader)
- Gestión de perfiles
- Preferencias de usuario (idioma, tema)
- Historial de lectura
- Suscripciones

### 4. Payment Service (Backend)
**Responsabilidad**: Monetización y acceso premium

**Funcionalidades**:
- Gestión de productos digitales
- Links de pago
- Verificación de compras
- Control de acceso a contenido premium
- Webhooks de pagos
- Gestión de precios por país/moneda

### 5. Automation Engine (n8n)
**Responsabilidad**: Orquestación de flujos automatizados

**Workflows principales**:
- **Publishing Flow**: Publicar contenido multicanal
- **Newsletter Flow**: Generar y enviar newsletters
- **Sync Flow**: Sincronizar con plataformas externas
- **Backup Flow**: Respaldos automáticos
- **Analytics Flow**: Recopilación de métricas

---

## 🔄 Flujos de Datos

### Flujo 1: Publicación de Artículo

```
1. Admin escribe artículo en Markdown (ES + EN)
2. Admin sube vía API o Git → Content Service
3. Content Service:
   - Valida formato
   - Procesa Markdown
   - Genera metadata
   - Almacena en DB + S3
   - Estado: draft
4. Admin cambia estado a "published"
5. Content Service emite evento: "post.published"
6. n8n detecta evento via webhook
7. n8n ejecuta workflow:
   - Publica en web (frontend)
   - Genera versión newsletter (ES + EN)
   - Sincroniza con Medium (EN)
   - Sincroniza con Dev.to (EN)
   - Envía notificación a suscriptores
8. Frontend regenera páginas estáticas (ISR)
```

### Flujo 2: Acceso a Contenido Premium

```
1. Usuario navega a artículo premium
2. Frontend muestra preview + CTA de compra
3. Usuario hace clic en "Comprar"
4. Frontend redirige a link de pago (Stripe)
5. Usuario completa pago en Stripe
6. Stripe envía webhook a Payment Service
7. Payment Service:
   - Valida webhook
   - Crea registro de compra
   - Otorga acceso al usuario
   - Emite evento "purchase.completed"
8. Usuario es redirigido de vuelta
9. Frontend verifica acceso vía API
10. Frontend muestra contenido completo
```

### Flujo 3: Newsletter Automatizado

```
1. Cron job en n8n se ejecuta (ej: cada lunes)
2. n8n consulta Content Service:
   - Obtiene artículos publicados última semana (ES + EN)
3. n8n genera newsletter:
   - Template HTML (ES + EN)
   - Resúmenes de artículos
   - Links de lectura
4. n8n obtiene suscriptores de User Service
5. n8n envía via SendGrid:
   - Versión ES a suscriptores ES
   - Versión EN a suscriptores EN
6. n8n registra métricas de envío
```

---

## 🎯 Decisiones Arquitectónicas

### ADR-001: Next.js con App Router
**Decisión**: Usar Next.js 16+ con App Router sobre otras alternativas

**Contexto**: Necesitamos SSR/SSG, buen SEO, soporte i18n, y developer experience

**Alternativas consideradas**: 
- Astro (descartado: menos dinámico)
- Remix (descartado: menos maduro en i18n)
- Gatsby (descartado: complejo para contenido dinámico)

**Consecuencias**:
- ✅ Excelente SEO out-of-the-box
- ✅ ISR para contenido dinámico
- ✅ Ecosistema maduro
- ⚠️ Vendor lock-in con Vercel (mitigable)

### ADR-002: PostgreSQL como base de datos principal
**Decisión**: PostgreSQL sobre MongoDB/DynamoDB

**Contexto**: Necesitamos relaciones complejas, transacciones, full-text search

**Razones**:
- Relaciones entre posts, books, chapters, users
- ACID compliance para pagos
- Full-text search nativo
- JSON support para metadata flexible

### ADR-003: n8n para automatización
**Decisión**: n8n self-hosted sobre Zapier/Make

**Contexto**: Necesitamos automatización sin límites, self-hosted, open source

**Razones**:
- Self-hosted: control total, sin límites
- Visual workflows: fácil mantenimiento
- Extensible: custom nodes
- API completa: integración programática

### ADR-004: Markdown como formato fuente
**Decisión**: Markdown + frontmatter sobre CMS headless

**Contexto**: Contenido técnico con code snippets, control total

**Razones**:
- Git-friendly: versionamiento nativo
- Developer-friendly: sintaxis familiar
- Portable: no vendor lock-in
- Extensible: remark/rehype plugins

### ADR-005: Monorepo con servicios separados
**Decisión**: Monorepo con servicios independientes deployables

**Contexto**: Balance entre modularidad y simplicidad

**Estructura**:
```
/apps
  /frontend     (Next.js)
  /api          (Backend)
  /automation   (n8n configs)
/packages
  /shared       (Types, utils)
  /ui           (Component library)
  /markdown     (Markdown processing)
```

### ADR-006: i18n en dos niveles
**Decisión**: i18n en contenido Y en interfaz

**Implementación**:
- **Contenido**: Almacenado por locale en DB
- **Interfaz**: next-intl para UI translations
- **Routing**: `/[locale]/...` pattern
- **Fallback**: EN como idioma por defecto

---

## 📊 Métricas de Éxito

### Performance
- Time to First Byte (TTFB) < 200ms
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1
- First Input Delay (FID) < 100ms

### Availability
- Uptime 99.9%
- API response time p95 < 500ms
- Error rate < 0.1%

### Scalability
- Soportar 10K usuarios concurrentes
- 1M pageviews/mes
- 100K artículos en DB

### Automation
- 95% de publicaciones automatizadas
- 0 intervenciones manuales en distribución
- Recovery automático de errores

---

## 🔮 Roadmap Técnico

### Fase 1: MVP (Meses 1-3)
- ✅ Frontend básico con Next.js
- ✅ Content API con PostgreSQL
- ✅ i18n básico (ES/EN)
- ✅ Publicación manual
- ✅ Blog público

### Fase 2: Automatización (Meses 4-6)
- 🔲 Integración n8n
- 🔲 Workflows de publicación
- 🔲 Newsletter automatizado
- 🔲 Sincronización externa

### Fase 3: Monetización (Meses 7-9)
- 🔲 Payment Service
- 🔲 Contenido premium
- 🔲 Gestión de productos
- 🔲 Dashboard de ventas

### Fase 4: Escala (Meses 10-12)
- 🔲 Kubernetes deployment
- 🔲 CDN global
- 🔲 Edge functions
- 🔲 Analytics avanzado

---

## 📚 Referencias

- [Next.js Documentation](https://nextjs.org/docs)
- [n8n Documentation](https://docs.n8n.io)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- [12-Factor App](https://12factor.net)
- [API Design Guidelines](https://github.com/microsoft/api-guidelines)

---

**Próximos documentos**:
- `01-frontend-architecture.md`: Detalle de arquitectura frontend
- `02-backend-architecture.md`: Detalle de arquitectura backend
- `03-data-model.md`: Modelo de datos completo
- `04-api-design.md`: Especificación de APIs
- `05-automation-workflows.md`: Flujos de n8n
- `06-deployment-infrastructure.md`: Infraestructura y deployment
- `07-security.md`: Seguridad y autenticación
- `08-i18n-strategy.md`: Estrategia de internacionalización

# Arquitectura Técnica - Stories of Software
## Plataforma Editorial Moderna para Ingeniería de Software

**Versión:** 1.0  
**Última actualización:** 2025  
**Estado:** Documentación de Diseño Arquitectónico

---

## 📚 Índice de Documentación

Esta carpeta contiene la documentación completa de la arquitectura técnica de Stories of Software, una plataforma editorial bilingüe (ES/EN) diseñada para publicación automatizada de contenido técnico y venta de productos digitales.

### Documentos Principales

| # | Documento | Descripción | Estado |
|---|-----------|-------------|--------|
| 00 | [**Overview**](./00-overview.md) | Visión general, principios de diseño, stack tecnológico y decisiones arquitectónicas | ✅ Completo |
| 01 | [**Frontend Architecture**](./01-frontend-architecture.md) | Next.js App Router, componentes, routing, i18n, rendering strategies | ✅ Completo |
| 02 | [**Backend Architecture**](./02-backend-architecture.md) | Clean Architecture, API REST, servicios, autenticación, procesamiento Markdown | ✅ Completo |
| 03 | **Data Model** | Modelo de datos completo con diagramas ER | 🚧 Pendiente |
| 04 | **API Design** | Especificación detallada de endpoints REST y GraphQL | 🚧 Pendiente |
| 05 | [**Automation Workflows**](./05-automation-workflows.md) | n8n workflows, integraciones, transformaciones, error handling | ✅ Completo |
| 06 | [**Deployment & Infrastructure**](./06-deployment-infrastructure.md) | Docker, CI/CD, monitoring, backup, scaling | ✅ Completo |
| 07 | [**Authentication - better-auth**](./07-authentication-better-auth.md) | Guía completa de autenticación con better-auth, OAuth, RBAC, sesiones | ✅ Completo |
| 08 | [**i18n Strategy**](./08-i18n-strategy.md) | Estrategia completa de internacionalización español/inglés | ✅ Completo |

---

## 🎯 Quick Start

### Para Desarrolladores

**Leer primero:**
1. [`00-overview.md`](./00-overview.md) - Entender la visión general
2. [`01-frontend-architecture.md`](./01-frontend-architecture.md) - Si trabajas en frontend
3. [`02-backend-architecture.md`](./02-backend-architecture.md) - Si trabajas en backend

**Para implementación:**
4. [`08-i18n-strategy.md`](./08-i18n-strategy.md) - Estrategia multilenguaje
5. [`05-automation-workflows.md`](./05-automation-workflows.md) - Flujos automatizados
6. [`06-deployment-infrastructure.md`](./06-deployment-infrastructure.md) - Deploy y DevOps

### Para Product Managers

1. [`00-overview.md`](./00-overview.md) - Casos de uso y objetivos
2. [`05-automation-workflows.md`](./05-automation-workflows.md) - Flujos de publicación
3. [`08-i18n-strategy.md`](./08-i18n-strategy.md) - Gestión de contenido bilingüe

### Para DevOps

1. [`06-deployment-infrastructure.md`](./06-deployment-infrastructure.md) - Todo sobre infraestructura
2. [`00-overview.md`](./00-overview.md) - Arquitectura general
3. [`02-backend-architecture.md`](./02-backend-architecture.md) - Servicios backend

---

## 🏗️ Arquitectura en Capas

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│              Next.js 16 + React + TypeScript                 │
│              SSR/SSG + i18n + SEO Optimization               │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API / GraphQL
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API                             │
│           Node.js + Fastify + Clean Architecture             │
│           Content | User | Payment Services                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                ┌────────┴────────┐
                │                 │
        ┌───────▼──────┐  ┌──────▼───────┐
        │  PostgreSQL  │  │    Redis     │
        │   (Prisma)   │  │   (Cache)    │
        └──────────────┘  └──────────────┘
                │
        ┌───────▼──────┐
        │  S3 Storage  │
        │  (MinIO/AWS) │
        └──────────────┘
                         ▲
                         │ Webhooks & API
                         │
┌─────────────────────────────────────────────────────────────┐
│                   AUTOMATION LAYER                           │
│                  n8n Workflow Engine                         │
│    Publishing | Newsletter | Sync | Backup Workflows        │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                           │
│  Medium | Dev.to | Hashnode | Stripe | SendGrid             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Principales Características

### 1. Write Once, Publish Everywhere
- Contenido en Markdown
- Distribución automática a múltiples canales
- Sincronización con plataformas externas (Medium, Dev.to)

### 2. Multilenguaje Nativo (ES/EN)
- i18n desde el diseño
- URLs limpias por idioma
- SEO optimizado con hreflang
- Sin traducción automática

### 3. Automatización Completa
- Workflows de publicación vía n8n
- Newsletter automático semanal
- Generación de versiones derivadas
- Backups automatizados

### 4. Monetización Digital
- Contenido público y premium
- Integración con Stripe/Lemon Squeezy
- Links de pago externos
- Control de acceso granular

### 5. Gestión de Libros
- Libros estructurados por capítulos
- Publicación progresiva
- Notificaciones a compradores

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui + Radix UI
- **i18n:** next-intl
- **State:** React Query + Zustand

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Fastify
- **Language:** TypeScript
- **Database:** PostgreSQL 16 + Prisma
- **Cache:** Redis 7
- **Storage:** S3-compatible (MinIO/AWS)

### Automation
- **Platform:** n8n (self-hosted)
- **Triggers:** Webhooks, Cron, Events

### Infrastructure
- **Containers:** Docker + Docker Compose
- **Proxy:** Nginx + Let's Encrypt
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana

---

## 📋 Requerimientos Funcionales

### Gestión de Contenido
- ✅ Escritura en Markdown
- ✅ Estados: draft, ready, published, premium
- ✅ Versionamiento de contenido
- ✅ Taxonomías (tags, categorías)
- ✅ Búsqueda full-text

### Multilenguaje
- ✅ Soporte ES/EN nativo
- ✅ Detección automática de idioma
- ✅ Cambio manual de idioma
- ✅ Contenido localizado por idioma
- ✅ Fallback inteligente

### Automatización
- ✅ Publicación automática multicanal
- ✅ Newsletter semanal
- ✅ Sincronización externa
- ✅ Generación de extractos
- ✅ Notificaciones

### Monetización
- ✅ Contenido público/premium
- ✅ Productos digitales
- ✅ Links de pago
- ✅ Control de acceso
- ✅ Webhooks de pago

---

## 🎯 Objetivos No Funcionales

### Performance
- **TTFB:** < 200ms
- **LCP:** < 2.5s
- **CLS:** < 0.1
- **FID:** < 100ms

### Availability
- **Uptime:** 99.9%
- **API Response (p95):** < 500ms
- **Error Rate:** < 0.1%

### Scalability
- **Usuarios concurrentes:** 10K
- **Pageviews/mes:** 1M
- **Artículos en BD:** 100K

### Automation
- **Publicaciones automatizadas:** 95%
- **Intervención manual:** 0
- **Recovery automático:** Sí

---

## 🗺️ Roadmap

### ✅ Fase 1: MVP (Meses 1-3)
- Frontend básico con Next.js
- Content API con PostgreSQL
- i18n básico (ES/EN)
- Blog público
- Publicación manual

### 🔄 Fase 2: Automatización (Meses 4-6)
- Integración n8n
- Workflows de publicación
- Newsletter automatizado
- Sincronización externa

### 📅 Fase 3: Monetización (Meses 7-9)
- Payment Service
- Contenido premium
- Gestión de productos
- Dashboard de ventas

### 🚀 Fase 4: Escala (Meses 10-12)
- Kubernetes deployment
- CDN global
- Edge functions
- Analytics avanzado

---

## 🔐 Principios de Seguridad

- **Autenticación:** better-auth (con soporte OAuth, email/password, magic links)
- **Autorización:** RBAC (Admin, Editor, Subscriber, Reader)
- **API Security:** Rate limiting, CORS, Helmet
- **Data Protection:** Encrypted at rest and in transit
- **Webhooks:** HMAC signature validation
- **Secrets Management:** Environment variables + Vault

---

## 📊 Métricas Clave

### Contenido
- Total de posts publicados
- Posts por idioma
- Cobertura de traducción
- Posts premium vs públicos

### Usuarios
- Usuarios registrados
- Suscriptores newsletter
- Compradores de contenido premium
- Usuarios activos mensuales

### Automatización
- Workflows ejecutados
- Tasa de éxito de workflows
- Emails enviados
- Sincronizaciones exitosas

### Performance
- Response time API
- Page load time
- Cache hit rate
- Database query performance

---

## 🤝 Contribuir

### Para agregar nueva documentación:

1. Sigue la estructura existente
2. Usa Markdown con sintaxis consistente
3. Incluye diagramas cuando sea apropiado
4. Actualiza este README si agregas nuevos documentos

### Nomenclatura de archivos:

```
NN-nombre-descriptivo.md

NN = Número secuencial (00-99)
nombre-descriptivo = kebab-case
```

---

## 📚 Referencias Externas

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### Backend
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Automation
- [n8n Documentation](https://docs.n8n.io)
- [n8n Workflows](https://docs.n8n.io/workflows/)

### i18n
- [next-intl Documentation](https://next-intl-docs.vercel.app)
- [W3C i18n Best Practices](https://www.w3.org/International/quicktips/)

### DevOps
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [Redis Best Practices](https://redis.io/docs/management/optimization/)

---

## 📞 Contacto

Para preguntas sobre la arquitectura:
- **Email:** architecture@storiesofsoftware.com
- **Slack:** #architecture channel
- **GitHub Issues:** Para reportar problemas en la documentación

---

## 📄 Licencia

Esta documentación es propiedad de Stories of Software.
Todos los derechos reservados © 2025

---

**Última actualización:** 2025  
**Mantenido por:** Equipo de Arquitectura

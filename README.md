# Stories of Software 📚

> Una plataforma editorial moderna bilingüe (ES/EN) para publicación automatizada de contenido técnico sobre ingeniería de software y venta de productos digitales.

[![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/license-Proprietary-red?style=flat-square)](./LICENSE)

---

## 🎯 Visión General

Stories of Software es una plataforma editorial que permite:

- ✍️ **Escribir una vez, publicar en todas partes**: Contenido en Markdown que se distribuye automáticamente a web, blog, newsletter y plataformas externas
- 🌍 **Multilenguaje nativo**: Soporte completo para español e inglés desde el diseño
- 🤖 **Automatización total**: Flujos de publicación, newsletters y sincronización sin intervención manual
- 💰 **Monetización digital**: Contenido premium, libros digitales y productos con integración de pagos
- 📖 **Gestión de libros**: Estructura por capítulos con publicación progresiva

---

## 🚀 Quick Start

```bash
# Clonar el repositorio
git clone https://github.com/yourusername/storiesofsoftware.git
cd storiesofsoftware

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local

# Levantar infraestructura (PostgreSQL, Redis, MinIO)
docker-compose up -d postgres redis minio

# Ejecutar migraciones
cd apps/api
npx prisma migrate dev

# Iniciar desarrollo
# Terminal 1 - Backend
pnpm run dev:api

# Terminal 2 - Frontend
pnpm run dev:frontend
```

**📖 Para instrucciones detalladas, ver [Quick Start Guide](./docs/QUICKSTART.md)**

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                      │
│              React + TypeScript + Tailwind CSS               │
│              SSR/SSG + i18n + SEO Optimizado                 │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API / GraphQL
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API (Node.js)                      │
│         Fastify + Clean Architecture + TypeScript            │
│         Content | User | Payment Services                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                ┌────────┴────────┐
                ▼                 ▼
        ┌──────────────┐  ┌──────────────┐
        │  PostgreSQL  │  │    Redis     │
        │    Prisma    │  │    Cache     │
        └──────────────┘  └──────────────┘
                         ▲
                         │ Webhooks
                         │
┌─────────────────────────────────────────────────────────────┐
│                 AUTOMATION (n8n)                             │
│    Publishing | Newsletter | Sync | Backup Workflows        │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                               │
│  Medium | Dev.to | Hashnode | Stripe | SendGrid             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
storiesofsoftware/
├── apps/
│   ├── frontend/              # Next.js Application
│   │   ├── app/               # App Router (Next.js 16+)
│   │   ├── components/        # React Components
│   │   ├── lib/               # Utilities & Helpers
│   │   └── public/            # Static Assets & Locales
│   │
│   ├── api/                   # Backend API
│   │   ├── src/
│   │   │   ├── domain/        # Domain Layer (Entities, VOs)
│   │   │   ├── application/   # Application Layer (Use Cases)
│   │   │   ├── infrastructure/# Infrastructure Layer (DB, Cache)
│   │   │   └── presentation/  # Presentation Layer (HTTP)
│   │   └── prisma/            # Database Schema & Migrations
│   │
│   └── automation/            # n8n Workflows & Configs
│
├── docker/                    # Docker Configurations
├── docs/                      # Documentation
│   ├── architecture/          # Technical Architecture Docs
│   └── QUICKSTART.md         # Quick Start Guide
│
└── scripts/                   # Utility Scripts
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

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL 16 + Prisma ORM
- **Cache**: Redis 7
- **Storage**: S3-compatible (MinIO/AWS)
- **Queue**: BullMQ

### Automation
- **Platform**: n8n (self-hosted)
- **Triggers**: Webhooks, Cron, Event-driven

### Infrastructure
- **Containers**: Docker + Docker Compose
- **Reverse Proxy**: Nginx + Let's Encrypt
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Cloud**: AWS / DigitalOcean / Vercel

---

## ✨ Características Principales

### 🌐 Multilenguaje Nativo (ES/EN)
- URLs limpias por idioma (`/blog/post` vs `/en/blog/post`)
- Detección automática de idioma
- SEO optimizado con hreflang tags
- Sin traducción automática - contenido nativo

### 📝 Gestión de Contenido
- Escritura en Markdown con frontmatter
- Estados: draft, ready, published, premium
- Versionamiento de contenido
- Búsqueda full-text en PostgreSQL
- Taxonomías (tags, categorías)

### 🤖 Automatización con n8n
- **Publishing Workflow**: Distribución multicanal automática
- **Newsletter Workflow**: Email semanal automatizado
- **Sync Workflow**: Sincronización con Medium, Dev.to, Hashnode
- **Backup Workflow**: Respaldos automáticos diarios

### 💳 Monetización
- Contenido público y premium
- Productos digitales (libros, cursos)
- Integración con Stripe/Lemon Squeezy
- Links de pago externos
- Control de acceso granular

### 📚 Libros Digitales
- Estructura por capítulos
- Publicación progresiva
- Notificaciones a compradores
- Preview gratuito

---

## 📚 Documentación

### 📖 Documentación Completa
- **[Architecture Overview](./docs/architecture/00-overview.md)** - Visión general, stack y decisiones arquitectónicas
- **[Frontend Architecture](./docs/architecture/01-frontend-architecture.md)** - Next.js, componentes, routing, i18n
- **[Backend Architecture](./docs/architecture/02-backend-architecture.md)** - Clean Architecture, API, servicios
- **[Automation Workflows](./docs/architecture/05-automation-workflows.md)** - n8n workflows e integraciones
- **[Deployment & Infrastructure](./docs/architecture/06-deployment-infrastructure.md)** - Docker, CI/CD, monitoring
- **[i18n Strategy](./docs/architecture/08-i18n-strategy.md)** - Estrategia de internacionalización

### 🚀 Guías
- **[Quick Start Guide](./docs/QUICKSTART.md)** - Setup completo en 30 minutos
- **[Architecture Index](./docs/architecture/README.md)** - Índice de toda la documentación

---

## 🔧 Desarrollo

### Pre-requisitos
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 16 (via Docker)
- Redis 7 (via Docker)

### Setup de Desarrollo

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar .env
cp .env.example .env.local

# 3. Levantar servicios
docker-compose up -d postgres redis minio

# 4. Migraciones
cd apps/api
npx prisma migrate dev
npx prisma generate
npx prisma db seed

# 5. Desarrollo
pnpm run dev:api     # Backend en http://localhost:3001
pnpm run dev:frontend # Frontend en http://localhost:3000
```

### Scripts Disponibles

```bash
# Frontend
pnpm run dev:frontend       # Desarrollo
pnpm run build:frontend     # Build producción
pnpm run start:frontend     # Servir build
pnpm run lint:frontend      # Linter
pnpm run test:frontend      # Tests

# Backend
pnpm run dev:api            # Desarrollo
pnpm run build:api          # Build producción
pnpm run start:api          # Servir build
pnpm run test:api           # Tests

# Database
pnpm run db:migrate         # Ejecutar migraciones
pnpm run db:seed            # Seed data
pnpm run db:studio          # Abrir Prisma Studio

# Docker
docker-compose up -d        # Levantar todo
docker-compose down         # Detener todo
docker-compose logs -f      # Ver logs
```

---

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# Integration tests
pnpm run test:integration

# E2E tests
pnpm run test:e2e

# Coverage
pnpm run test:coverage
```

---

## 🚀 Deployment

### Producción con Docker

```bash
# Build y deploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verificar health
curl https://storiesofsoftware.com/api/health
curl https://api.storiesofsoftware.com/health
```

### CI/CD con GitHub Actions

El proyecto incluye workflows de GitHub Actions para:
- ✅ Tests automáticos en cada PR
- ✅ Build de imágenes Docker
- ✅ Deploy automático a producción
- ✅ Notificaciones a Slack/Discord

Ver [`.github/workflows/`](./.github/workflows/) para detalles.

---

## 🎯 Roadmap

### ✅ Fase 1: MVP (Completado)
- [x] Frontend básico con Next.js
- [x] Backend API con PostgreSQL
- [x] i18n básico (ES/EN)
- [x] Blog público
- [x] Arquitectura documentada

### 🔄 Fase 2: Automatización (En Progreso)
- [ ] Integración n8n
- [ ] Workflows de publicación
- [ ] Newsletter automatizado
- [ ] Sincronización externa

### 📅 Fase 3: Monetización (Planeado)
- [ ] Payment Service
- [ ] Contenido premium
- [ ] Gestión de productos
- [ ] Dashboard de ventas

### 🚀 Fase 4: Escala (Futuro)
- [ ] Kubernetes deployment
- [ ] CDN global
- [ ] Edge functions
- [ ] Analytics avanzado

---

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

**Convención de commits:** Usamos [Conventional Commits](https://www.conventionalcommits.org/)

---

## 📄 Licencia

Este proyecto es propiedad privada. Todos los derechos reservados © 2025 Stories of Software.

---

## 📞 Contacto

- **Website**: [https://storiesofsoftware.com](https://storiesofsoftware.com)
- **Email**: hello@storiesofsoftware.com
- **Twitter**: [@storiesofsw](https://twitter.com/storiesofsw)
- **GitHub**: [github.com/storiesofsoftware](https://github.com/storiesofsoftware)

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org) - The React Framework
- [Prisma](https://www.prisma.io) - Next-generation ORM
- [n8n](https://n8n.io) - Workflow Automation
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI Components
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS

---

**Hecho con ❤️ para la comunidad de ingeniería de software**
# nextjs-auth-starter

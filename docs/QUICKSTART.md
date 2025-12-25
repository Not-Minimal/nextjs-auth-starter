# Quick Start Guide - Stories of Software
## Guía Rápida de Inicio

**Tiempo estimado:** 30 minutos  
**Nivel:** Intermedio  
**Pre-requisitos:** Node.js 20+, Docker, Git

---

## 🚀 Setup Completo en 5 Pasos

### Paso 1: Clonar y Configurar Proyecto

```bash
# Clonar repositorio
git clone https://github.com/yourusername/storiesofsoftware.git
cd storiesofsoftware

# Instalar pnpm (si no lo tienes)
npm install -g pnpm

# Instalar dependencias
pnpm install
```

### Paso 2: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar con tus valores
nano .env.local
```

**Variables esenciales:**

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/storiesofsoftware"

# JWT Secrets (genera con: openssl rand -base64 32)
JWT_ACCESS_SECRET="tu_secret_access"
JWT_REFRESH_SECRET="tu_secret_refresh"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Redis
REDIS_URL="redis://localhost:6379"

# Optional: External services (déjalos vacíos por ahora)
SENDGRID_API_KEY=""
MEDIUM_API_TOKEN=""
DEVTO_API_KEY=""
```

### Paso 3: Levantar Infraestructura con Docker

```bash
# Levantar PostgreSQL, Redis y MinIO
docker-compose up -d postgres redis minio

# Verificar que estén corriendo
docker-compose ps
```

**Deberías ver:**
- ✅ storiesofsoftware-postgres (port 5432)
- ✅ storiesofsoftware-redis (port 6379)
- ✅ storiesofsoftware-minio (port 9000, 9001)

### Paso 4: Configurar Base de Datos

```bash
# Entrar a la carpeta del backend
cd apps/api

# Ejecutar migraciones de Prisma
npx prisma migrate dev --name init

# Generar cliente de Prisma
npx prisma generate

# Seed inicial (datos de prueba)
npx prisma db seed

# Volver a raíz
cd ../..
```

### Paso 5: Iniciar Servicios de Desarrollo

```bash
# Terminal 1: Backend API
cd apps/api
pnpm run dev
# ✅ API corriendo en http://localhost:3001

# Terminal 2: Frontend
cd apps/frontend
pnpm run dev
# ✅ Frontend corriendo en http://localhost:3000
```

---

## ✅ Verificación del Setup

### 1. Backend API

Abre http://localhost:3001/health

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-15T10:30:00Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### 2. Frontend

Abre http://localhost:3000

**Deberías ver:**
- ✅ Home page cargando
- ✅ Navegación funcionando
- ✅ Switcher de idioma (ES/EN)

### 3. Probar API

```bash
# Crear un post de prueba
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "hello-world",
    "locale": "es",
    "title": "Hola Mundo",
    "excerpt": "Mi primer post",
    "content": "# Hola Mundo\n\nEste es mi primer post.",
    "isPremium": false
  }'

# Obtener posts
curl http://localhost:3001/api/posts?locale=es
```

---

## 📁 Estructura del Proyecto

```
storiesofsoftware/
├── apps/
│   ├── frontend/          # Next.js App (Puerto 3000)
│   │   ├── app/           # App Router
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities
│   │   └── public/        # Static assets
│   │
│   └── api/               # Backend API (Puerto 3001)
│       ├── src/
│       │   ├── domain/           # Entidades y lógica de negocio
│       │   ├── application/      # Casos de uso
│       │   ├── infrastructure/   # DB, cache, storage
│       │   └── presentation/     # Controllers, routes
│       └── prisma/        # Database schema
│
├── docker/                # Docker configs
├── docs/                  # Documentación
└── scripts/               # Utility scripts
```

---

## 🎨 Desarrollo Frontend

### Crear una nueva página

```typescript
// apps/frontend/app/[locale]/test/page.tsx
import { useTranslations } from 'next-intl'

export default function TestPage() {
  const t = useTranslations('common')
  
  return (
    <div>
      <h1>{t('site.title')}</h1>
      <p>Esta es una página de prueba</p>
    </div>
  )
}
```

Accede a: http://localhost:3000/test (ES) o http://localhost:3000/en/test (EN)

### Crear un componente

```typescript
// apps/frontend/components/MyComponent.tsx
import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('common')
  
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">{t('actions.readMore')}</h2>
    </div>
  )
}
```

### Agregar traducciones

```json
// apps/frontend/public/locales/es/common.json
{
  "mySection": {
    "title": "Mi Título",
    "description": "Mi descripción"
  }
}
```

```json
// apps/frontend/public/locales/en/common.json
{
  "mySection": {
    "title": "My Title",
    "description": "My description"
  }
}
```

---

## 🔌 Desarrollo Backend

### Crear un nuevo endpoint

```typescript
// apps/api/src/presentation/http/routes/example.routes.ts
import { FastifyInstance } from 'fastify'

export async function exampleRoutes(app: FastifyInstance) {
  app.get('/api/example', async (request, reply) => {
    return reply.send({
      data: {
        message: 'Hello from API!',
        locale: request.locale
      }
    })
  })
}
```

Registrar en `apps/api/src/presentation/http/routes/index.ts`:

```typescript
import { exampleRoutes } from './example.routes'

export function setupRoutes(app: FastifyInstance) {
  app.register(exampleRoutes)
  // ... other routes
}
```

### Crear un Use Case

```typescript
// apps/api/src/application/use-cases/example/DoSomething.ts
export class DoSomethingUseCase {
  constructor(
    private someRepository: ISomeRepository
  ) {}

  async execute(data: DoSomethingDTO): Promise<Result> {
    // 1. Validate
    // 2. Business logic
    // 3. Persist
    // 4. Return result
  }
}
```

### Actualizar schema de Prisma

```prisma
// apps/api/prisma/schema.prisma

model Example {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  
  @@map("examples")
}
```

```bash
# Crear migración
npx prisma migrate dev --name add_example_table

# Regenerar cliente
npx prisma generate
```

---

## 🤖 Setup de n8n (Opcional)

```bash
# Levantar n8n
docker-compose up -d n8n

# Acceder a n8n
open http://localhost:5678
```

**Credenciales por defecto:**
- User: admin
- Password: (ver en .env: N8N_PASSWORD)

### Importar workflows de ejemplo

1. Ve a http://localhost:5678
2. Click en "Workflows" → "Import from file"
3. Selecciona `apps/automation/workflows/example-workflow.json`

---

## 🧪 Testing

### Frontend Tests

```bash
cd apps/frontend

# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Coverage
pnpm run test:coverage
```

### Backend Tests

```bash
cd apps/api

# Unit tests
pnpm run test

# Integration tests
pnpm run test:integration

# E2E tests
pnpm run test:e2e
```

---

## 🐛 Troubleshooting

### Error: Cannot connect to PostgreSQL

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps postgres

# Ver logs
docker-compose logs postgres

# Reiniciar
docker-compose restart postgres
```

### Error: Redis connection refused

```bash
# Verificar Redis
docker-compose ps redis

# Limpiar datos de Redis (si es necesario)
docker-compose exec redis redis-cli FLUSHALL
```

### Error: Prisma Client not generated

```bash
cd apps/api
npx prisma generate
```

### Error: Port 3000 already in use

```bash
# Cambiar puerto en package.json
"dev": "next dev -p 3001"

# O matar el proceso
lsof -ti:3000 | xargs kill -9
```

### Frontend no muestra traducciones

```bash
# Verificar que existan los archivos
ls apps/frontend/public/locales/es/
ls apps/frontend/public/locales/en/

# Reiniciar dev server
pnpm run dev
```

---

## 📚 Próximos Pasos

Una vez que tengas el setup básico funcionando:

1. **Lee la arquitectura completa:**
   - [`docs/architecture/00-overview.md`](./architecture/00-overview.md)
   - [`docs/architecture/01-frontend-architecture.md`](./architecture/01-frontend-architecture.md)
   - [`docs/architecture/02-backend-architecture.md`](./architecture/02-backend-architecture.md)

2. **Configura servicios externos:**
   - SendGrid para emails
   - Stripe para pagos
   - Medium/Dev.to APIs para sincronización

3. **Implementa workflows de n8n:**
   - [`docs/architecture/05-automation-workflows.md`](./architecture/05-automation-workflows.md)

4. **Prepara para producción:**
   - [`docs/architecture/06-deployment-infrastructure.md`](./architecture/06-deployment-infrastructure.md)

---

## 🤝 Contribuir

Para contribuir al proyecto:

1. Crea una rama: `git checkout -b feature/mi-feature`
2. Haz tus cambios
3. Escribe tests
4. Commit: `git commit -m "feat: descripción"`
5. Push: `git push origin feature/mi-feature`
6. Abre un Pull Request

---

## 📞 Ayuda

- **Documentación:** [`docs/architecture/README.md`](./architecture/README.md)
- **Issues:** GitHub Issues
- **Discord:** [Link al servidor]
- **Email:** help@storiesofsoftware.com

---

## ✨ Tips

### Comandos útiles

```bash
# Ver todos los contenedores
docker-compose ps

# Ver logs de un servicio
docker-compose logs -f api

# Reiniciar todos los servicios
docker-compose restart

# Limpiar todo y empezar de cero
docker-compose down -v
docker system prune -a
pnpm run clean
pnpm install

# Prisma Studio (UI para ver/editar BD)
cd apps/api
npx prisma studio
# Abre en http://localhost:5555
```

### VS Code Extensions recomendadas

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- i18n Ally (para traducciones)

### Snippets útiles

Crea `.vscode/snippets.code-snippets`:

```json
{
  "Next.js Page": {
    "prefix": "npage",
    "body": [
      "export default function ${1:Page}() {",
      "  return (",
      "    <div>",
      "      <h1>${2:Title}</h1>",
      "    </div>",
      "  )",
      "}"
    ]
  }
}
```

---

**¡Listo para empezar a construir! 🚀**

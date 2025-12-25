# i18n Strategy - Stories of Software
## Estrategia de Internacionalización

**Versión:** 1.0  
**Idiomas Soportados:** Español (ES), English (EN)  
**Enfoque:** Native i18n desde el diseño

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Principios de i18n](#principios-de-i18n)
3. [Arquitectura Multilenguaje](#arquitectura-multilenguaje)
4. [Frontend i18n](#frontend-i18n)
5. [Backend i18n](#backend-i18n)
6. [Gestión de Contenido](#gestión-de-contenido)
7. [SEO Multilenguaje](#seo-multilenguaje)
8. [Workflows de Traducción](#workflows-de-traducción)
9. [Best Practices](#best-practices)

---

## 🎯 Visión General

Stories of Software es una plataforma **bilingüe nativa** (español e inglés) donde el contenido y la interfaz se gestionan completamente en ambos idiomas desde el origen.

### Objetivos

1. **Experiencia nativa**: Cada idioma se siente como la versión principal
2. **SEO optimizado**: URLs, metadata y contenido localizado
3. **Sin traducción automática**: Todo el contenido es creado intencionalmente
4. **Flexibilidad**: Fácil agregar nuevos idiomas en el futuro
5. **Performance**: No impacto en velocidad por i18n

### Scope de i18n

```yaml
Elementos localizados:
  ✅ Contenido:
    - Posts (artículos)
    - Books (libros)
    - Chapters (capítulos)
    - Metadata (títulos, descripciones, excerpts)
    - Tags y categorías
  
  ✅ Interfaz de usuario:
    - Navegación
    - Botones y labels
    - Mensajes de error
    - Formularios
    - Notificaciones
  
  ✅ Marketing:
    - Landing pages
    - Newsletter
    - Emails transaccionales
    - Social media content
  
  ✅ SEO:
    - Meta tags
    - URLs
    - Sitemaps
    - Structured data
    - hreflang tags

Elementos NO localizados:
  ❌ Código fuente
  ❌ Logs técnicos
  ❌ Nombres de usuario
  ❌ Datos técnicos (IDs, timestamps)
```

---

## 🏛️ Principios de i18n

### 1. Content First, Translation Never

**❌ Enfoque incorrecto**: Escribir en un idioma y traducir
```
ES (original) → [Traducción automática] → EN
```

**✅ Enfoque correcto**: Crear contenido nativo en cada idioma
```
ES (original) ← [Mismo autor] → EN (original)
```

### 2. URL Structure Native

Cada idioma tiene su propia estructura de URL limpia:

```
Español (default):
https://storiesofsoftware.com/
https://storiesofsoftware.com/blog/principios-clean-code
https://storiesofsoftware.com/libros/arquitectura-software

English:
https://storiesofsoftware.com/en
https://storiesofsoftware.com/en/blog/clean-code-principles
https://storiesofsoftware.com/en/books/software-architecture
```

### 3. Locale Detection Smart

```typescript
Orden de detección de idioma:
1. URL explícita (/en/blog) → Usar EN
2. Cookie de preferencia → Usar idioma guardado
3. Header Accept-Language → Detectar navegador
4. Geolocalización IP → Detectar país
5. Default → ES (español como default)
```

### 4. No Mixed Content

Una página nunca debe mostrar contenido mezclado en diferentes idiomas:

```
❌ INCORRECTO:
Título: "Clean Code Principles" (EN)
Contenido: "Los principios de código limpio..." (ES)

✅ CORRECTO:
Título: "Clean Code Principles" (EN)
Contenido: "Clean code principles are..." (EN)
```

### 5. Graceful Fallback

Si el contenido no existe en un idioma, mostrar mensaje claro:

```typescript
// ❌ Mostrar contenido en otro idioma
if (!postES) return postEN // NO!

// ✅ Mostrar mensaje apropiado
if (!postES) {
  return <NotAvailableMessage 
    locale="es" 
    availableIn={["en"]}
  />
}
```

---

## 🏗️ Arquitectura Multilenguaje

### Data Model

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTENT STORAGE                           │
├─────────────────────────────────────────────────────────────┤
│  Post Table                                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │ id: clx123     slug: "clean-code"  locale: "es"   │     │
│  │ title: "Principios de Clean Code"                  │     │
│  │ content: "Los principios de código limpio..."      │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │ id: clx456     slug: "clean-code"  locale: "en"   │     │
│  │ title: "Clean Code Principles"                     │     │
│  │ content: "Clean code principles are..."            │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Unique constraint: (slug, locale)                          │
│  No relación directa entre versiones de idiomas             │
└─────────────────────────────────────────────────────────────┘
```

### Routing Strategy

```typescript
// app/[locale]/layout.tsx
export function generateStaticParams() {
  return [
    { locale: 'es' },
    { locale: 'en' }
  ]
}

// Middleware detecta locale y redirecciona si es necesario
// app/middleware.ts
export function middleware(request: NextRequest) {
  const locale = detectLocale(request)
  const pathname = request.nextUrl.pathname
  
  // Si la URL no tiene locale, redirigir
  if (!pathname.startsWith('/en') && !pathname.startsWith('/es')) {
    if (locale === 'en') {
      return NextResponse.redirect(new URL(`/en${pathname}`, request.url))
    }
    // ES es default, no necesita prefijo
  }
  
  return NextResponse.next()
}
```

---

## 🎨 Frontend i18n

### next-intl Configuration

```typescript
// i18n.config.ts
export const locales = ['es', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'es'

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English'
}

export const localeFlags: Record<Locale, string> = {
  es: '🇪🇸',
  en: '🇺🇸'
}
```

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n.config'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // No prefix for default locale (ES)
  localeDetection: true
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
```

### Translation Files Structure

```
/public/locales/
├── es/
│   ├── common.json          # Comunes (header, footer, etc)
│   ├── navigation.json      # Navegación
│   ├── blog.json           # Sección blog
│   ├── books.json          # Sección libros
│   ├── auth.json           # Autenticación
│   ├── errors.json         # Mensajes de error
│   └── newsletter.json     # Newsletter
│
└── en/
    ├── common.json
    ├── navigation.json
    ├── blog.json
    ├── books.json
    ├── auth.json
    ├── errors.json
    └── newsletter.json
```

### Translation Files Examples

```json
// public/locales/es/common.json
{
  "site": {
    "title": "Stories of Software",
    "description": "Historias, experiencias y conocimiento sobre ingeniería de software",
    "tagline": "Donde el código cuenta historias"
  },
  "actions": {
    "readMore": "Leer más",
    "share": "Compartir",
    "subscribe": "Suscribirse",
    "buy": "Comprar",
    "download": "Descargar"
  },
  "time": {
    "minutesRead": "{count} min de lectura",
    "published": "Publicado el {date}",
    "updated": "Actualizado el {date}"
  },
  "status": {
    "loading": "Cargando...",
    "error": "Ha ocurrido un error",
    "success": "Éxito",
    "notFound": "No encontrado"
  }
}
```

```json
// public/locales/en/common.json
{
  "site": {
    "title": "Stories of Software",
    "description": "Stories, experiences, and knowledge about software engineering",
    "tagline": "Where code tells stories"
  },
  "actions": {
    "readMore": "Read more",
    "share": "Share",
    "subscribe": "Subscribe",
    "buy": "Buy",
    "download": "Download"
  },
  "time": {
    "minutesRead": "{count} min read",
    "published": "Published on {date}",
    "updated": "Updated on {date}"
  },
  "status": {
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success",
    "notFound": "Not found"
  }
}
```

### Using Translations in Components

```typescript
// components/Header.tsx
'use client'

import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/lib/navigation'

export function Header() {
  const t = useTranslations('navigation')
  const locale = useLocale()
  
  return (
    <header>
      <nav>
        <Link href="/">{t('home')}</Link>
        <Link href="/blog">{t('blog')}</Link>
        <Link href="/books">{t('books')}</Link>
        <Link href="/newsletter">{t('newsletter')}</Link>
        <Link href="/about">{t('about')}</Link>
      </nav>
      
      <LocaleSwitcher currentLocale={locale} />
    </header>
  )
}
```

### Locale Switcher Component

```typescript
// components/LocaleSwitcher.tsx
'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { locales, localeNames, localeFlags } from '@/i18n.config'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    // Remove current locale from pathname
    let newPathname = pathname
    
    if (pathname.startsWith('/en')) {
      newPathname = pathname.replace('/en', '')
    }
    
    // Add new locale if not ES (default)
    if (newLocale === 'en') {
      newPathname = `/en${newPathname || '/'}`
    } else {
      newPathname = newPathname || '/'
    }
    
    // Save preference in cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
    
    router.push(newPathname)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          {localeFlags[locale as keyof typeof localeFlags]} {localeNames[locale as keyof typeof localeNames]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={locale === loc ? 'font-bold' : ''}
          >
            {localeFlags[loc]} {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Date and Number Formatting

```typescript
// lib/utils/i18n.ts
import { useLocale } from 'next-intl'

export function useFormatDate() {
  const locale = useLocale()
  
  return (date: Date | string, format: 'short' | 'long' = 'long') => {
    const d = typeof date === 'string' ? new Date(date) : date
    
    const options: Intl.DateTimeFormatOptions = format === 'short'
      ? { year: 'numeric', month: 'short', day: 'numeric' }
      : { year: 'numeric', month: 'long', day: 'numeric' }
    
    return new Intl.DateTimeFormat(locale, options).format(d)
  }
}

export function useFormatNumber() {
  const locale = useLocale()
  
  return (number: number, style: 'decimal' | 'currency' = 'decimal', currency = 'USD') => {
    const options: Intl.NumberFormatOptions = style === 'currency'
      ? { style: 'currency', currency }
      : { style: 'decimal' }
    
    return new Intl.NumberFormat(locale, options).format(number)
  }
}

// Usage
function PostMeta({ post }: Props) {
  const formatDate = useFormatDate()
  
  return (
    <time dateTime={post.publishedAt}>
      {formatDate(post.publishedAt, 'long')}
    </time>
  )
}
```

---

## 🔌 Backend i18n

### API Locale Handling

```typescript
// presentation/http/middlewares/locale.middleware.ts
import { FastifyRequest } from 'fastify'

export async function localeMiddleware(request: FastifyRequest) {
  // 1. Check query parameter
  const queryLocale = request.query.locale
  
  // 2. Check Accept-Language header
  const acceptLanguage = request.headers['accept-language']
  
  // 3. Check cookie
  const cookieLocale = request.cookies['NEXT_LOCALE']
  
  // Determine locale
  let locale = 'es' // default
  
  if (queryLocale && ['es', 'en'].includes(queryLocale as string)) {
    locale = queryLocale as string
  } else if (cookieLocale && ['es', 'en'].includes(cookieLocale)) {
    locale = cookieLocale
  } else if (acceptLanguage) {
    // Parse Accept-Language header
    const languages = acceptLanguage.split(',').map(lang => {
      const [code, priority = '1'] = lang.split(';q=')
      return { code: code.trim().split('-')[0], priority: parseFloat(priority) }
    })
    
    const preferredLocale = languages
      .sort((a, b) => b.priority - a.priority)
      .find(lang => ['es', 'en'].includes(lang.code))
    
    if (preferredLocale) {
      locale = preferredLocale.code
    }
  }
  
  // Attach to request
  request.locale = locale
}
```

### API Response with Locale

```typescript
// presentation/http/controllers/PostController.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { GetPostUseCase } from '@/application/use-cases/posts/GetPost'

export class PostController {
  constructor(private getPostUseCase: GetPostUseCase) {}

  async getBySlug(request: FastifyRequest, reply: FastifyReply) {
    const { slug } = request.params as { slug: string }
    const locale = request.locale || 'es'
    
    const post = await this.getPostUseCase.execute(slug, locale)
    
    if (!post) {
      return reply.code(404).send({
        error: {
          code: 'POST_NOT_FOUND',
          message: locale === 'es' 
            ? `No se encontró el artículo con slug '${slug}'`
            : `Post with slug '${slug}' not found`,
          availableLocales: await this.getAvailableLocales(slug)
        }
      })
    }
    
    return reply.send({ data: post })
  }
  
  private async getAvailableLocales(slug: string): Promise<string[]> {
    // Check which locales have this content
    const locales = ['es', 'en']
    const available = []
    
    for (const locale of locales) {
      const exists = await this.getPostUseCase.exists(slug, locale)
      if (exists) available.push(locale)
    }
    
    return available
  }
}
```

### Database Queries with Locale

```typescript
// infrastructure/database/repositories/PrismaPostRepository.ts
import { PrismaClient } from '@prisma/client'
import { Post } from '@/domain/entities/Post'

export class PrismaPostRepository {
  constructor(private prisma: PrismaClient) {}

  async findBySlug(slug: string, locale: string): Promise<Post | null> {
    const post = await this.prisma.post.findUnique({
      where: {
        slug_locale: {
          slug,
          locale
        }
      },
      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })
    
    if (!post) return null
    
    return Post.fromPrisma(post)
  }

  async findMany(
    filters: { 
      locale: string
      status?: string
      categoryId?: string
      limit?: number
      offset?: number
    }
  ): Promise<Post[]> {
    const posts = await this.prisma.post.findMany({
      where: {
        locale: filters.locale,
        status: filters.status || 'PUBLISHED',
        categoryId: filters.categoryId
      },
      include: {
        author: true,
        category: true
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: filters.limit || 20,
      skip: filters.offset || 0
    })
    
    return posts.map(Post.fromPrisma)
  }
}
```

---

## 📝 Gestión de Contenido

### Content Creation Workflow

```yaml
Flujo de creación de contenido multilenguaje:

1. Autor crea borrador en idioma principal (ES o EN)
   - POST /api/posts
   - { slug: "clean-code", locale: "es", title: "...", content: "..." }
   - Status: DRAFT

2. Autor revisa y marca como listo
   - PATCH /api/posts/:id/status
   - { status: "READY" }

3. Autor crea versión en segundo idioma
   - POST /api/posts
   - { slug: "clean-code", locale: "en", title: "...", content: "..." }
   - IMPORTANTE: Mismo slug, diferente locale

4. Autor publica versión en español
   - PATCH /api/posts/:id/publish
   - Activa workflows de n8n para ES

5. Autor publica versión en inglés
   - PATCH /api/posts/:id/publish
   - Activa workflows de n8n para EN

Resultado:
  - Dos posts independientes
  - Mismo slug, diferentes locales
  - Cada uno con su propio flujo de publicación
```

### Content Linking Strategy

```typescript
// ¿Cómo relacionar contenido en diferentes idiomas?

// Opción 1: NO relacionar en BD (RECOMENDADO)
// - Usar mismo slug para ambos idiomas
// - Frontend determina si existe versión en otro idioma consultando API
// - Simple, flexible, menos acoplamiento

// Opción 2: Relación explícita (OPCIONAL)
interface Post {
  id: string
  slug: string
  locale: string
  translationGroupId?: string // UUID compartido entre traducciones
}

// Permite queries como:
// "Dame todas las versiones de este contenido"
SELECT * FROM posts WHERE translationGroupId = 'xxx'
```

### Admin UI for Content Management

```typescript
// components/admin/PostEditor.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function PostEditor({ postId }: Props) {
  const router = useRouter()
  const [currentLocale, setCurrentLocale] = useState<'es' | 'en'>('es')
  
  return (
    <div>
      <Tabs value={currentLocale} onValueChange={(v) => setCurrentLocale(v as 'es' | 'en')}>
        <TabsList>
          <TabsTrigger value="es">🇪🇸 Español</TabsTrigger>
          <TabsTrigger value="en">🇺🇸 English</TabsTrigger>
        </TabsList>
        
        <TabsContent value="es">
          <PostForm locale="es" postId={postId} />
        </TabsContent>
        
        <TabsContent value="en">
          <PostForm locale="en" postId={postId} />
        </TabsContent>
      </Tabs>
      
      <div className="flex gap-4 mt-4">
        <Button onClick={() => checkOtherLocale()}>
          Ver versión en {currentLocale === 'es' ? 'inglés' : 'español'}
        </Button>
        
        <Button onClick={() => createTranslation()}>
          Crear traducción
        </Button>
      </div>
    </div>
  )
}
```

---

## 🔍 SEO Multilenguaje

### hreflang Tags

```typescript
// app/[locale]/blog/[slug]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ 
  params: { locale, slug } 
}: Props): Promise<Metadata> {
  const post = await fetchPost(slug, locale)
  
  if (!post) return {}
  
  // Check if post exists in other locale
  const otherLocale = locale === 'es' ? 'en' : 'es'
  const hasOtherVersion = await postExists(slug, otherLocale)
  
  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/${locale === 'es' ? '' : 'en/'}blog/${slug}`,
      languages: {
        'es-ES': `/blog/${slug}`,
        'en-US': `/en/blog/${slug}`,
        'x-default': `/blog/${slug}` // Default to ES
      }
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/${locale === 'es' ? '' : 'en/'}blog/${slug}`,
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      alternateLocale: locale === 'es' ? ['en_US'] : ['es_ES']
    }
  }
}
```

### XML Sitemap with Multiple Locales

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://storiesofsoftware.com'
  
  // Get all posts for both locales
  const postsES = await fetchAllPosts('es')
  const postsEN = await fetchAllPosts('en')
  
  const postUrls: MetadataRoute.Sitemap = [
    // Spanish posts
    ...postsES.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: {
          es: `${baseUrl}/blog/${post.slug}`,
          en: `${baseUrl}/en/blog/${post.slug}`
        }
      }
    })),
    
    // English posts
    ...postsEN.map(post => ({
      url: `${baseUrl}/en/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: {
          es: `${baseUrl}/blog/${post.slug}`,
          en: `${baseUrl}/en/blog/${post.slug}`
        }
      }
    }))
  ]
  
  return [
    // Static pages
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
      alternates: {
        languages: {
          es: baseUrl,
          en: `${baseUrl}/en`
        }
      }
    },
    ...postUrls
  ]
}
```

### Structured Data per Locale

```typescript
// components/seo/BlogPostSchema.tsx
export function BlogPostSchema({ post, locale }: Props) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name
    },
    inLanguage: locale,
    isAccessibleForFree: !post.isPremium,
    // Indicate other language versions
    translationOfWork: locale === 'en' ? `https://storiesofsoftware.com/blog/${post.slug}` : undefined,
    workTranslation: locale === 'es' ? `https://storiesofsoftware.com/en/blog/${post.slug}` : undefined
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

---

## 🔄 Workflows de Traducción

### n8n Automation for i18n

```yaml
Workflow: Check Missing Translations
Trigger: Scheduled (Daily)

Nodes:
  1. Get All Posts (ES)
     - GET /api/posts?locale=es&status=published
  
  2. For Each Post ES
     - Loop through posts
  
  3. Check EN Version Exists
     - GET /api/posts/:slug?locale=en
  
  4. IF Not Exists
     - Add to missing translations list
  
  5. Generate Report
     - Format: "Post '{title}' (ES) needs EN translation"
  
  6. Send to Slack
     - Notify team about missing translations
```

### Translation Checklist

```markdown
# Translation Checklist

## Content
- [ ] Title translated
- [ ] Excerpt translated
- [ ] Full content translated
- [ ] Code comments translated (if applicable)
- [ ] Image alt text translated
- [ ] Links to external resources checked (prefer locale-specific)

## Metadata
- [ ] Meta title
- [ ] Meta description
- [ ] OG tags
- [ ] Twitter card

## Technical
- [ ] Same slug used
- [ ] Tags appropriate for locale
- [ ] Category exists in target locale
- [ ] URLs in content point to correct locale

## Quality
- [ ] Grammar checked
- [ ] Technical terms accurate
- [ ] Cultural context appropriate
- [ ] No automatic translation artifacts
- [ ] Native speaker review (if possible)
```

---

## 🎯 Best Practices

### 1. Avoid Hardcoded Strings

```typescript
// ❌ BAD
function Button() {
  return <button>Click here</button>
}

// ✅ GOOD
function Button() {
  const t = useTranslations('common')
  return <button>{t('actions.clickHere')}</button>
}
```

### 2. Use Locale-Aware Components

```typescript
// ❌ BAD - Hardcoded date format
<span>{new Date(post.date).toLocaleDateString('en-US')}</span>

// ✅ GOOD - Locale-aware formatting
function PostDate({ date }: Props) {
  const formatDate = useFormatDate()
  return <time dateTime={date}>{formatDate(date)}</time>
}
```

### 3. Handle Pluralization

```json
// locales/es/common.json
{
  "comments": {
    "count": {
      "zero": "Sin comentarios",
      "one": "1 comentario",
      "other": "{count} comentarios"
    }
  }
}

// locales/en/common.json
{
  "comments": {
    "count": {
      "zero": "No comments",
      "one": "1 comment",
      "other": "{count} comments"
    }
  }
}
```

```typescript
// Usage with next-intl
function CommentCount({ count }: Props) {
  const t = useTranslations('comments')
  
  return <span>{t('count', { count })}</span>
}
```

### 4. Locale-Specific Formatting

```typescript
// lib/utils/format.ts
export function formatCurrency(amount: number, locale: string) {
  const currency = locale === 'es' ? 'EUR' : 'USD'
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount)
}

export function formatFileSize(bytes: number, locale: string) {
  const units = locale === 'es' 
    ? ['bytes', 'KB', 'MB', 'GB']
    : ['bytes', 'KB', 'MB', 'GB']
  
  // ... implementation
}
```

### 5. RTL Support (Future-proof)

Aunque español e inglés son LTR, preparar para futuros idiomas RTL:

```typescript
// lib/utils/direction.ts
const RTL_LOCALES = ['ar', 'he', 'fa']

export function isRTL(locale: string): boolean {
  return RTL_LOCALES.includes(locale)
}

export function getDirection(locale: string): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr'
}

// Usage in layout
<html lang={locale} dir={getDirection(locale)}>
```

### 6. Testing i18n

```typescript
// tests/i18n.test.ts
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

describe('i18n', () => {
  it('should render in Spanish', () => {
    const messages = {
      navigation: {
        home: 'Inicio'
      }
    }
    
    render(
      <NextIntlClientProvider locale="es" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    )
    
    expect(screen.getByText('Inicio')).toBeInTheDocument()
  })
  
  it('should render in English', () => {
    const messages = {
      navigation: {
        home: 'Home'
      }
    }
    
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    )
    
    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})
```

### 7. Performance Considerations

```typescript
// Preload translations for better performance
// app/[locale]/layout.tsx
export async function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }]
}

// Static generation with ISR
export const revalidate = 3600 // 1 hour

// Load only needed translations
const messages = (await import(`@/locales/${locale}/common.json`)).default
```

---

## 📊 Metrics and Analytics

### Track Locale Usage

```typescript
// lib/analytics.ts
export function trackLocaleSwitch(from: string, to: string) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible('Locale Switch', {
      props: {
        from,
        to
      }
    })
  }
}

export function trackContentView(postId: string, locale: string) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible('Content View', {
      props: {
        postId,
        locale
      }
    })
  }
}
```

### Analytics Dashboard Queries

```sql
-- Most viewed content by locale
SELECT locale, COUNT(*) as views
FROM page_views
WHERE path LIKE '/blog/%'
GROUP BY locale;

-- Locale distribution
SELECT locale, COUNT(DISTINCT user_id) as unique_users
FROM sessions
GROUP BY locale;

-- Translation coverage
SELECT 
  'es' as locale,
  COUNT(*) as total_posts
FROM posts
WHERE locale = 'es' AND status = 'PUBLISHED'
UNION
SELECT 
  'en' as locale,
  COUNT(*) as total_posts
FROM posts
WHERE locale = 'en' AND status = 'PUBLISHED';
```

---

## 🚀 Implementation Roadmap

```yaml
Phase 1: Foundation (Week 1-2)
  - ✅ Setup next-intl
  - ✅ Configure routing with [locale]
  - ✅ Create translation files structure
  - ✅ Implement locale detection
  - ✅ Build LocaleSwitcher component

Phase 2: Frontend i18n (Week 3-4)
  - ✅ Translate all UI components
  - ✅ Implement date/number formatting
  - ✅ Add locale-aware navigation
  - ✅ Setup SEO with hreflang

Phase 3: Backend i18n (Week 5-6)
  - ✅ Update database schema for locale
  - ✅ Implement locale middleware
  - ✅ Update all API endpoints
  - ✅ Add locale to cache keys

Phase 4: Content & Workflows (Week 7-8)
  - ✅ Admin UI for multilingual content
  - ✅ n8n workflows per locale
  - ✅ Translation checklist
  - ✅ Migration of existing content

Phase 5: Testing & Launch (Week 9-10)
  - ✅ i18n unit tests
  - ✅ SEO validation
  - ✅ Performance testing
  - ✅ Launch and monitor
```

---

## 📚 Referencias

- [next-intl Documentation](https://next-intl-docs.vercel.app)
- [Google i18n Guidelines](https://developers.google.com/international)
- [W3C Internationalization](https://www.w3.org/International/)
- [Mozilla i18n Guide](https://developer.mozilla.org/en-US/docs/Mozilla/Localization)
- [React i18n Best Practices](https://react.i18next.com/guides/best-practices)

---

**Fin de la documentación de arquitectura técnica de Stories of Software**
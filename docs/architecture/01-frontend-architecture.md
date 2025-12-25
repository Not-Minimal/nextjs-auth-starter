# Frontend Architecture - Stories of Software

**Versión:** 1.0  
**Stack:** Next.js 16+ App Router, TypeScript, Tailwind CSS  
**Patrón:** Server-Side Rendering (SSR) + Static Site Generation (SSG)

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Arquitectura de Componentes](#arquitectura-de-componentes)
4. [Routing e i18n](#routing-e-i18n)
5. [Estado y Data Fetching](#estado-y-data-fetching)
6. [Rendering Strategy](#rendering-strategy)
7. [Componentes Core](#componentes-core)
8. [Patrones de Diseño](#patrones-de-diseño)
9. [Performance](#performance)
10. [SEO](#seo)

---

## 🎯 Visión General

El frontend de Stories of Software es una aplicación Next.js moderna que prioriza:

- **SEO-First**: Contenido indexable y optimizado
- **Performance**: Core Web Vitals óptimos
- **i18n Native**: Soporte multilenguaje desde el núcleo
- **Accesibilidad**: WCAG 2.1 AA compliance
- **DX**: Developer Experience optimizada

### Responsabilidades

✅ Presentación de contenido  
✅ Navegación e i18n routing  
✅ SEO y metadata  
✅ Autenticación (UI)  
✅ Formularios y validación  
✅ Preview de contenido premium  
✅ Admin dashboard  

❌ Lógica de negocio (→ Backend)  
❌ Persistencia de datos (→ Backend)  
❌ Automatización (→ n8n)  

---

## 📁 Estructura del Proyecto

```
/apps/frontend/
├── app/                          # App Router (Next.js 16+)
│   ├── [locale]/                 # i18n routing
│   │   ├── (marketing)/          # Route group: public pages
│   │   │   ├── page.tsx          # Home
│   │   │   ├── about/
│   │   │   │   └── page.tsx      # About page
│   │   │   └── newsletter/
│   │   │       └── page.tsx      # Newsletter
│   │   │
│   │   ├── blog/                 # Blog section
│   │   │   ├── page.tsx          # Blog index
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx      # Blog post detail
│   │   │   └── category/
│   │   │       └── [slug]/
│   │   │           └── page.tsx  # Category posts
│   │   │
│   │   ├── books/                # Books section
│   │   │   ├── page.tsx          # Books index
│   │   │   └── [slug]/
│   │   │       ├── page.tsx      # Book detail
│   │   │       └── chapter/
│   │   │           └── [chapter]/
│   │   │               └── page.tsx  # Chapter detail
│   │   │
│   │   ├── (auth)/               # Route group: auth pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   └── admin/                # Admin dashboard
│   │       ├── layout.tsx        # Protected layout
│   │       ├── page.tsx          # Dashboard home
│   │       ├── posts/
│   │       ├── books/
│   │       └── settings/
│   │
│   ├── api/                      # API Routes (for webhooks, auth)
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts
│   │
│   ├── layout.tsx                # Root layout
│   ├── not-found.tsx             # 404 page
│   └── error.tsx                 # Error boundary
│
├── components/                   # React components
│   ├── ui/                       # Base UI components (shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navigation.tsx
│   │
│   ├── content/                  # Content components
│   │   ├── PostCard.tsx
│   │   ├── PostList.tsx
│   │   ├── BookCard.tsx
│   │   ├── ChapterList.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   └── TableOfContents.tsx
│   │
│   ├── features/                 # Feature-specific components
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   │
│   │   ├── premium/
│   │   │   ├── PaywallBanner.tsx
│   │   │   ├── PremiumBadge.tsx
│   │   │   └── PurchaseButton.tsx
│   │   │
│   │   ├── newsletter/
│   │   │   ├── NewsletterForm.tsx
│   │   │   └── NewsletterSuccess.tsx
│   │   │
│   │   └── search/
│   │       ├── SearchBar.tsx
│   │       └── SearchResults.tsx
│   │
│   └── admin/                    # Admin-specific components
│       ├── PostEditor.tsx
│       ├── BookEditor.tsx
│       ├── ContentStatusBadge.tsx
│       └── PublishButton.tsx
│
├── lib/                          # Utilities & configurations
│   ├── api/                      # API client
│   │   ├── client.ts             # API client setup
│   │   ├── posts.ts              # Posts endpoints
│   │   ├── books.ts              # Books endpoints
│   │   ├── auth.ts               # Auth endpoints
│   │   └── payments.ts           # Payments endpoints
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useLocale.ts
│   │   ├── useTheme.ts
│   │   ├── useDebounce.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── utils/                    # Utility functions
│   │   ├── cn.ts                 # Class name merger
│   │   ├── date.ts               # Date formatting
│   │   ├── seo.ts                # SEO helpers
│   │   └── markdown.ts           # Markdown utilities
│   │
│   ├── constants/                # Constants
│   │   ├── routes.ts
│   │   ├── api.ts
│   │   └── config.ts
│   │
│   └── validations/              # Zod schemas
│       ├── auth.ts
│       ├── post.ts
│       └── newsletter.ts
│
├── public/                       # Static assets
│   ├── images/
│   ├── fonts/
│   └── locales/                  # i18n translations
│       ├── en/
│       │   └── common.json
│       └── es/
│           └── common.json
│
├── styles/                       # Global styles
│   ├── globals.css
│   └── markdown.css
│
├── types/                        # TypeScript types
│   ├── api.ts                    # API response types
│   ├── content.ts                # Content types
│   ├── user.ts                   # User types
│   └── index.ts                  # Barrel exports
│
├── middleware.ts                 # Next.js middleware (i18n, auth)
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json
```

---

## 🏛️ Arquitectura de Componentes

### Jerarquía de Componentes

```
App Layout
├── Header
│   ├── Logo
│   ├── Navigation
│   │   ├── NavLink (i18n aware)
│   │   └── LocaleSwitcher
│   └── UserMenu
│       ├── AuthButton
│       └── ThemeToggle
│
├── Main Content (Slot)
│   └── [Dynamic Page Content]
│
└── Footer
    ├── SocialLinks
    ├── NewsletterForm
    └── Copyright
```

### Principios de Diseño

#### 1. Atomic Design
- **Atoms**: Button, Input, Badge, Icon
- **Molecules**: SearchBar, PostMeta, AuthorCard
- **Organisms**: Header, PostCard, CommentSection
- **Templates**: BlogLayout, BookLayout
- **Pages**: Composed in app/ directory

#### 2. Composition over Inheritance
```typescript
// ✅ Good: Composable
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ Bad: Prop drilling
<Card title="Title" content="Content" />
```

#### 3. Container/Presenter Pattern
```typescript
// Container (Smart Component)
export async function PostListContainer({ locale }: Props) {
  const posts = await fetchPosts(locale)
  return <PostListPresenter posts={posts} />
}

// Presenter (Dumb Component)
export function PostListPresenter({ posts }: Props) {
  return (
    <div>
      {posts.map(post => <PostCard key={post.id} {...post} />)}
    </div>
  )
}
```

---

## 🌍 Routing e i18n

### URL Structure

```
# Spanish (default)
https://storiesofsoftware.com/
https://storiesofsoftware.com/blog
https://storiesofsoftware.com/blog/clean-code-principles
https://storiesofsoftware.com/libros
https://storiesofsoftware.com/libros/arquitectura-software

# English
https://storiesofsoftware.com/en
https://storiesofsoftware.com/en/blog
https://storiesofsoftware.com/en/blog/clean-code-principles
https://storiesofsoftware.com/en/books
https://storiesofsoftware.com/en/books/software-architecture
```

### i18n Implementation

#### Middleware Configuration

```typescript
// middleware.ts
import { createI18nMiddleware } from 'next-intl/middleware'

export default createI18nMiddleware({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed', // No prefix for default locale
  localeDetection: true
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
```

#### Layout with i18n

```typescript
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }]
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: Props) {
  let messages
  try {
    messages = (await import(`@/public/locales/${locale}/common.json`)).default
  } catch (error) {
    notFound()
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

#### Using Translations

```typescript
// components/Header.tsx
'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/lib/navigation'

export function Header() {
  const t = useTranslations('navigation')
  
  return (
    <header>
      <nav>
        <Link href="/">{t('home')}</Link>
        <Link href="/blog">{t('blog')}</Link>
        <Link href="/books">{t('books')}</Link>
        <Link href="/newsletter">{t('newsletter')}</Link>
      </nav>
    </header>
  )
}
```

#### Locale Switcher

```typescript
// components/LocaleSwitcher.tsx
'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPathname)
  }

  return (
    <div>
      <button onClick={() => switchLocale('es')}>ES</button>
      <button onClick={() => switchLocale('en')}>EN</button>
    </div>
  )
}
```

---

## 📊 Estado y Data Fetching

### State Management Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    STATE LAYERS                          │
├─────────────────────────────────────────────────────────┤
│  Server State (React Query)                              │
│  - API data                                              │
│  - Cache management                                      │
│  - Optimistic updates                                    │
├─────────────────────────────────────────────────────────┤
│  URL State (Next.js Router)                              │
│  - Search params                                         │
│  - Filters                                               │
│  - Pagination                                            │
├─────────────────────────────────────────────────────────┤
│  Client State (Zustand)                                  │
│  - Theme                                                 │
│  - UI preferences                                        │
│  - Temporary data                                        │
├─────────────────────────────────────────────────────────┤
│  Local State (useState)                                  │
│  - Form inputs                                           │
│  - Component-specific state                              │
└─────────────────────────────────────────────────────────┘
```

### React Query Setup

```typescript
// lib/api/client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

// app/[locale]/layout.tsx
import { QueryClientProvider } from '@tanstack/react-query'

export default function RootLayout({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### Data Fetching Patterns

#### Server Component (Recommended)

```typescript
// app/[locale]/blog/page.tsx
import { fetchPosts } from '@/lib/api/posts'

export default async function BlogPage({ 
  params: { locale } 
}: Props) {
  // Fetch on server, no loading state needed
  const posts = await fetchPosts(locale)
  
  return <PostList posts={posts} />
}
```

#### Client Component with React Query

```typescript
// components/features/search/SearchResults.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { searchPosts } from '@/lib/api/posts'

export function SearchResults({ query, locale }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', 'search', query, locale],
    queryFn: () => searchPosts(query, locale),
    enabled: query.length > 2
  })

  if (isLoading) return <Skeleton />
  if (error) return <ErrorMessage />
  
  return <PostList posts={data} />
}
```

#### Mutation with Optimistic Updates

```typescript
// components/admin/PostEditor.tsx
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePost } from '@/lib/api/posts'

export function PostEditor({ post }: Props) {
  const queryClient = useQueryClient()
  
  const mutation = useMutation({
    mutationFn: updatePost,
    onMutate: async (newPost) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['posts', post.id])
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['posts', post.id])
      
      // Optimistically update
      queryClient.setQueryData(['posts', post.id], newPost)
      
      return { previous }
    },
    onError: (err, newPost, context) => {
      // Rollback on error
      queryClient.setQueryData(['posts', post.id], context?.previous)
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries(['posts'])
    }
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      mutation.mutate(formData)
    }}>
      {/* Form fields */}
    </form>
  )
}
```

### Zustand Store

```typescript
// lib/store/ui.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  toggleTheme: () => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: false,
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      }))
    }),
    { name: 'ui-storage' }
  )
)
```

---

## 🎨 Rendering Strategy

### Decision Matrix

| Page Type | Strategy | Reason |
|-----------|----------|--------|
| Home | SSG + ISR | Static content, revalidate periodically |
| Blog Index | SSG + ISR | List changes infrequently |
| Blog Post | SSG + ISR | Content rarely changes after publish |
| Book Chapter | SSG | Static content |
| Search Results | CSR | User-specific, real-time |
| Admin Dashboard | CSR + Auth | Protected, dynamic |
| User Profile | SSR | Personalized, SEO not critical |
| Newsletter Page | SSG | Static marketing page |

### Implementation Examples

#### Static Site Generation (SSG)

```typescript
// app/[locale]/blog/[slug]/page.tsx
import { fetchPost, fetchAllPostSlugs } from '@/lib/api/posts'

export async function generateStaticParams() {
  const locales = ['es', 'en']
  const slugs = await fetchAllPostSlugs()
  
  return locales.flatMap(locale =>
    slugs.map(slug => ({ locale, slug }))
  )
}

export default async function PostPage({ 
  params: { locale, slug } 
}: Props) {
  const post = await fetchPost(slug, locale)
  
  if (!post) notFound()
  
  return <PostDetail post={post} />
}

export const revalidate = 3600 // ISR: revalidate every hour
```

#### Server-Side Rendering (SSR)

```typescript
// app/[locale]/admin/posts/page.tsx
import { cookies } from 'next/headers'
import { fetchUserPosts } from '@/lib/api/posts'

export const dynamic = 'force-dynamic'

export default async function AdminPostsPage() {
  const token = cookies().get('auth-token')?.value
  
  if (!token) redirect('/login')
  
  const posts = await fetchUserPosts(token)
  
  return <PostsTable posts={posts} />
}
```

#### Client-Side Rendering (CSR)

```typescript
// app/[locale]/search/page.tsx
import { SearchInterface } from '@/components/features/search/SearchInterface'

export default function SearchPage() {
  return (
    <div>
      <h1>Search</h1>
      <SearchInterface /> {/* Client component */}
    </div>
  )
}
```

---

## 🧩 Componentes Core

### 1. MarkdownRenderer

```typescript
// components/content/MarkdownRenderer.tsx
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

interface Props {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: Props) {
  return (
    <ReactMarkdown
      className={cn('prose prose-lg dark:prose-invert', className)}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeHighlight,
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }]
      ]}
      components={{
        // Custom components
        img: ({ src, alt }) => (
          <img 
            src={src} 
            alt={alt} 
            loading="lazy" 
            className="rounded-lg shadow-md"
          />
        ),
        code: ({ className, children }) => {
          const match = /language-(\w+)/.exec(className || '')
          return match ? (
            <code className={className}>
              {children}
            </code>
          ) : (
            <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
              {children}
            </code>
          )
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
```

### 2. PostCard

```typescript
// components/content/PostCard.tsx
import { Link } from '@/lib/navigation'
import { formatDate } from '@/lib/utils/date'
import type { Post } from '@/types/content'

interface Props {
  post: Post
  locale: string
}

export function PostCard({ post, locale }: Props) {
  return (
    <article className="group relative flex flex-col h-full">
      {post.coverImage && (
        <div className="aspect-video overflow-hidden rounded-lg">
          <img
            src={post.coverImage}
            alt={post.title}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
        </div>
      )}
      
      <div className="flex-1 flex flex-col gap-4 pt-4">
        {post.isPremium && (
          <PremiumBadge />
        )}
        
        <h3 className="text-xl font-bold">
          <Link href={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </h3>
        
        <p className="text-muted-foreground line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center gap-4 mt-auto text-sm text-muted-foreground">
          <time dateTime={post.publishedAt}>
            {formatDate(post.publishedAt, locale)}
          </time>
          <span>·</span>
          <span>{post.readingTime} min read</span>
        </div>
      </div>
    </article>
  )
}
```

### 3. PaywallBanner

```typescript
// components/features/premium/PaywallBanner.tsx
'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types/content'

interface Props {
  product: Product
}

export function PaywallBanner({ product }: Props) {
  const t = useTranslations('premium')
  
  const handlePurchase = () => {
    window.location.href = product.paymentLink
  }
  
  return (
    <div className="border-2 border-dashed border-primary rounded-lg p-8 text-center">
      <div className="max-w-md mx-auto space-y-4">
        <div className="text-4xl">🔒</div>
        
        <h3 className="text-2xl font-bold">
          {t('locked.title')}
        </h3>
        
        <p className="text-muted-foreground">
          {t('locked.description')}
        </p>
        
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            ${product.price}
          </div>
          <div className="text-sm text-muted-foreground">
            {t('oneTime')}
          </div>
        </div>
        
        <Button 
          size="lg" 
          onClick={handlePurchase}
          className="w-full"
        >
          {t('unlock')}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          {t('securePayment')}
        </p>
      </div>
    </div>
  )
}
```

### 4. NewsletterForm

```typescript
// components/features/newsletter/NewsletterForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { subscribeToNewsletter } from '@/lib/api/newsletter'
import { newsletterSchema } from '@/lib/validations/newsletter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function NewsletterForm() {
  const t = useTranslations('newsletter')
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(newsletterSchema)
  })
  
  const onSubmit = async (data: any) => {
    try {
      await subscribeToNewsletter(data)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Subscription failed:', error)
    }
  }
  
  if (isSubmitted) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <p className="text-green-800 dark:text-green-200">
          {t('success')}
        </p>
      </div>
    )
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <Input
        type="email"
        placeholder={t('placeholder')}
        {...register('email')}
        className={errors.email ? 'border-red-500' : ''}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t('subscribing') : t('subscribe')}
      </Button>
    </form>
  )
}
```

---

## 🎨 Patrones de Diseño

### 1. Compound Components

```typescript
// components/ui/card.tsx
export const Card = ({ children, className }: Props) => (
  <div className={cn('rounded-lg border bg-card', className)}>
    {children}
  </div>
)

export const CardHeader = ({ children, className }: Props) => (
  <div className={cn('p-6', className)}>{children}</div>
)

export const CardContent = ({ children, className }: Props) => (
  <div className={cn('p-6 pt-0', className)}>{children}</div>
)

// Usage
<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

### 2. Render Props

```typescript
// components/features/auth/AuthGuard.tsx
interface Props {
  children: (user: User) => React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: Props) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <Spinner />
  if (!user) return fallback || <Redirect to="/login" />
  
  return <>{children(user)}</>
}

// Usage
<AuthGuard fallback={<LoginPrompt />}>
  {(user) => <DashboardContent user={user} />}
</AuthGuard>
```

### 3. Higher-Order Components (HOC)

```typescript
// lib/hoc/withLocale.tsx
export function withLocale<P extends object>(
  Component: React.ComponentType<P & { locale: string }>
) {
  return function WithLocaleComponent(props: P) {
    const locale = useLocale()
    return <Component {...props} locale={locale} />
  }
}

// Usage
const LocalizedPostList = withLocale(PostList)
```

### 4. Custom Hooks Pattern

> **Nota**: Este proyecto utiliza **better-auth** para la autenticación. El cliente de better-auth proporciona hooks y funciones optimizadas.

```typescript
// lib/auth/auth.client.ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
})

export const {
  useSession,
  signIn,
  signUp,
  signOut,
  useActiveOrganization,
} = authClient
```

```typescript
// lib/hooks/useAuth.ts
import { useSession } from '@/lib/auth/auth.client'

export function useAuth() {
  // better-auth proporciona el hook useSession con toda la funcionalidad
  const { data: session, isPending, error } = useSession()
  
  return {
    user: session?.user ?? null,
    session: session ?? null,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    error
  }
}

// Hook personalizado para verificar roles
export function useRequireRole(allowedRoles: string[]) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && (!user || !allowedRoles.includes(user.role))) {
      router.push('/auth/sign-in')
    }
  }, [user, isLoading, allowedRoles, router])
  
  return { user, isLoading, hasAccess: user && allowedRoles.includes(user.role) }
}
```

```typescript
// Ejemplo de uso en componentes
import { signIn, signOut, signUp } from '@/lib/auth/auth.client'
import { useAuth } from '@/lib/hooks/useAuth'

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await signIn.email({
        email,
        password,
        callbackURL: '/dashboard'
      })
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    await signIn.social({
      provider,
      callbackURL: '/dashboard'
    })
  }
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      handleLogin(
        formData.get('email') as string,
        formData.get('password') as string
      )
    }}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        Sign In
      </button>
      
      <button onClick={() => handleOAuthLogin('github')}>
        Sign in with GitHub
      </button>
    </form>
  )
}

function UserMenu() {
  const { user, isAuthenticated } = useAuth()
  
  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/'
        }
      }
    })
  }
  
  if (!isAuthenticated) return <LoginButton />
  
  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={handleLogout}>Sign Out</button>
    </div>
  )
}
```

---

## ⚡ Performance

### Optimization Strategies

#### 1. Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // LCP image
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

#### 2. Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const AdminDashboard = dynamic(() => import('@/components/admin/Dashboard'), {
  loading: () => <Skeleton />,
  ssr: false // Client-only
})
```

#### 3. Font Optimization

```typescript
// app/[locale]/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
})

export default function RootLayout({ children }: Props) {
  return (
    <html className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

#### 4. Memoization

```typescript
// Expensive computations
import { useMemo } from 'react'

export function PostList({ posts }: Props) {
  const sortedPosts = useMemo(() => {
    return posts.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  }, [posts])
  
  return <>{/* Render sortedPosts */}</>
}

// Prevent re-renders
import { memo } from 'react'

export const PostCard = memo(function PostCard({ post }: Props) {
  return <>{/* Render */}</>
})
```

#### 5. Streaming & Suspense

```typescript
// app/[locale]/blog/[slug]/page.tsx
import { Suspense } from 'react'

export default function PostPage({ params }: Props) {
  return (
    <>
      <PostHeader slug={params.slug} />
      
      <Suspense fallback={<ContentSkeleton />}>
        <PostContent slug={params.slug} />
      </Suspense>
      
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments slug={params.slug} />
      </Suspense>
    </>
  )
}
```

### Performance Metrics

Target Core Web Vitals:

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 600ms

---

## 🔍 SEO

### Metadata Implementation

```typescript
// app/[locale]/blog/[slug]/page.tsx
import type { Metadata } from 'next'
import { fetchPost } from '@/lib/api/posts'

export async function generateMetadata({ 
  params: { locale, slug } 
}: Props): Promise<Metadata> {
  const post = await fetchPost(slug, locale)
  
  if (!post) return {}
  
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title
        }
      ],
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      alternateLocale: locale === 'es' ? 'en_US' : 'es_ES'
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage]
    },
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: {
        'es': `/es/blog/${slug}`,
        'en': `/en/blog/${slug}`
      }
    }
  }
}
```

### Structured Data (JSON-LD)

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
      name: post.author.name,
      url: post.author.url
    },
    publisher: {
      '@type': 'Organization',
      name: 'Stories of Software',
      logo: {
        '@type': 'ImageObject',
        url: 'https://storiesofsoftware.com/logo.png'
      }
    },
    inLanguage: locale,
    isAccessibleForFree: !post.isPremium
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### Sitemap Generation

```typescript
// app/sitemap.ts
import { fetchAllPostSlugs, fetchAllBookSlugs } from '@/lib/api/posts'

export default async function sitemap() {
  const posts = await fetchAllPostSlugs()
  const books = await fetchAllBookSlugs()
  const locales = ['es', 'en']
  
  const postUrls = locales.flatMap(locale =>
    posts.map(slug => ({
      url: `https://storiesofsoftware.com/${locale}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: {
          es: `https://storiesofsoftware.com/es/blog/${slug}`,
          en: `https://storiesofsoftware.com/en/blog/${slug}`
        }
      }
    }))
  )
  
  return [
    {
      url: 'https://storiesofsoftware.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    ...postUrls
    // ... more URLs
  ]
}
```

---

## 🎯 Next Steps

1. **Implementar estructura base** según este documento
2. **Configurar i18n** con next-intl
3. **Crear componentes UI** con shadcn/ui
4. **Desarrollar API client** para backend integration
5. **Implementar autenticación** UI
6. **Optimizar performance** y SEO

---

## 📚 Referencias

- [Next.js App Router](https://nextjs.org/docs/app)
- [next-intl Documentation](https://next-intl-docs.vercel.app)
- [React Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com)
- [Web.dev Performance](https://web.dev/performance)
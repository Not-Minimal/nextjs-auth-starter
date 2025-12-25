# 🚀 Next.js Authentication Starter Template

A production-ready Next.js 16 starter template with **Better Auth**, **Prisma 7**, and **OAuth** (GitHub & Google) pre-configured.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.2-blue)](https://www.prisma.io/)
[![Better Auth](https://img.shields.io/badge/Better%20Auth-1.4-green)](https://better-auth.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## ✨ Features

- ⚡ **Next.js 16** with App Router and Turbopack
- 🔐 **Better Auth** - Modern authentication library
- 🗄️ **Prisma 7** with PostgreSQL driver adapter
- 🎨 **Tailwind CSS 4** for styling
- 📱 **Responsive UI Components** (shadcn/ui inspired)
- 🔑 **Email/Password Authentication**
- 🌐 **OAuth Support** (GitHub & Google pre-configured)
- 🎯 **TypeScript** with full type safety
- 🔒 **Session Management** with secure cookies
- 📊 **Prisma Studio** for database management
- ✅ **Environment Variable Validation**
- 📚 **Comprehensive Documentation**

## 🎯 What's Included

### Authentication Features
- ✅ Email/Password Registration & Login
- ✅ OAuth (GitHub & Google)
- ✅ Session Management
- ✅ Protected Routes
- ✅ User Dashboard
- ✅ Type-safe Auth Hooks

### Database Schema
- **User** - Full user management with roles
- **Session** - Secure session handling
- **Account** - OAuth provider accounts
- **Verification** - Email verification support

### Developer Tools
- `pnpm check-env` - Validate environment variables
- Prisma Studio - Visual database editor
- TypeScript strict mode
- ESLint configuration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (recommended) or npm

### 1. Use This Template

Click the "Use this template" button on GitHub, or:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Better Auth
BETTER_AUTH_SECRET="run: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### 4. Generate Auth Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `BETTER_AUTH_SECRET` in your `.env.local`

### 5. Setup Database

```bash
# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# (Optional) Open Prisma Studio
pnpm prisma studio
```

### 6. Verify Setup

```bash
pnpm check-env
```

You should see all required variables as ✅

### 7. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 🔐 OAuth Setup (Optional)

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Your App Name
   - **Homepage URL**: `http://localhost:3000`
   - **Callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and generate Client Secret
5. Add to `.env.local`

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (if needed)
3. Click "Create Credentials" → "OAuth client ID"
4. Configure OAuth consent screen (if first time)
5. Set:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret
7. Add to `.env.local`

## 📁 Project Structure

```
├── app/
│   ├── api/auth/[...all]/     # Better Auth API routes
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   ├── dashboard/             # Protected dashboard
│   └── layout.tsx             # Root layout
├── components/
│   ├── login-form.tsx         # Login form component
│   ├── register-form.tsx      # Register form component
│   └── ui/                    # UI components
├── lib/
│   ├── auth.ts                # Better Auth server config
│   ├── auth-client.ts         # Better Auth client
│   ├── prisma.ts              # Prisma client with adapter
│   └── utils.ts               # Utilities
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── types/
│   └── auth.ts                # TypeScript types
└── scripts/
    └── check-env.js           # Environment validator
```

## 📝 Available Scripts

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run linter

# Database
pnpm prisma generate       # Generate Prisma Client
pnpm prisma migrate dev    # Create & apply migration
pnpm prisma studio         # Open database GUI
pnpm prisma migrate status # Check migration status

# Utilities
pnpm check-env    # Validate environment variables
```

## 🔧 Configuration

### Customize User Schema

Edit `prisma/schema.prisma`:

```prisma
model User {
  // Add custom fields here
  // Example:
  // companyName String?
  // phoneNumber String?
}
```

Then run:

```bash
pnpm prisma migrate dev --name add_custom_fields
```

### Add More OAuth Providers

Edit `lib/auth.ts`:

```typescript
export const auth = betterAuth({
  socialProviders: {
    github: { /* ... */ },
    google: { /* ... */ },
    // Add more providers
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
    },
  },
});
```

### Customize Roles

Edit the `UserRole` enum in `prisma/schema.prisma`:

```prisma
enum UserRole {
  ADMIN
  EDITOR
  SUBSCRIBER
  READER
  // Add your custom roles
}
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Database ORM**: [Prisma 7](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: Custom (shadcn/ui inspired)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 📚 Documentation

- [Quick Start Guide](./QUICK_START.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Prisma 7 Setup](./PRISMA_7_SETUP.md)
- [OAuth Setup Guide](./OAUTH_SETUP_GUIDE.md)
- [Authentication Guide](./AUTH_SETUP.md)

## 🐛 Troubleshooting

### PrismaClient Error

```bash
pnpm prisma generate
rm -rf .next
pnpm dev
```

### OAuth Not Working

1. Check callback URLs in provider settings
2. Verify environment variables: `pnpm check-env`
3. Clear cache: `rm -rf .next`
4. Restart server

### Database Connection Issues

```bash
# Test connection
pnpm prisma db pull

# Check migration status
pnpm prisma migrate status
```

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more details.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Update OAuth callback URLs to your production domain
5. Deploy!

### Environment Variables for Production

Update these in your hosting platform:

```env
DATABASE_URL="your_production_database_url"
BETTER_AUTH_SECRET="your_production_secret"
BETTER_AUTH_URL="https://yourdomain.com"
GITHUB_CLIENT_ID="production_github_client_id"
GITHUB_CLIENT_SECRET="production_github_client_secret"
GOOGLE_CLIENT_ID="production_google_client_id"
GOOGLE_CLIENT_SECRET="production_google_client_secret"
```

Don't forget to update OAuth callback URLs to your production domain!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this template for any project.

## 🙏 Acknowledgments

- [Better Auth](https://better-auth.com/) - Modern authentication
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI inspiration

## 📞 Support

- Check the [documentation](./QUICK_START.md)
- Run `pnpm check-env` to verify setup
- Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## ⭐ Star This Template

If this template helped you, please consider giving it a star on GitHub!

---

**Made with ❤️ for the Next.js community**

*Last updated: December 2024*
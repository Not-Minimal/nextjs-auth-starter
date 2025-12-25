# Deployment & Infrastructure - Stories of Software

**Versión:** 1.0  
**Stack:** Docker, Docker Compose, Nginx, PostgreSQL, Redis  
**Cloud:** AWS / DigitalOcean / Vercel

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura de Infraestructura](#arquitectura-de-infraestructura)
3. [Docker Setup](#docker-setup)
4. [Base de Datos](#base-de-datos)
5. [Cache y Storage](#cache-y-storage)
6. [Reverse Proxy y SSL](#reverse-proxy-y-ssl)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Monitoring y Logging](#monitoring-y-logging)
9. [Backup y Disaster Recovery](#backup-y-disaster-recovery)
10. [Scaling Strategy](#scaling-strategy)

---

## 🎯 Visión General

La infraestructura de Stories of Software está diseñada para ser:

- **Reproducible**: Infrastructure as Code
- **Escalable**: Horizontal scaling ready
- **Resiliente**: High availability y fault tolerance
- **Monitoreada**: Observabilidad completa
- **Segura**: Security best practices
- **Cost-effective**: Optimización de recursos

### Stack de Infraestructura

```
┌─────────────────────────────────────────────────────────────┐
│                      CLOUD PROVIDER                          │
│                 (AWS / DigitalOcean)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────▼──────┐          ┌────────▼────────┐
        │  CDN/Edge    │          │   DNS Provider  │
        │  Cloudflare  │          │   Cloudflare    │
        └───────┬──────┘          └─────────────────┘
                │
        ┌───────▼──────────────────────────────────────────┐
        │            Load Balancer / Reverse Proxy         │
        │                   Nginx / Caddy                  │
        └───────┬──────────────────────────────────────────┘
                │
        ┌───────┴───────────────────────┐
        │                               │
┌───────▼──────┐              ┌─────────▼────────┐
│   Frontend   │              │    Backend API   │
│   Next.js    │              │   Node.js/Fast.  │
│   (Vercel)   │              │   (Docker)       │
└──────────────┘              └─────────┬────────┘
                                        │
                        ┌───────────────┼───────────────┐
                        │               │               │
                ┌───────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
                │  PostgreSQL  │ │   Redis   │ │     n8n     │
                │   (Docker)   │ │  (Docker) │ │  (Docker)   │
                └──────────────┘ └───────────┘ └─────────────┘
                        │
                ┌───────▼──────┐
                │  S3 Storage  │
                │   (AWS/Min)  │
                └──────────────┘
```

---

## 🏗️ Arquitectura de Infraestructura

### Environments

```yaml
Environments:
  development:
    description: Local development
    infrastructure: Docker Compose
    domain: localhost
    
  staging:
    description: Pre-production testing
    infrastructure: Docker Compose / K8s
    domain: staging.storiesofsoftware.com
    
  production:
    description: Live environment
    infrastructure: Docker Compose / K8s
    domain: storiesofsoftware.com
    cdn: Cloudflare
    backup: Daily automated
```

### Services Overview

| Service | Technology | Port | Purpose |
|---------|-----------|------|---------|
| Frontend | Next.js | 3000 | Web application |
| Backend API | Fastify | 3001 | REST/GraphQL API |
| Database | PostgreSQL 16 | 5432 | Primary data store |
| Cache | Redis 7 | 6379 | Cache & sessions |
| Automation | n8n | 5678 | Workflow automation |
| Storage | MinIO/S3 | 9000 | Object storage |
| Proxy | Nginx | 80/443 | Reverse proxy & SSL |
| Monitoring | Prometheus | 9090 | Metrics collection |
| Visualization | Grafana | 3002 | Dashboards |

---

## 🐳 Docker Setup

### Project Structure

```
/
├── apps/
│   ├── frontend/
│   │   └── Dockerfile
│   ├── api/
│   │   └── Dockerfile
│   └── automation/
│       └── n8n-config/
│
├── docker/
│   ├── nginx/
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── ssl/
│   ├── postgres/
│   │   └── init.sql
│   └── redis/
│       └── redis.conf
│
├── docker-compose.yml
├── docker-compose.prod.yml
└── docker-compose.override.yml
```

### Main Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Frontend - Next.js
  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    container_name: storiesofsoftware-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.storiesofsoftware.com
      - NEXT_PUBLIC_SITE_URL=https://storiesofsoftware.com
    depends_on:
      - api
    networks:
      - storiesofsoftware
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    container_name: storiesofsoftware-api
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/storiesofsoftware
      - REDIS_URL=redis://redis:6379
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - S3_BUCKET=${S3_BUCKET}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - storiesofsoftware
    volumes:
      - api-logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: storiesofsoftware-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=storiesofsoftware
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - storiesofsoftware
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: storiesofsoftware-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
      - ./docker/redis/redis.conf:/usr/local/etc/redis/redis.conf
    networks:
      - storiesofsoftware
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # n8n Automation
  n8n:
    image: n8nio/n8n:latest
    container_name: storiesofsoftware-n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=${N8N_HOST}
      - N8N_PROTOCOL=https
      - N8N_PORT=5678
      - WEBHOOK_URL=https://${N8N_HOST}/
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - GENERIC_TIMEZONE=UTC
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=postgres
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
    volumes:
      - n8n-data:/home/node/.n8n
      - ./apps/automation/workflows:/home/node/.n8n/workflows
    depends_on:
      - postgres
      - redis
    networks:
      - storiesofsoftware

  # MinIO (S3-compatible storage)
  minio:
    image: minio/minio:latest
    container_name: storiesofsoftware-minio
    restart: unless-stopped
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=${MINIO_ROOT_USER}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
    command: server /data --console-address ":9001"
    volumes:
      - minio-data:/data
    networks:
      - storiesofsoftware
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # Nginx Reverse Proxy
  nginx:
    build:
      context: ./docker/nginx
      dockerfile: Dockerfile
    container_name: storiesofsoftware-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/ssl:/etc/nginx/ssl:ro
      - nginx-logs:/var/log/nginx
    depends_on:
      - frontend
      - api
      - n8n
    networks:
      - storiesofsoftware

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
  n8n-data:
    driver: local
  minio-data:
    driver: local
  api-logs:
    driver: local
  nginx-logs:
    driver: local

networks:
  storiesofsoftware:
    driver: bridge
```

### Frontend Dockerfile

```dockerfile
# apps/frontend/Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Backend Dockerfile

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api

COPY --from=builder --chown=api:nodejs /app/dist ./dist
COPY --from=deps --chown=api:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=api:nodejs /app/package.json ./package.json

# Prisma
COPY --from=builder /app/prisma ./prisma

USER api

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

---

## 🗄️ Base de Datos

### PostgreSQL Configuration

```sql
-- docker/postgres/init.sql

-- Create databases
CREATE DATABASE storiesofsoftware;
CREATE DATABASE n8n;

-- Connect to storiesofsoftware database
\c storiesofsoftware;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create custom search configuration
CREATE TEXT SEARCH CONFIGURATION public.simple_unaccent (COPY = simple);
ALTER TEXT SEARCH CONFIGURATION simple_unaccent
  ALTER MAPPING FOR hword, hword_part, word
  WITH unaccent, simple;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_slug_locale ON posts(slug, locale);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_books_slug_locale ON books(slug, locale);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_posts_search 
  ON posts USING GIN (to_tsvector('simple_unaccent', title || ' ' || excerpt || ' ' || content));
```

### Database Backup Script

```bash
#!/bin/bash
# scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
CONTAINER_NAME="storiesofsoftware-postgres"
DB_NAME="storiesofsoftware"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
docker exec $CONTAINER_NAME pg_dump -U postgres $DB_NAME | gzip > $BACKUP_DIR/backup_${DATE}.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/backup_${DATE}.sql.gz s3://storiesofsoftware-backups/postgres/

# Keep only last 30 days locally
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: backup_${DATE}.sql.gz"
```

### Database Restore Script

```bash
#!/bin/bash
# scripts/restore-db.sh

BACKUP_FILE=$1
CONTAINER_NAME="storiesofsoftware-postgres"
DB_NAME="storiesofsoftware"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore-db.sh <backup_file.sql.gz>"
  exit 1
fi

# Download from S3 if needed
if [[ $BACKUP_FILE == s3://* ]]; then
  aws s3 cp $BACKUP_FILE /tmp/restore.sql.gz
  BACKUP_FILE="/tmp/restore.sql.gz"
fi

# Restore database
gunzip -c $BACKUP_FILE | docker exec -i $CONTAINER_NAME psql -U postgres $DB_NAME

echo "Database restored from $BACKUP_FILE"
```

---

## 💾 Cache y Storage

### Redis Configuration

```conf
# docker/redis/redis.conf

# Network
bind 0.0.0.0
protected-mode yes
port 6379

# General
daemonize no
supervised no
pidfile /var/run/redis_6379.pid
loglevel notice

# Persistence
save 900 1
save 300 10
save 60 10000
dir /data

# Memory
maxmemory 512mb
maxmemory-policy allkeys-lru

# Append only file
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec

# Slow log
slowlog-log-slower-than 10000
slowlog-max-len 128

# Security
requirepass ${REDIS_PASSWORD}
```

### S3/MinIO Configuration

```javascript
// apps/api/src/config/storage.ts
import { S3Client } from '@aws-sdk/client-s3'

export const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'https://s3.amazonaws.com',
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true' // For MinIO
})

export const BUCKETS = {
  CONTENT: process.env.S3_BUCKET_CONTENT || 'storiesofsoftware-content',
  IMAGES: process.env.S3_BUCKET_IMAGES || 'storiesofsoftware-images',
  BACKUPS: process.env.S3_BUCKET_BACKUPS || 'storiesofsoftware-backups'
}
```

---

## 🔒 Reverse Proxy y SSL

### Nginx Configuration

```nginx
# docker/nginx/nginx.conf

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=100r/s;

    # Upstream definitions
    upstream frontend {
        server frontend:3000;
    }

    upstream api {
        server api:3001;
    }

    upstream n8n {
        server n8n:5678;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name storiesofsoftware.com www.storiesofsoftware.com;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # Main site (Frontend)
    server {
        listen 443 ssl http2;
        server_name storiesofsoftware.com www.storiesofsoftware.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # API
    server {
        listen 443 ssl http2;
        server_name api.storiesofsoftware.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        location / {
            limit_req zone=api_limit burst=20 nodelay;

            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # n8n
    server {
        listen 443 ssl http2;
        server_name n8n.storiesofsoftware.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        location / {
            proxy_pass http://n8n;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### SSL with Let's Encrypt

```bash
#!/bin/bash
# scripts/setup-ssl.sh

DOMAIN="storiesofsoftware.com"
EMAIL="admin@storiesofsoftware.com"

# Install certbot
sudo apt-get update
sudo apt-get install -y certbot

# Obtain certificate
sudo certbot certonly --standalone \
  -d $DOMAIN \
  -d www.$DOMAIN \
  -d api.$DOMAIN \
  -d n8n.$DOMAIN \
  --email $EMAIL \
  --agree-tos \
  --non-interactive

# Copy certificates
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./docker/nginx/ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./docker/nginx/ssl/

# Set permissions
sudo chmod 644 ./docker/nginx/ssl/fullchain.pem
sudo chmod 600 ./docker/nginx/ssl/privkey.pem

# Setup auto-renewal
(crontab -l 2>/dev/null; echo "0 0 * * * certbot renew --quiet && docker restart storiesofsoftware-nginx") | crontab -

echo "SSL certificates installed successfully"
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run linter
        run: pnpm run lint
        
      - name: Run tests
        run: pnpm run test
        
      - name: Build
        run: pnpm run build

  build-and-push:
    name: Build and Push Docker Images
    runs-on: ubuntu-latest
    needs: test
    
    strategy:
      matrix:
        service: [frontend, api]
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./apps/${{ matrix.service }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build-and-push
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
      
      - name: Deploy to server
        run: |
          ssh -o StrictHostKeyChecking=no ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} << 'EOF'
            cd /opt/storiesofsoftware
            docker-compose pull
            docker-compose up -d --remove-orphans
            docker system prune -af
          EOF
      
      - name: Run database migrations
        run: |
          ssh -o StrictHostKeyChecking=no ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} << 'EOF'
            cd /opt/storiesofsoftware
            docker-compose exec -T api npx prisma migrate deploy
          EOF
      
      - name: Health check
        run: |
          sleep 10
          curl -f https://storiesofsoftware.com/api/health || exit 1
          curl -f https://api.storiesofsoftware.com/health || exit 1
      
      - name: Notify success
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: 'Deployment to production succeeded! 🚀'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      
      - name: Notify failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: 'Deployment to production failed! ❌'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Deployment Script

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Deploying Stories of Software..."

# Load environment variables
if [ -f .env.production ]; then
  export $(cat .env.production | grep -v '#' | awk '/=/ {print $1}')
fi

# Pull latest images
echo "📦 Pulling latest images..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull

# Stop services
echo "🛑 Stopping services..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Start services
echo "▶️  Starting services..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "🔄 Running database migrations..."
docker-compose exec -T api npx prisma migrate deploy

# Health checks
echo "🏥 Running health checks..."
sleep 5

if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "✅ Frontend is healthy"
else
  echo "❌ Frontend health check failed"
  exit 1
fi

if curl -f http://localhost:3001/health > /dev/null 2>&1; then
  echo "✅ API is healthy"
else
  echo "❌ API health check failed"
  exit 1
fi

# Cleanup
echo "🧹 Cleaning up old images..."
docker system prune -af

echo "✅ Deployment completed successfully!"
```

---

## 📊 Monitoring y Logging

### Prometheus Configuration

```yaml
# docker/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'frontend'
    static_configs:
      - targets: ['frontend:3000']
  
  - job_name: 'api'
    static_configs:
      - targets: ['api:3001']
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
  
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
  
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "Stories of Software - System Overview",
    "panels": [
      {
        "title": "HTTP Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
          }
        ]
      },
      {
        "title": "Database Connections",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "targets": [
          {
            "expr": "rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m]))"
          }
        ]
      }
    ]
  }
}
```

### Logging with Winston

```typescript
// apps/api/src/shared/utils/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}
```

---

## 💾 Backup y Disaster Recovery

### Automated Backup System

```bash
#!/bin/bash
# scripts/backup-all.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_ROOT="/backups"

echo "🔄 Starting full backup at $DATE"

# 1. Database backup
echo "📦 Backing up PostgreSQL..."
./scripts/backup-db.sh

# 2. Redis backup
echo "📦 Backing up Redis..."
docker exec storiesofsoftware-redis redis-cli --rdb /data/dump.rdb save
cp /var/lib/docker/volumes/storiesofsoftware_redis-data/_data/dump.rdb $BACKUP_ROOT/redis/dump_${DATE}.rdb

# 3. n8n workflows
echo "📦 Backing up n8n workflows..."
tar -czf $BACKUP_ROOT/n8n/workflows_${DATE}.tar.gz \
  /var/lib/docker/volumes/storiesofsoftware_n8n-data/_data/workflows/

# 4. Upload to S3
echo "☁️  Uploading to S3..."
aws s3 sync $BACKUP_ROOT/ s3://storiesofsoftware-backups/full-backup-${DATE}/

# 5. Cleanup old local backups (keep 7 days)
find $BACKUP_ROOT -type f -mtime +7 -delete

echo "✅ Backup completed successfully"
```

### Disaster Recovery Plan

```yaml
Recovery Time Objective (RTO): 1 hour
Recovery Point Objective (RPO): 24 hours

Steps:
  1. Provision new infrastructure
     - Spin up Docker host
     - Install Docker & Docker Compose
     Duration: 15 minutes
  
  2. Restore from backups
     - Download latest backup from S3
     - Restore PostgreSQL database
     - Restore Redis data
     - Restore n8n workflows
     Duration: 20 minutes
  
  3. Deploy services
     - Pull Docker images
     - Start all services
     - Run health checks
     Duration: 15 minutes
  
  4. Update DNS
     - Point domain to new IP
     - Wait for propagation
     Duration: 10 minutes
  
  Total: ~60 minutes
```

---

## 📈 Scaling Strategy

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  api:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
  
  frontend:
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### Load Balancer Configuration

```nginx
# Nginx upstream with load balancing
upstream api_backend {
    least_conn; # Load balancing method
    
    server api-1:3001;
    server api-2:3001;
    server api-3:3001;
    
    keepalive 32;
}

server {
    location /api {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

### Auto-scaling with Kubernetes (Optional)

```yaml
# k8s/api-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: ghcr.io/storiesofsoftware/api:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "500m"
          limits:
            memory: "512Mi"
            cpu: "1"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## 🔧 Environment Variables

```bash
# .env.production

# Application
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/storiesofsoftware
DB_PASSWORD=<secure_password>

# Redis
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
REDIS_PASSWORD=<secure_password>

# JWT
JWT_ACCESS_SECRET=<random_64_char_string>
JWT_REFRESH_SECRET=<random_64_char_string>

# AWS S3
AWS_ACCESS_KEY_ID=<aws_key>
AWS_SECRET_ACCESS_KEY=<aws_secret>
AWS_REGION=us-east-1
S3_BUCKET_CONTENT=storiesofsoftware-content
S3_BUCKET_IMAGES=storiesofsoftware-images
S3_BUCKET_BACKUPS=storiesofsoftware-backups

# Email
SENDGRID_API_KEY=<sendgrid_key>

# External APIs
MEDIUM_API_TOKEN=<medium_token>
DEVTO_API_KEY=<devto_key>
STRIPE_SECRET_KEY=<stripe_key>
STRIPE_WEBHOOK_SECRET=<stripe_webhook_secret>

# n8n
N8N_HOST=n8n.storiesofsoftware.com
N8N_USER=admin
N8N_PASSWORD=<secure_password>

# Frontend
NEXT_PUBLIC_API_URL=https://api.storiesofsoftware.com
NEXT_PUBLIC_SITE_URL=https://storiesofsoftware.com
```

---

## 📚 Referencias

- [Docker Documentation](https://docs.docker.com)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL High Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [Redis Best Practices](https://redis.io/docs/management/optimization/)
- [Let's Encrypt](https://letsencrypt.org/docs/)
- [Prometheus](https://prometheus.io/docs/)
- [Grafana](https://grafana.com/docs/)

---

**Próximo**: `08-i18n-strategy.md` - Estrategia completa de internacionalización
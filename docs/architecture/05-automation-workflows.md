# Automation Workflows - Stories of Software
## n8n Workflow Architecture

**Versión:** 1.0  
**Platform:** n8n (self-hosted)  
**Propósito:** Automatización de publicación y distribución de contenido

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura de Automatización](#arquitectura-de-automatización)
3. [Workflows Principales](#workflows-principales)
4. [Integraciones](#integraciones)
5. [Triggers y Eventos](#triggers-y-eventos)
6. [Transformaciones de Contenido](#transformaciones-de-contenido)
7. [Error Handling y Retry](#error-handling-y-retry)
8. [Monitoring y Logs](#monitoring-y-logs)

---

## 🎯 Visión General

n8n actúa como el cerebro de automatización de la plataforma, orquestando flujos de trabajo que:

- **Publican contenido** automáticamente en múltiples canales
- **Generan versiones derivadas** (resúmenes, newsletters, extractos)
- **Sincronizan** con plataformas externas (Medium, Dev.to, Hashnode)
- **Envían notificaciones** a suscriptores
- **Gestionan backups** y tareas de mantenimiento

### Principios de Diseño

1. **Event-Driven**: Workflows activados por eventos del backend
2. **Idempotent**: Ejecuciones repetidas producen el mismo resultado
3. **Resilient**: Retry automático con backoff exponencial
4. **Observable**: Logging completo y monitoreo
5. **Maintainable**: Workflows modulares y reutilizables

---

## 🏗️ Arquitectura de Automatización

### Flujo General

```
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND API                              │
│  - Emite eventos vía webhooks                                │
│  - POST /webhooks/n8n/trigger                                │
└────────────────────┬────────────────────────────────────────┘
                     │ Webhook Event
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      n8n INSTANCE                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │            WORKFLOW ORCHESTRATOR                   │     │
│  │  - Recibe evento                                   │     │
│  │  - Valida payload                                  │     │
│  │  - Ejecuta workflow correspondiente                │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Publishing  │  │  Newsletter  │  │   Sync to    │     │
│  │   Workflow   │  │   Workflow   │  │   External   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Requests
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│  [Backend API] [Medium] [Dev.to] [SendGrid] [Stripe]       │
└─────────────────────────────────────────────────────────────┘
```

### Comunicación Backend ↔ n8n

#### 1. Webhook-Based Events

```typescript
// Backend emite evento
POST https://n8n.storiesofsoftware.com/webhook/post-published
Content-Type: application/json
X-API-Key: <n8n_webhook_secret>

{
  "event": "post.published",
  "timestamp": "2025-12-15T10:30:00Z",
  "data": {
    "postId": "clx123456",
    "slug": "clean-code-principles",
    "locale": "en",
    "title": "Clean Code Principles",
    "excerpt": "Learn the fundamental principles...",
    "content": "# Clean Code Principles\n\n...",
    "contentHtml": "<h1>Clean Code Principles</h1>...",
    "coverImage": "https://cdn.example.com/images/clean-code.jpg",
    "author": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "category": "Software Engineering",
    "tags": ["clean-code", "best-practices"],
    "isPremium": false,
    "publishedAt": "2025-12-15T10:30:00Z"
  }
}
```

#### 2. API-Based Triggers

```typescript
// n8n consulta API periódicamente (polling)
GET https://api.storiesofsoftware.com/api/internal/pending-tasks
Authorization: Bearer <n8n_api_token>

Response:
{
  "tasks": [
    {
      "type": "weekly_newsletter",
      "locale": "en",
      "dueAt": "2025-12-15T09:00:00Z"
    }
  ]
}
```

---

## 🔄 Workflows Principales

### 1. Publishing Workflow

**Trigger**: Webhook `post.published`  
**Propósito**: Distribuir artículo a múltiples canales

```yaml
Workflow: Publishing Workflow
ID: workflow-001

Nodes:
  1. Webhook Trigger
     - URL: /webhook/post-published
     - Method: POST
     - Authentication: Header Auth (X-API-Key)
  
  2. Validate Payload
     - Check required fields
     - Validate event type
     - Extract data
  
  3. IF Node: Check Locale
     - Condition: locale === 'en'
     - Route EN/ES paths
  
  4A. Sync to Medium (EN only)
     - HTTP Request Node
     - POST https://api.medium.com/v1/users/{{userId}}/posts
     - Headers:
         Authorization: Bearer {{mediumToken}}
     - Body:
         title: {{data.title}}
         contentFormat: html
         content: {{data.contentHtml}}
         tags: {{data.tags}}
         publishStatus: public
  
  5A. Sync to Dev.to (EN only)
     - HTTP Request Node
     - POST https://dev.to/api/articles
     - Headers:
         api-key: {{devtoApiKey}}
     - Body:
         article:
           title: {{data.title}}
           body_markdown: {{data.content}}
           tags: {{data.tags}}
           published: true
  
  6. Generate Social Media Posts
     - Function Node
     - Extract excerpt
     - Generate tweet
     - Generate LinkedIn post
  
  7. Store Social Content
     - HTTP Request to Backend
     - POST /api/internal/social-queue
     - Save for manual posting
  
  8. Send to Newsletter Queue
     - IF Node: Check if should include in newsletter
     - Add to pending newsletter items
  
  9. Update Backend
     - HTTP Request Node
     - PATCH /api/internal/posts/{{postId}}/sync-status
     - Mark as synced
  
  10. Success Notification
      - Send Slack/Discord notification
      - Log completion

Error Handling:
  - On Error: Retry Node
  - Max Attempts: 3
  - Retry Delay: 60s (exponential backoff)
  - On Final Failure: Send error notification
```

#### Publishing Workflow (Visual)

```
[Webhook]
    │
    ├─> [Validate]
    │       │
    │       ├─> [IF: Locale == EN]
    │       │       │
    │       │       ├─> [Medium API]
    │       │       │       │
    │       │       │       └─> [IF: Success]
    │       │       │               │
    │       │       └─> [Dev.to API]
    │       │               │
    │       │               └─> [IF: Success]
    │       │
    │       └─> [IF: Locale == ES]
    │               │
    │               └─> [Skip External Sync]
    │
    ├─> [Generate Social Content]
    │       │
    │       └─> [Store in Queue]
    │
    ├─> [Add to Newsletter Queue]
    │
    └─> [Update Backend]
            │
            └─> [Notify Success]
```

---

### 2. Newsletter Workflow

**Trigger**: Cron (Weekly - Monday 9:00 AM)  
**Propósito**: Generar y enviar newsletter semanal

```yaml
Workflow: Weekly Newsletter
ID: workflow-002

Nodes:
  1. Cron Trigger
     - Schedule: "0 9 * * 1" (Every Monday at 9 AM)
     - Timezone: UTC
  
  2. Get Recent Posts (Spanish)
     - HTTP Request Node
     - GET /api/posts?locale=es&days=7&status=published
     - Returns: Spanish posts from last 7 days
  
  3. Get Recent Posts (English)
     - HTTP Request Node
     - GET /api/posts?locale=en&days=7&status=published
     - Returns: English posts from last 7 days
  
  4. IF Node: Has Posts?
     - Check if posts.length > 0
     - Skip if no posts
  
  5. Generate Newsletter HTML (Spanish)
     - Function Node
     - Template: newsletter-template-es.html
     - Variables:
         posts: {{spanishPosts}}
         date: {{currentDate}}
         unsubscribeLink: {{unsubscribeUrl}}
  
  6. Generate Newsletter HTML (English)
     - Function Node
     - Template: newsletter-template-en.html
     - Variables:
         posts: {{englishPosts}}
         date: {{currentDate}}
         unsubscribeLink: {{unsubscribeUrl}}
  
  7. Get Subscribers (Spanish)
     - HTTP Request Node
     - GET /api/subscribers?locale=es&active=true
  
  8. Get Subscribers (English)
     - HTTP Request Node
     - GET /api/subscribers?locale=en&active=true
  
  9. Send via SendGrid (Spanish)
     - SendGrid Node
     - To: {{spanishSubscribers}}
     - Subject: "📬 Esta semana en Stories of Software"
     - HTML: {{spanishNewsletterHtml}}
     - From: newsletter@storiesofsoftware.com
     - Batch: 100 emails per request
  
  10. Send via SendGrid (English)
      - SendGrid Node
      - To: {{englishSubscribers}}
      - Subject: "📬 This week at Stories of Software"
      - HTML: {{englishNewsletterHtml}}
      - From: newsletter@storiesofsoftware.com
      - Batch: 100 emails per request
  
  11. Log Newsletter Sent
      - HTTP Request Node
      - POST /api/internal/newsletter-logs
      - Data:
          sentAt: {{timestamp}}
          locale: [es, en]
          postsIncluded: {{postIds}}
          recipientCount: {{totalSubscribers}}
  
  12. Success Notification
      - Slack/Discord notification
      - Summary: "Newsletter sent to {{total}} subscribers"

Error Handling:
  - On SendGrid Error: Retry 3 times
  - On API Error: Log and continue
  - Send error summary at end
```

#### Newsletter Template

```html
<!-- newsletter-template-en.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #1a1a1a; color: white; padding: 20px; }
    .post { border-bottom: 1px solid #eee; padding: 20px 0; }
    .post h2 { margin: 0 0 10px; }
    .footer { text-align: center; padding: 20px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 This Week at Stories of Software</h1>
      <p>{{formattedDate}}</p>
    </div>
    
    {{#each posts}}
    <div class="post">
      {{#if coverImage}}
      <img src="{{coverImage}}" alt="{{title}}" style="max-width: 100%;">
      {{/if}}
      
      <h2><a href="{{url}}">{{title}}</a></h2>
      <p>{{excerpt}}</p>
      
      <p style="color: #666;">
        {{readingTime}} min read • {{category}}
      </p>
      
      <a href="{{url}}" style="color: #0066cc;">Read more →</a>
    </div>
    {{/each}}
    
    <div class="footer">
      <p>You're receiving this because you subscribed to our newsletter.</p>
      <p>
        <a href="{{unsubscribeUrl}}">Unsubscribe</a> | 
        <a href="https://storiesofsoftware.com">Visit Website</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

### 3. Book Chapter Release Workflow

**Trigger**: Webhook `chapter.published`  
**Propósito**: Notificar a compradores sobre nuevo capítulo

```yaml
Workflow: Chapter Release Notification
ID: workflow-003

Nodes:
  1. Webhook Trigger
     - URL: /webhook/chapter-published
     - Event: chapter.published
  
  2. Get Book Details
     - HTTP Request
     - GET /api/books/{{bookId}}
  
  3. Get Book Purchasers
     - HTTP Request
     - GET /api/internal/purchases?resourceType=BOOK&resourceId={{bookId}}
     - Returns list of users who purchased the book
  
  4. Generate Email Content
     - Function Node
     - Subject: "New chapter available: {{chapterTitle}}"
     - Body: Template with chapter details
  
  5. Send Email to Purchasers
     - SendGrid Node
     - To: {{purchasers}}
     - Personalization: User name, chapter link
  
  6. Log Notification
     - POST /api/internal/notification-logs
  
  7. Success
     - Notify admin
```

---

### 4. Sync Status Monitor Workflow

**Trigger**: Cron (Every hour)  
**Propósito**: Verificar estado de sincronización externa

```yaml
Workflow: Sync Status Monitor
ID: workflow-004

Nodes:
  1. Cron Trigger
     - Schedule: "0 * * * *" (Every hour)
  
  2. Get Posts Pending Sync
     - HTTP Request
     - GET /api/internal/posts?syncStatus=pending
  
  3. For Each Post
     - Loop Node
  
  4. Check Medium Status
     - HTTP Request
     - GET Medium API to verify post exists
  
  5. Check Dev.to Status
     - HTTP Request
     - GET Dev.to API to verify article exists
  
  6. Update Sync Status
     - If synced: Update backend
     - If failed: Retry or alert
  
  7. Generate Report
     - Function Node
     - Summary of sync status
  
  8. Send Report
     - Slack notification if issues found
```

---

### 5. Content Backup Workflow

**Trigger**: Cron (Daily - 2:00 AM)  
**Propósito**: Backup de contenido a S3

```yaml
Workflow: Daily Content Backup
ID: workflow-005

Nodes:
  1. Cron Trigger
     - Schedule: "0 2 * * *" (Daily at 2 AM)
  
  2. Get All Published Content
     - HTTP Request
     - GET /api/internal/export/all
     - Returns: JSON with all posts, books, chapters
  
  3. Generate Backup File
     - Function Node
     - Format: JSON + timestamp
     - Filename: backup-YYYY-MM-DD.json
  
  4. Upload to S3
     - AWS S3 Node
     - Bucket: storiesofsoftware-backups
     - Path: /daily/{{timestamp}}
  
  5. Verify Upload
     - Check file exists in S3
  
  6. Cleanup Old Backups
     - Delete backups older than 30 days
  
  7. Success Notification
     - Log backup completion
     - Send summary email
```

---

## 🔗 Integraciones

### Medium API

```javascript
// n8n Function Node: Prepare Medium Post
const post = {
  title: $node["Webhook"].json["data"]["title"],
  contentFormat: "html",
  content: $node["Webhook"].json["data"]["contentHtml"],
  tags: $node["Webhook"].json["data"]["tags"].slice(0, 5), // Max 5 tags
  publishStatus: "public",
  canonicalUrl: `https://storiesofsoftware.com/en/blog/${$node["Webhook"].json["data"]["slug"]}`
};

return { json: post };
```

**HTTP Request Configuration:**
- Method: POST
- URL: `https://api.medium.com/v1/users/{{userId}}/posts`
- Headers:
  - `Authorization: Bearer {{mediumToken}}`
  - `Content-Type: application/json`
- Response: Store `mediumPostId` in backend

---

### Dev.to API

```javascript
// n8n Function Node: Prepare Dev.to Article
const article = {
  article: {
    title: $node["Webhook"].json["data"]["title"],
    body_markdown: $node["Webhook"].json["data"]["content"],
    tags: $node["Webhook"].json["data"]["tags"].slice(0, 4), // Max 4 tags
    published: true,
    canonical_url: `https://storiesofsoftware.com/en/blog/${$node["Webhook"].json["data"]["slug"]}`
  }
};

return { json: article };
```

**HTTP Request Configuration:**
- Method: POST
- URL: `https://dev.to/api/articles`
- Headers:
  - `api-key: {{devtoApiKey}}`
  - `Content-Type: application/json`

---

### Hashnode API

```javascript
// n8n Function Node: Prepare Hashnode Post
const mutation = `
  mutation CreateStory($input: CreateStoryInput!) {
    createPublicationStory(input: $input) {
      code
      success
      message
      post {
        _id
        slug
      }
    }
  }
`;

const variables = {
  input: {
    title: $node["Webhook"].json["data"]["title"],
    contentMarkdown: $node["Webhook"].json["data"]["content"],
    tags: $node["Webhook"].json["data"]["tags"].map(tag => ({ name: tag })),
    publicationId: "{{hashnodePublicationId}}"
  }
};

return { 
  json: {
    query: mutation,
    variables: variables
  }
};
```

**HTTP Request Configuration:**
- Method: POST
- URL: `https://api.hashnode.com`
- Headers:
  - `Authorization: {{hashnodeApiKey}}`
  - `Content-Type: application/json`

---

### SendGrid Email

```javascript
// n8n Function Node: Prepare SendGrid Email
const subscribers = $node["Get Subscribers"].json;

const personalizations = subscribers.map(sub => ({
  to: [{ email: sub.email }],
  substitutions: {
    "-name-": sub.name || "Reader",
    "-unsubscribeUrl-": `https://storiesofsoftware.com/unsubscribe?token=${sub.token}`
  }
}));

return {
  json: {
    personalizations: personalizations,
    from: { email: "newsletter@storiesofsoftware.com", name: "Stories of Software" },
    subject: "📬 This week at Stories of Software",
    content: [{
      type: "text/html",
      value: $node["Generate HTML"].json["html"]
    }]
  }
};
```

---

## ⚡ Triggers y Eventos

### Event Types

```typescript
// Backend Event Types
type EventType = 
  | 'post.published'
  | 'post.updated'
  | 'post.deleted'
  | 'book.published'
  | 'chapter.published'
  | 'purchase.completed'
  | 'user.subscribed'
  | 'user.unsubscribed'

interface Event {
  event: EventType
  timestamp: string
  data: Record<string, any>
  metadata?: {
    userId?: string
    source?: string
  }
}
```

### Webhook Security

```javascript
// n8n Webhook Authentication
// Node: Validate Webhook

const expectedSignature = $node["Webhook"].json["headers"]["x-webhook-signature"];
const secret = "{{webhookSecret}}";
const payload = JSON.stringify($node["Webhook"].json["body"]);

const crypto = require('crypto');
const calculatedSignature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

if (expectedSignature !== calculatedSignature) {
  throw new Error("Invalid webhook signature");
}

return $node["Webhook"].json;
```

---

## 🔄 Transformaciones de Contenido

### Generar Resumen Automático

```javascript
// n8n Function Node: Generate Summary
const content = $node["Webhook"].json["data"]["content"];

// Extract first paragraph as summary
const firstParagraph = content
  .split('\n\n')
  .find(p => p.trim().length > 50 && !p.startsWith('#'));

// Or use excerpt if available
const summary = $node["Webhook"].json["data"]["excerpt"] || firstParagraph;

// Generate tweet (280 chars)
const tweet = summary.length > 250
  ? summary.substring(0, 247) + "..."
  : summary;

// Generate LinkedIn post
const linkedInPost = `${$node["Webhook"].json["data"]["title"]}\n\n${summary}\n\nRead more: https://storiesofsoftware.com/en/blog/${$node["Webhook"].json["data"]["slug"]}`;

return {
  json: {
    summary: summary,
    tweet: tweet,
    linkedIn: linkedInPost
  }
};
```

### Adaptación de Markdown para Diferentes Plataformas

```javascript
// n8n Function Node: Adapt Markdown
const markdown = $node["Webhook"].json["data"]["content"];
const platform = "medium"; // or "devto", "hashnode"

let adaptedMarkdown = markdown;

if (platform === "medium") {
  // Medium doesn't support some markdown features
  // Convert code blocks to Medium's format
  adaptedMarkdown = markdown.replace(/```(\w+)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `\`\`\`\n${code}\`\`\``;
  });
}

if (platform === "devto") {
  // Dev.to specific adjustments
  // Add liquid tags for enhanced features
  adaptedMarkdown = markdown.replace(/^# (.+)$/m, '# $1\n\n{% link https://storiesofsoftware.com %}');
}

return { json: { markdown: adaptedMarkdown } };
```

---

## ❌ Error Handling y Retry

### Retry Strategy

```javascript
// n8n Settings per Node
{
  "retryOnFail": true,
  "maxTries": 3,
  "waitBetweenTries": 60000, // 60 seconds
  "continueOnFail": false
}
```

### Error Notification

```javascript
// n8n Function Node: Handle Error
const error = $node["Previous Node"].json["error"];

const errorNotification = {
  workflow: "{{$workflow.name}}",
  execution: "{{$execution.id}}",
  error: error.message,
  timestamp: new Date().toISOString(),
  details: {
    node: error.node,
    data: error.data
  }
};

// Send to Slack
return { json: errorNotification };
```

### Fallback Actions

```yaml
Error Handling Strategy:

1. Medium Sync Fails:
   - Retry 3 times with exponential backoff
   - If still fails: Mark as "sync_pending" in backend
   - Continue with other platforms
   - Send notification to admin

2. Email Send Fails:
   - Retry failed batches
   - Log failed recipients
   - Don't block entire workflow

3. API Timeout:
   - Increase timeout to 30s
   - Retry with longer delay
   - If persists: Alert admin

4. Invalid Data:
   - Log error details
   - Skip item and continue
   - Send validation report
```

---

## 📊 Monitoring y Logs

### Execution Logs

```javascript
// n8n Function Node: Log Execution
const logEntry = {
  workflow: "{{$workflow.name}}",
  execution: "{{$execution.id}}",
  status: "success",
  duration: "{{$execution.duration}}",
  data: {
    postId: $node["Webhook"].json["data"]["postId"],
    locale: $node["Webhook"].json["data"]["locale"],
    synced: {
      medium: $node["Medium Sync"]?.json?.success || false,
      devto: $node["DevTo Sync"]?.json?.success || false
    }
  },
  timestamp: new Date().toISOString()
};

// Send to logging service
return { json: logEntry };
```

### Metrics to Track

```yaml
Metrics:
  - Total workflow executions
  - Success rate per workflow
  - Average execution time
  - External API success rate
  - Email delivery rate
  - Sync failures by platform
  - Error frequency by type

Alerts:
  - Success rate < 95%
  - Execution time > 5 minutes
  - 3+ consecutive failures
  - API rate limit reached
```

### Dashboard Queries

```javascript
// Weekly Report Query
{
  workflows: [
    {
      name: "Publishing Workflow",
      executions: 24,
      success: 23,
      failed: 1,
      avgDuration: "45s"
    },
    {
      name: "Newsletter Workflow",
      executions: 1,
      success: 1,
      failed: 0,
      avgDuration: "2m 30s"
    }
  ],
  totalPosts: 24,
  totalEmails: 1250,
  syncStatus: {
    medium: { success: 20, failed: 4 },
    devto: { success: 22, failed: 2 }
  }
}
```

---

## 🔧 Configuration Management

### Environment Variables

```env
# n8n Configuration
N8N_HOST=n8n.storiesofsoftware.com
N8N_PROTOCOL=https
N8N_PORT=443

# Backend API
BACKEND_API_URL=https://api.storiesofsoftware.com
BACKEND_API_TOKEN=<secure_token>
WEBHOOK_SECRET=<webhook_secret>

# External APIs
MEDIUM_API_TOKEN=<medium_token>
MEDIUM_USER_ID=<medium_user_id>

DEVTO_API_KEY=<devto_key>

HASHNODE_API_KEY=<hashnode_key>
HASHNODE_PUBLICATION_ID=<publication_id>

# Email
SENDGRID_API_KEY=<sendgrid_key>

# Storage
AWS_ACCESS_KEY_ID=<aws_key>
AWS_SECRET_ACCESS_KEY=<aws_secret>
S3_BUCKET=storiesofsoftware-backups

# Notifications
SLACK_WEBHOOK_URL=<slack_webhook>
DISCORD_WEBHOOK_URL=<discord_webhook>
```

---

## 📚 Best Practices

### 1. Idempotency

```javascript
// Always check if action already performed
const postId = $node["Webhook"].json["data"]["postId"];

// Check if already synced to Medium
const syncStatus = await fetch(
  `${process.env.BACKEND_API_URL}/api/internal/sync-status/${postId}`
);

if (syncStatus.mediumId) {
  // Already synced, skip
  return { json: { skipped: true, reason: "already_synced" } };
}

// Proceed with sync...
```

### 2. Rate Limiting

```javascript
// Add delays between batch operations
const subscribers = $node["Get Subscribers"].json;
const batchSize = 100;

for (let i = 0; i < subscribers.length; i += batchSize) {
  const batch = subscribers.slice(i, i + batchSize);
  
  // Send batch
  await sendBatch(batch);
  
  // Wait before next batch
  if (i + batchSize < subscribers.length) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
  }
}
```

### 3. Data Validation

```javascript
// Always validate incoming data
const requiredFields = ['postId', 'slug', 'locale', 'title', 'content'];

for (const field of requiredFields) {
  if (!$node["Webhook"].json["data"][field]) {
    throw new Error(`Missing required field: ${field}`);
  }
}
```

### 4. Graceful Degradation

```javascript
// Continue workflow even if optional step fails
try {
  await syncToMedium();
} catch (error) {
  console.log("Medium sync failed, continuing...", error);
  // Log error but don't throw
}

// Continue with rest of workflow
await syncToDevTo();
```

---

## 🚀 Deployment

### Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=${N8N_HOST}
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://${N8N_HOST}/
      - GENERIC_TIMEZONE=America/New_York
    volumes:
      - n8n_data:/home/node/.n8n
      - ./workflows:/home/node/.n8n/workflows
    networks:
      - storiesofsoftware

volumes:
  n8n_data:

networks:
  storiesofsoftware:
    external: true
```

---

## 📚 Referencias

- [n8n Documentation](https://docs.n8n.io)
- [Medium API](https://github.com/Medium/medium-api-docs)
- [Dev.to API](https://developers.forem.com/api)
- [Hashnode API](https://api.hashnode.com)
- [SendGrid API](https://docs.sendgrid.com/api-reference)

---

**Próximo**: `06-deployment-infrastructure.md` - Infraestructura y despliegue

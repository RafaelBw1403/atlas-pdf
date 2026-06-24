# Editor HTML → PDF

Plataforma SaaS para diseñar plantillas HTML profesionales y convertirlas a PDF bajo demanda.

## Arquitectura

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend    │────▶│ Servicio PDF│
│  (React)    │     │ (Express +   │     │ (WeasyPrint) │
│  :5174 dev  │     │  Apollo GQL) │     │  :3001      │
└─────────────┘     └──────────────┘     └─────────────┘
      │                    │
      ▼                    ▼
  Navegador            API Externa
```

| Servicio | Puerto (dev) | Stack |
|----------|-------------|-------|
| **Frontend** (`EditorReportes/`) | 5174 | React 18, Vite, Ant Design, Apollo Client, Monaco Editor, Zustand |
| **Backend** (`EditorReportesBack/`) | 4000 | Express, Apollo Server, TypeORM (PostgreSQL), Mongoose (MongoDB), BullMQ (Redis) |
| **PDF Service** (`pdf-service/`) | 3001 | Express, WeasyPrint |

## Requisitos

- Node.js 18+
- Docker & Docker Compose
- Yarn (para el frontend)
- npm (para backend y pdf-service)

## Levantar en desarrollo

```bash
# 1. Clonar el repositorio
git clone <url> && cd editor-html-pdf

# 2. Variables de entorno
cp .env.example .env
# Editar .env según tu configuración

# 3. Infraestructura (MongoDB, PostgreSQL, Redis, pdf-service)
docker compose up -d mongodb postgres redis pdf-service

# 4. Setup de base de datos (solo la primera vez)
cd EditorReportesBack
npm run schemas
npm run seeds

# 5. Backend (hot-reload)
npm run dev
# → http://localhost:4000

# 6. Frontend (otra terminal)
cd EditorReportes
yarn dev
# → http://localhost:5174
```

## Variables de Entorno

Todas las variables se definen en el archivo `.env` de la raíz del proyecto.
Ver `.env.example` para un template completo.

### Docker Compose

| Variable | Default | Descripción |
|----------|---------|-------------|
| `MONGO_USER` | `admin` | Usuario de MongoDB |
| `MONGO_PASS` | `password123` | Contraseña de MongoDB |
| `POSTGRES_USER` | `admin` | Usuario de PostgreSQL |
| `POSTGRES_PASS` | `password123` | Contraseña de PostgreSQL |
| `HTTP_PORT` | `80` | Puerto HTTP del reverse proxy (producción) |
| `HTTPS_PORT` | `443` | Puerto HTTPS (producción, requiere SSL) |

### Backend — Conexiones

| Variable | Default | Descripción |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Modo del backend (`development` para dev local) |
| `PORT` | `4000` | Puerto del servidor Express |
| `MONGODB_URI` | `mongodb://...` | URI de conexión a MongoDB (almacena plantillas, carpetas, documentos) |
| `POSTGRES_URI` | `postgresql://...` | URI de conexión a PostgreSQL (almacena usuarios, auth, suscripciones, facturación) |
| `REDIS_HOST` | `localhost` | Host de Redis (colas BullMQ + SSE) |
| `REDIS_PORT` | `6379` | Puerto de Redis |
| `REDIS_PASSWORD` | (vacío) | Contraseña de Redis |
| `REDIS_DB` | `0` | Base de datos de Redis |
| `BASE_URL` | `http://localhost:4000` | URL pública base de la API. Usada para construir URLs de descarga en webhooks y SSE. En producción: `https://api.atlas-pdf.com` |
| `PDF_SERVICE_URL` | `http://localhost:3001` | URL interna del servicio PDF. En Docker: `http://pdf-service:3001` |
| `FRONTEND_URL` | `http://localhost:5174` | URL del frontend (usada en emails de recuperación de contraseña) |

### Backend — JWT y Seguridad

| Variable | Default | Descripción |
|----------|---------|-------------|
| `JWT_SECRET` | — | Clave secreta para firmar tokens JWT de autenticación |
| `JWT_REFRESH_SECRET` | — | Clave secreta para firmar refresh tokens |
| `ALTCHA_HMAC_KEY` | — | Clave HMAC para ALTCHA (protección anti-bot en registro y login) |
| `MAX_RECOVERY_ATTEMPTS_24H` | `3` | Intentos máximos de recuperación de contraseña en 24 horas |
| `WEBHOOK_SECRET` | `fallback_secret` | Secreto para firmar respuestas de webhook (HMAC-SHA256) |

### Backend — Configuración del Proyecto

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PROJECT_MODE` | `saas` | `saas`: validación completa con API keys y suscripciones. `local`: modo simplificado |
| `DEFAULT_USER_PASSWORD` | `contrasena123` | Contraseña por defecto al restablecer o crear usuarios |
| `CORS_ORIGIN` | `http://localhost:3000` | Origen permitido para CORS |

### Backend — Rate Limit

| Variable | Default | Descripción |
|----------|---------|-------------|
| `ENABLE_RATE_LIMIT` | `true` | Activar o desactivar límite de tasa |
| `PDF_LIMIT_PER_HOUR` | `100` | Máximo de PDFs por hora por API key |

### Backend — Cola de PDF (BullMQ)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `QUEUE_CONCURRENCY` | `3` | Número de jobs de PDF que se procesan en paralelo |
| `QUEUE_DURATION` | `310000` | Tiempo máximo de ejecución por job (5 minutos en ms) |
| `QUEUE_DELAY` | `500` | Delay entre reintentos (ms) |
| `QUEUE_ATTEMPTS` | `3` | Número de reintentos antes de marcar un job como fallido |
| `QUEUE_LOCK_RENEW_TIME` | `15000` | Tiempo de renovación del lock del worker (ms) |

### Backend — Google Cloud Storage

| Variable | Default | Descripción |
|----------|---------|-------------|
| `GCP_PROJECT_ID` | — | ID del proyecto en Google Cloud |
| `GCP_BUCKET_NAME` | — | Nombre del bucket GCS para almacenar PDFs generados |
| `GCP_KEY_PATH` | — | Ruta al archivo JSON de service account de GCP |

### Backend — Brevo (Emails)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `USE_BREVO` | `true` | Activar o desactivar envío de emails vía Brevo |
| `BREVO_API_KEY` | — | API key de Brevo para envío de emails transaccionales |
| `BREVO_SENDER_MAIL` | — | Dirección email del remitente |
| `BREVO_SENDER_NAME` | `PDF Service` | Nombre del remitente |

### Backend — PDF Generation

| Variable | Default | Descripción |
|----------|---------|-------------|
| `INLINE_IMAGES_IGNORE_SSL` | `true` | Ignorar errores SSL al incrustar imágenes en el HTML |
| `WEBHOOK_ALLOW_SELFSIGNED` | `true` | Permitir envío de webhooks a URLs con SSL autofirmado |

### Backend — Cron Jobs

| Variable | Default | Descripción |
|----------|---------|-------------|
| `CLEANUP_CRON_SCHEDULE` | `*/1 * * * *` | Expresión cron para limpieza de archivos temporales |

### PDF Service

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PDF_SERVICE_PORT` | `3001` | Puerto del servicio PDF |
| `WEASYPRINT_PATH` | `weasyprint` | Ruta al binario de WeasyPrint |
| `WEASYPRINT_TIMEOUT` | `60000` | Timeout de conversión HTML → PDF (ms) |

### Frontend (variables build-time de Vite)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_API_BACK_URL` | (vacío) | URL base del backend. Vacío = misma origen. En dev: `http://localhost:4000` |
| `VITE_GRAPHQL_URL` | `/graphql` | Endpoint de GraphQL |
| `VITE_API_PDF_URL` | `/api/pdf` | Endpoint de descarga de PDFs |
| `VITE_PROJECT_MODE` | `saas` | Modo del frontend |

## Comandos Útiles

| Servicio | Comando | Efecto |
|----------|---------|--------|
| Frontend | `yarn dev` | Inicia Vite en :5174 con hot-reload |
| Frontend | `yarn build` | Build de producción a `dist/` |
| Frontend | `yarn lint` | ESLint sobre archivos `.js/.jsx` |
| Backend | `npm run dev` | Inicia con `tsx watch` (hot-reload) |
| Backend | `npm run build` | Compila TypeScript a `dist/` |
| Backend | `npm run schemas` | Crea esquemas en las bases de datos |
| Backend | `npm run seeds` | Siembra datos iniciales (planes, features) |
| Backend | `npm run migrate:stage` | Migra campos `is_draft`/`is_qa`/`is_production` al campo unificado `stage` |
| Backend | `npm run start` | Inicia en producción (`node dist/index.js`) |
| pdf-service | `npm run dev` | Inicia con `tsx watch` |
| pdf-service | `npm run build` | Compila TypeScript a `dist/` |

## Deploy en Producción

Ver `.agent/plan-deploy.md` para el plan completo de Docker Compose unificado.

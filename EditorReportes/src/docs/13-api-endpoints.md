# API — Llamadas disponibles

Todas las llamadas se hacen a la URL base del servidor (por ejemplo `https://api.atlas-pdf.com` en producción o `http://localhost:4000` en desarrollo).
Los ejemplos usan textos genéricos — reemplázalos con tus valores reales.

---

## Generar PDF por ID de grupo (recomendado)

Usa esta llamada cuando quieras el PDF de la versión activa de una etapa específica.

```
POST /api/pdf/generatePdfByGroup
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `apiKey` | string | Sí | Tu llave de API (development o production) |
| `id` | string | Sí | ID de grupo del documento |
| `stage` | string | Sí | `draft`, `qa`, `production` o `historical` |
| `data` | object | Sí | Objeto JSON con los datos de la plantilla |
| `deleteImmediately` | boolean | No | Eliminar el PDF después de la primera descarga (default: `false`) |
| `expiresInMinutes` | number | No | Tiempo de expiración del PDF en minutos (default: `5`, mínimo: `1`) |

**Respuesta (202 Accepted):**
```json
{
  "success": true,
  "jobId": "uuid-del-trabajo",
  "status": "queued",
  "message": "PDF generation started",
  "dataSource": "provided",
  "sseUrl": "/api/sse/pdf-status/uuid-del-trabajo"
}
```

**cURL:**
```bash
curl -X POST http://localhost:4000/api/pdf/generatePdfByGroup \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "tu-api-key",
    "id": "tu-id-de-grupo",
    "stage": "production",
    "data": { "cliente": "Empresa Ejemplo", "fecha": "2026-06-17" }
  }'
```

**fetch (JavaScript):**
```javascript
const response = await fetch('http://localhost:4000/api/pdf/generatePdfByGroup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: 'tu-api-key',
    id: 'tu-id-de-grupo',
    stage: 'production',
    data: { cliente: 'Empresa Ejemplo', fecha: '2026-06-17' }
  })
});
const resultado = await response.json();
console.log(resultado.sseUrl); // Ej: "/api/sse/pdf-status/uuid-del-trabajo"
```

---

## Generar PDF por ID de versión

Usa esta llamada solo cuando necesites el PDF de una versión específica.

```
POST /api/pdf/generatePdf
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `apiKey` | string | Sí | Tu llave de API |
| `documentId` | string | Sí | ID de la versión específica |
| `data` | object | No | Objeto JSON con los datos. Si no se envía, se usan los `sampleData` del documento |
| `deleteImmediately` | boolean | No | Eliminar el PDF después de la primera descarga (default: `false`) |
| `expiresInMinutes` | number | No | Tiempo de expiración del PDF en minutos (default: `5`, mínimo: `1`) |

> **Importante**: este ID pertenece a una versión en particular. Si esa versión se elimina o se reemplaza, el ID dejará de funcionar y tendrás que actualizar tu llamada. Siempre que puedas, usa el método por ID de grupo + etapa.

**Respuesta (202 Accepted):**
```json
{
  "success": true,
  "jobId": "uuid-del-trabajo",
  "status": "queued",
  "message": "PDF generation started",
  "dataSource": "provided",
  "sseUrl": "/api/sse/pdf-status/uuid-del-trabajo"
}
```

**cURL:**
```bash
curl -X POST http://localhost:4000/api/pdf/generatePdf \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "tu-api-key",
    "documentId": "tu-id-de-version",
    "data": { "cliente": "Empresa Ejemplo" }
  }'
```

**fetch (JavaScript):**
```javascript
const response = await fetch('http://localhost:4000/api/pdf/generatePdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: 'tu-api-key',
    documentId: 'tu-id-de-version',
    data: { cliente: 'Empresa Ejemplo' }
  })
});
const resultado = await response.json();
console.log(resultado.sseUrl); // URL para escuchar el progreso
```

---

## Generar PDF con webhook por ID de versión

Para procesos batch o cuando no quieras mantener una conexión abierta esperando el PDF.

```
POST /api/pdf/generatePdfWebhook
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `apiKey` | string | Sí | Tu llave de API |
| `id` | string | Sí | ID de la versión |
| `webhookUrl` | string | Sí | URL donde recibirás el resultado vía POST |
| `data` | object | No | Objeto JSON con los datos. Si no se envía, se usan los `sampleData` del documento |
| `deleteImmediately` | boolean | No | Eliminar el PDF después de la primera descarga (default: `false`) |
| `expiresInMinutes` | number | No | Tiempo de expiración del PDF en minutos (default: `5`, mínimo: `1`) |

**Respuesta (202 Accepted):**
```json
{
  "success": true,
  "jobId": "uuid-del-trabajo",
  "status": "queued",
  "message": "PDF generation started",
  "dataSource": "provided"
}
```

> **Nota**: A diferencia de los endpoints SSE, esta respuesta **no incluye** `sseUrl`. El resultado se entrega vía webhook.

### Formato del webhook

Cuando el PDF esté listo, el servidor hará un POST a tu `webhookUrl` con el siguiente payload:

```json
{
  "event": "pdf.completed",
  "jobId": "uuid-del-trabajo",
  "slug": "slug-del-pdf",
  "url": "{BASE_URL}/api/pdf/v/slug-del-pdf",
  "timestamp": "2026-06-19T12:00:00.000Z"
}
```

**Headers de la solicitud webhook:**
| Header | Descripción |
|--------|-------------|
| `Content-Type` | `application/json` |
| `X-SaaS-Signature` | HMAC-SHA256 del payload. Usa esta firma para verificar que la solicitud proviene del servidor |

> **Verificación**: Tu servidor debe calcular el HMAC-SHA256 del cuerpo recibido usando el `WEBHOOK_SECRET` compartido y compararlo con el header `X-SaaS-Signature`.

**cURL:**
```bash
curl -X POST http://localhost:4000/api/pdf/generatePdfWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "tu-api-key",
    "id": "tu-id-de-version",
    "webhookUrl": "https://tu-servidor.com/recibir-pdf",
    "data": { "cliente": "Empresa Ejemplo" }
  }'
```

**fetch (JavaScript):**
```javascript
const response = await fetch('http://localhost:4000/api/pdf/generatePdfWebhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: 'tu-api-key',
    id: 'tu-id-de-version',
    webhookUrl: 'https://tu-servidor.com/recibir-pdf',
    data: { cliente: 'Empresa Ejemplo' }
  })
});
const resultado = await response.json();
```

---

## Generar PDF con webhook por grupo + etapa

Para procesos batch donde quieras generar el PDF de la versión activa de una etapa específica.

```
POST /api/pdf/generatePdfWebhookByGroup
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `apiKey` | string | Sí | Tu llave de API |
| `idGroup` | string | Sí | ID de grupo del documento |
| `stage` | string | Sí | `draft`, `qa`, `production` o `historical` |
| `webhookUrl` | string | Sí | URL donde recibirás el resultado vía POST |
| `data` | object | No | Objeto JSON con los datos. Si no se envía, se usan los `sampleData` del documento |
| `deleteImmediately` | boolean | No | Eliminar el PDF después de la primera descarga (default: `false`) |
| `expiresInMinutes` | number | No | Tiempo de expiración del PDF en minutos (default: `5`, mínimo: `1`) |

**Respuesta (202 Accepted):**
```json
{
  "success": true,
  "jobId": "uuid-del-trabajo",
  "status": "queued",
  "message": "PDF generation started",
  "dataSource": "provided"
}
```

> **Nota**: Esta respuesta **no incluye** `sseUrl`. El resultado se entrega vía webhook con el mismo formato y firma descritos en la sección anterior.

**cURL:**
```bash
curl -X POST http://localhost:4000/api/pdf/generatePdfWebhookByGroup \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "tu-api-key",
    "idGroup": "tu-id-de-grupo",
    "stage": "production",
    "webhookUrl": "https://tu-servidor.com/recibir-pdf",
    "data": { "cliente": "Empresa Ejemplo" }
  }'
```

**fetch (JavaScript):**
```javascript
const response = await fetch('http://localhost:4000/api/pdf/generatePdfWebhookByGroup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: 'tu-api-key',
    idGroup: 'tu-id-de-grupo',
    stage: 'production',
    webhookUrl: 'https://tu-servidor.com/recibir-pdf',
    data: { cliente: 'Empresa Ejemplo' }
  })
});
const resultado = await response.json();
```

---

## Descargar el PDF generado

Una vez que el PDF ha sido generado (vía SSE o webhook), puedes descargarlo usando el `slug` recibido.

```
GET /api/pdf/v/:slug
```

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `slug` | string (path) | Sí | Slug del PDF devuelto en el evento `completado` o en el webhook |

**Respuesta:**
- **200 OK**: Binario PDF (`Content-Type: application/pdf`)
- **400 Bad Request**: Slug no proporcionado
- **404 Not Found**: Archivo no encontrado
- **410 Gone**: El archivo ha expirado (si se usó `deleteImmediately: true`, se elimina inmediatamente después de entregarse al cliente)

---

## Escuchar el progreso (SSE)

Cuando inicias la generación de un PDF mediante los endpoints SSE (`generatePdfByGroup` o `generatePdf`), la respuesta incluye un `sseUrl`. Conéctate a esa URL para recibir actualizaciones en tiempo real.

**Endpoint SSE:**
```
GET /api/sse/pdf-status/:jobId
```

Donde `:jobId` es el UUID recibido en la respuesta del endpoint de generación.

### Eventos SSE

| Evento | Cuándo ocurre | Payload |
|--------|--------------|---------|
| `connected` | Conexión establecida | `{ message, jobId }` |
| `progreso` | Avance del proceso | `{ etapa: string, porcentaje: number, mensaje: string }` |
| `completado` | PDF generado exitosamente | `{ success: true, slug: string, url: string, message: string }` |
| `error` | Error durante la generación | `{ success: false, message: string, status: number }` |
| `timeout` | Conexión expiró (5 min) | `{ message: string }` |

**Ejemplo completo:**
```javascript
// 1. Iniciar la generación
const res = await fetch('http://localhost:4000/api/pdf/generatePdfByGroup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: 'tu-api-key',
    id: 'tu-id-de-grupo',
    stage: 'production',
    data: { cliente: 'Empresa Ejemplo' }
  })
});
const { sseUrl } = await res.json();

// 2. Conectarse al progreso
const source = new EventSource(sseUrl);

source.addEventListener('connected', (e) => {
  console.log('Conectado:', e.data);
});

source.addEventListener('progreso', (e) => {
  const data = JSON.parse(e.data);
  console.log(`${data.porcentaje}% — ${data.mensaje}`);
});

source.addEventListener('completado', (e) => {
  const data = JSON.parse(e.data);
  console.log('PDF listo:', data.url);
  // Descargar: GET /api/pdf/v/{data.slug}
  source.close();
});

source.addEventListener('error', (e) => {
  const data = JSON.parse(e.data);
  console.error('Error:', data.message);
  source.close();
});

source.addEventListener('timeout', (e) => {
  const data = JSON.parse(e.data);
  console.error('Tiempo de espera agotado:', data.message);
  source.close();
});
```

---

## Rate limiting

Todas las solicitudes a los endpoints de generación de PDF están sujetas a un límite de tasa:

| Concepto | Valor |
|----------|-------|
| Límite | 500 solicitudes por hora |
| Ventana | Deslizante de 1 hora |
| Por | API key |
| Código HTTP | `429 Too Many Requests` |

Si se excede el límite, la respuesta incluirá el campo `retryAfter` indicando los segundos restantes para reintentar:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 120
}
```

> En modo local (`PROJECT_MODE=local`) el rate limiting está deshabilitado.

---

## API Keys: Development vs Production

El tipo de API key determina si el PDF generado incluye marca de agua:

| Tipo | Marca de agua | Uso recomendado |
|------|--------------|-----------------|
| `development` | Sí — los PDFs incluyen una marca de agua visible | Pruebas y desarrollo |
| `production` | No — los PDFs se generan sin marca de agua | Producción y uso final |

Puedes gestionar tus API keys desde la interfaz de administración del sistema.

---

## Códigos de error comunes

| Código | Significado |
|--------|-------------|
| `400` | Faltan campos requeridos o etapa inválida |
| `401` | API key inválida o inactiva |
| `404` | Documento no encontrado (ID de grupo, versión o slug incorrecto) |
| `410` | El PDF solicitado ha expirado |
| `429` | Límite de tasa excedido |
| `500` | Error interno del servidor |

---

## Resumen

| Llamada | ¿Cuándo usarla? |
|---------|-----------------|
| `POST /api/pdf/generatePdfByGroup` | ✅ Siempre que puedas. Usa ID de grupo + etapa (respuesta con SSE) |
| `POST /api/pdf/generatePdfWebhookByGroup` | ✅ Como el anterior pero con webhook en lugar de SSE |
| `POST /api/pdf/generatePdf` | ⚠️ Solo cuando necesites una versión específica (respuesta con SSE) |
| `POST /api/pdf/generatePdfWebhook` | 🔄 Versión específica + webhook para procesos automáticos |
| `GET /api/pdf/v/:slug` | 📥 Descargar o visualizar el PDF generado |
| `GET /api/sse/pdf-status/:jobId` | 📡 Escuchar el progreso de una generación en tiempo real |

# Handlebars — Helpers

Los helpers son funciones que extienden Handlebars para transformar datos, comparar valores y más.

## Helpers de comparación

| Helper | Descripción | Ejemplo |
|--------|-------------|---------|
| `eq` | Igualdad (`===`) | `{{#if (eq status "activo")}}` |
| `ne` | Desigualdad (`!==`) | `{{#if (ne rol "admin")}}` |
| `lt` | Menor que (`<`) | `{{#if (lt edad 18)}}` |
| `gt` | Mayor que (`>`) | `{{#if (gt total 1000)}}` |
| `lte` | Menor o igual (`<=`) | `{{#if (lte nota 6)}}` |
| `gte` | Mayor o igual (`>=`) | `{{#if (gte puntuacion 90)}}` |
| `defined` | Verifica si existe | `{{#if (defined descuento)}}` |
| `isEven` | Verifica si es par | `{{#if (isEven @index)}}` |
| `not` | Negación | `{{not variable}}` |

### Ejemplos de comparación

```html
{{#if (eq tipoDocumento "factura")}}
  <h1>FACTURA</h1>
{{/if}}

{{#if (ne estatus "cancelado")}}
  <p>Documento vigente</p>
{{/if}}

{{#if (gte total 100000)}}
  <div class="monto-alto">Requiere autorización especial</div>
{{/if}}

{{#if (defined fechaVencimiento)}}
  <p>Vence: {{dateFormat fechaVencimiento}}</p>
{{/if}}

{{#if (isEven @index)}}
  <tr class="fila-par">
{{else}}
  <tr class="fila-impar">
{{/if}}
```

## Helpers lógicos de bloque

| Helper | Descripción | Ejemplo |
|--------|-------------|---------|
| `{{#and}}` | Verdadero si TODOS son verdaderos | `{{#and cond1 cond2}}` |
| `{{#or}}` | Verdadero si ALGUNO es verdadero | `{{#or cond1 cond2}}` |
| `{{#not}}` | Verdadero si es FALSO | `{{#not suspendido}}` |
| `{{#compare}}` | Comparación flexible con operador | `{{#compare a ">" b}}` |

### Ejemplos de lógica combinada

```html
{{#and activo (gte saldo 100)}}
  <button>Procesar pago</button>
{{/and}}

{{#or (eq rol "admin") (eq rol "supervisor")}}
  <a href="/admin">Panel de control</a>
{{/or}}

{{#not bloqueado}}
  <span>Usuario activo</span>
{{/not}}

{{#compare cantidad ">" 100}}
  <span class="alerta">Inventario alto</span>
{{else}}
  <span>Stock normal</span>
{{/compare}}
```

## Helpers de string

| Helper | Descripción | Entrada | Resultado |
|--------|-------------|---------|-----------|
| `concat` | Concatena strings | `{{concat "Hola " nombre}}` | "Hola Juan" |
| `lowercase` | Minúsculas | `{{lowercase "JUAN"}}` | "juan" |
| `uppercase` | Mayúsculas | `{{uppercase "juan"}}` | "JUAN" |
| `capitalize` | Primera letra mayúscula | `{{capitalize "juan"}}` | "Juan" |

### Ejemplos

```html
<p>{{uppercase tituloDocumento}}</p>
<p>{{capitalize (lowercase nombreCompleto)}}</p>
<p>{{concat cliente.nombre " - " cliente.rfc}}</p>

<!-- Anidación de helpers -->
<p>{{uppercase (concat nombre " " apellido)}}</p>
```

## Helpers de fecha

| Helper | Descripción | Ejemplo |
|--------|-------------|---------|
| `dateFormat` | Formatea una fecha | `{{dateFormat fecha "DD/MM/YYYY"}}` |
| `now` | Fecha/hora actual | `{{now "DD/MM/YYYY"}}` |
| `addDays` | Suma días a una fecha | `{{addDays fecha 30 "DD/MM/YYYY"}}` |

### Formato de fechas

Usa los códigos de formato de Moment.js:

| Código | Descripción | Ejemplo |
|--------|-------------|---------|
| `DD/MM/YYYY` | Día/Mes/Año | 15/03/2026 |
| `YYYY-MM-DD` | ISO | 2026-03-15 |
| `DD de MMMM de YYYY` | Largo | 15 de marzo de 2026 |
| `dddd, DD MMM YYYY` | Día semanal | lunes, 15 mar 2026 |
| `HH:mm` | Hora:minutos | 14:30 |

### Ejemplos

```html
<p>Fecha del documento: {{dateFormat fechaEmision "DD/MM/YYYY"}}</p>
<p>Fecha de vencimiento: {{addDays fechaEmision 30 "DD/MM/YYYY"}}</p>
<p>Generado el: {{now "DD [de] MMMM [de] YYYY"}}</p>

<!-- Fecha por defecto si no existe -->
{{#if (defined fechaEntrega)}}
  <p>Entrega: {{dateFormat fechaEntrega "DD/MM/YYYY"}}</p>
{{/if}}
```

## Helpers de array

| Helper | Descripción | Ejemplo |
|--------|-------------|---------|
| `currency` | Formato moneda MXN | `{{currency 1500.50}}` → `$1,500.50` |
| `length` | Longitud del array | `{{length items}}` → `5` |
| `first` | Primer elemento | `{{first usuarios}}` |
| `last` | Último elemento | `{{last usuarios}}` |

### Ejemplos

```html
<p>Total: {{currency total}}</p>

<p>Mostrando {{length items}} productos</p>

{{#if (gt (length items) 10)}}
  <p>Listado extenso (más de 10 items)</p>
{{/if}}

<div class="destacado">
  <h3>Primer elemento: {{first usuarios}}</h3>
  <h3>Último elemento: {{last usuarios}}</h3>
</div>
```

## Helpers de just-handlebars-helpers (~62 helpers adicionales)

El frontend registra automáticamente el paquete **just-handlebars-helpers**, que agrega ~62 helpers adicionales. Algunos de los más útiles:

| Helper | Descripción | Ejemplo |
|--------|-------------|---------|
| `add` | Suma | `{{add 5 3}}` → 8 |
| `subtract` | Resta | `{{subtract 10 3}}` → 7 |
| `multiply` | Multiplicación | `{{multiply 4 5}}` → 20 |
| `divide` | División | `{{divide 10 3}}` → 3.33 |
| `abs` | Valor absoluto | `{{abs -5}}` → 5 |
| `round` | Redondeo | `{{round 3.7}}` → 4 |
| `ceil` | Redondeo hacia arriba | `{{ceil 3.2}}` → 4 |
| `floor` | Redondeo hacia abajo | `{{floor 3.9}}` → 3 |
| `default` | Valor por defecto | `{{default variable "N/A"}}` |
| `json` | Convierte a JSON string | `{{json objeto}}` |
| `slice` | Corta un array/string | `{{slice array 0 3}}` |
| `join` | Une array con separador | `{{join array ", "}}` |
| `sort` | Ordena array | `{{sort array}}` |

> ⚠️ **Nota**: Los helpers de `just-handlebars-helpers` solo están disponibles en la **vista previa del frontend**. En la generación del PDF (backend), solo están disponibles los 21 helpers personalizados listados arriba.

## Resumen: helpers disponibles

| Categoría | Frontend (Vista Previa) | Backend (PDF) |
|-----------|------------------------|---------------|
| Comparación | 9 helpers | 9 helpers |
| Lógicos | 4 helpers | 4 helpers |
| String | 4 helpers | 4 helpers |
| Fecha | 3 helpers | 3 helpers |
| Array | 4 helpers | 4 helpers |
| just-handlebars-helpers | ~62 helpers | ❌ No disponibles |
| **Total** | **~86 helpers** | **24 helpers** |

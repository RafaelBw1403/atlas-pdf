# JSON — Datos del Documento

En la pestaña **JSON** escribes los datos que se inyectarán en tu plantilla HTML usando Handlebars.

## Formato

El JSON debe ser un objeto válido:

```json
{
  "titulo": "Reporte Mensual",
  "fecha": "15 de Marzo, 2026",
  "cliente": {
    "nombre": "Tech Innovators S.A.",
    "rfc": "TIS-123456-XYZ",
    "direccion": "Av. Reforma 222, CDMX"
  },
  "items": [
    { "nombre": "Consultoría", "cantidad": 10, "precio": 500, "total": 5000 },
    { "nombre": "Desarrollo", "cantidad": 40, "precio": 850, "total": 34000 },
    { "nombre": "Capacitación", "cantidad": 2, "precio": 3000, "total": 6000 }
  ],
  "subtotal": 45000,
  "iva": 7200,
  "total": 52200,
  "activo": true
}
```

## Tipos de datos soportados

| Tipo JSON | Ejemplo | En Handlebars |
|-----------|---------|---------------|
| **String** | `"Juan Pérez"` | `{{nombre}}` |
| **Number** | `1500` | `{{total}}` |
| **Boolean** | `true` / `false` | `{{#if activo}}` |
| **Object** | `{ "calle": "...", ... }` | `{{direccion.calle}}` |
| **Array** | `[ {...}, {...} ]` | `{{#each items}}` |
| **null** | `null` | Falsy en `{{#if}}` |

## Arrays (listas)

Los arrays son la base para crear tablas dinámicas:

```json
{
  "productos": [
    { "nombre": "Laptop", "precio": 25000 },
    { "nombre": "Monitor", "precio": 8000 },
    { "nombre": "Teclado", "precio": 1500 }
  ]
}
```

```html
<table>
  {{#each productos}}
  <tr>
    <td>{{nombre}}</td>
    <td>$ {{precio}}</td>
  </tr>
  {{/each}}
</table>
```

## Objetos anidados

Accede a propiedades profundas con **notación de punto**:

```json
{
  "empresa": {
    "nombre": "Acme Corp",
    "direccion": {
      "calle": "Insurgentes Sur 123",
      "colonia": "Roma Norte"
    }
  }
}
```

```html
<p>{{empresa.nombre}}</p>
<p>{{empresa.direccion.calle}}, {{empresa.direccion.colonia}}</p>
```

## Variables calculadas por el sistema

El backend agrega automáticamente algunas variables útiles:

| Variable | Descripción |
|----------|-------------|
| `taxRatePercentage` | `taxRate * 100` (ej. `16` para 16%) |
| `lineTotal` en items | `quantity * unitPrice` si no está presente |

## Validación

El sistema valida que el JSON:
- No tenga referencias circulares
- No exceda la profundidad máxima permitida
- Sea un objeto JSON válido

Si el JSON es inválido, el editor mostrará un error y no se podrá generar la vista previa ni el PDF.

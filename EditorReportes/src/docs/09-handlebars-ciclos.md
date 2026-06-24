# Handlebars — Ciclos ({{#each}})

## {{#each}} básico

Itera sobre un array y ejecuta el bloque por cada elemento:

```html
<!-- JSON: { "usuarios": [ { "nombre": "Ana" }, { "nombre": "Luis" }, { "nombre": "Carlos" } ] } -->

<ul>
{{#each usuarios}}
  <li>{{nombre}}</li>
{{/each}}
</ul>

<!-- Resultado: -->
<ul>
  <li>Ana</li>
  <li>Luis</li>
  <li>Carlos</li>
</ul>
```

## {{#each}} con tablas

El uso más común es generar filas de tabla dinámicamente:

```html
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Producto</th>
      <th>Cantidad</th>
      <th>Precio</th>
      <th>Total</th>
    </tr>
  </thead>
  <tbody>
    {{#each productos}}
    <tr>
      <td>{{@index}}</td>
      <td>{{nombre}}</td>
      <td>{{cantidad}}</td>
      <td>$ {{precio}}</td>
      <td>$ {{total}}</td>
    </tr>
    {{/each}}
  </tbody>
</table>
```

## Variables especiales @ dentro de {{#each}}

Dentro de un bloque `{{#each}}`, Handlebars provee variables especiales:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `@index` | Índice actual (0-based) | `{{@index}}` → 0, 1, 2... |
| `@first` | `true` si es el primer elemento | `{{#if @first}}...{{/if}}` |
| `@last` | `true` si es el último elemento | `{{#if @last}}...{{/if}}` |
| `@length` | Longitud total del array | `{{@length}}` |
| `@key` | Llave actual (útil en objetos) | `{{@key}}` |

## Uso avanzado con @index, @first, @last

```html
{{#each items}}
<tr class="{{#if @first}}primera-fila{{/if}} {{#if @last}}ultima-fila{{/if}} {{#if (isEven @index)}}par{{else}}impar{{/if}}">
  <td>{{add @index 1}}</td>
  <td>{{nombre}}</td>
  <td>{{cantidad}}</td>
</tr>
{{/each}}
```

## {{#each}} con objetos

También puedes iterar sobre las propiedades de un objeto:

```json
{
  "configuracion": {
    "moneda": "MXN",
    "idioma": "es",
    "zonaHoraria": "America/Mexico_City"
  }
}
```

```html
<table>
{{#each configuracion}}
  <tr>
    <td><strong>{{@key}}:</strong></td>
    <td>{{this}}</td>
  </tr>
{{/each}}
</table>

<!-- Resultado: -->
<table>
  <tr><td><strong>moneda:</strong></td><td>MXN</td></tr>
  <tr><td><strong>idioma:</strong></td><td>es</td></tr>
  <tr><td><strong>zonaHoraria:</strong></td><td>America/Mexico_City</td></tr>
</table>
```

## {{#each}} anidados (ciclos dentro de ciclos)

```json
{
  "categorias": [
    {
      "nombre": "Electrónicos",
      "productos": [
        { "nombre": "Laptop", "precio": 25000 },
        { "nombre": "Mouse", "precio": 500 }
      ]
    },
    {
      "nombre": "Oficina",
      "productos": [
        { "nombre": "Escritorio", "precio": 8000 },
        { "nombre": "Silla", "precio": 4500 }
      ]
    }
  ]
}
```

```html
{{#each categorias}}
  <h2>{{nombre}}</h2>
  <table>
    <tr><th>Producto</th><th>Precio</th></tr>
    {{#each productos}}
    <tr>
      <td>{{nombre}}</td>
      <td>$ {{precio}}</td>
    </tr>
    {{/each}}
  </table>
{{/each}}
```

## Ciclo vacío (array sin elementos)

Si el array está vacío, puedes mostrar un mensaje alternativo:

```html
{{#each items}}
  <tr><td>{{nombre}}</td><td>{{precio}}</td></tr>
{{else}}
  <tr><td colspan="2">No hay items registrados</td></tr>
{{/each}}
```

## Ejemplo práctico: reporte con totales

```html
<h1>{{titulo}}</h1>

<table class="detalle">
  <thead>
    <tr>
      <th>#</th>
      <th>Concepto</th>
      <th>Cantidad</th>
      <th>Precio Unitario</th>
      <th>Importe</th>
    </tr>
  </thead>
  <tbody>
    {{#each partidas}}
    <tr class="{{#if (isEven @index)}}fondo-claro{{/if}}">
      <td>{{add @index 1}}.</td>
      <td>{{descripcion}}</td>
      <td class="text-right">{{cantidad}}</td>
      <td class="text-right">$ {{precioUnitario}}</td>
      <td class="text-right">$ {{importe}}</td>
    </tr>
    {{/each}}
  </tbody>
  <tfoot>
    <tr>
      <td colspan="4" class="text-right"><strong>Subtotal:</strong></td>
      <td class="text-right">$ {{subtotal}}</td>
    </tr>
    <tr>
      <td colspan="4" class="text-right">IVA (16%):</td>
      <td class="text-right">$ {{iva}}</td>
    </tr>
    <tr class="total-row">
      <td colspan="4" class="text-right"><strong>TOTAL:</strong></td>
      <td class="text-right"><strong>$ {{total}}</strong></td>
    </tr>
  </tfoot>
</table>
```

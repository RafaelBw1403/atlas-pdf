# Handlebars — Condicionales

## {{#if}} / {{else}}

Muestra contenido solo si una condición se cumple:

```html
<!-- JSON: { "activo": true, "descuento": 15 } -->

{{#if activo}}
  <p class="activo">El usuario está activo</p>
{{else}}
  <p class="inactivo">El usuario está inactivo</p>
{{/if}}

{{#if descuento}}
  <p>Aplica descuento del {{descuento}}%</p>
{{/if}}
```

**Valores "falsy"** (se evalúan como `false`):
- `false`
- `undefined`
- `null`
- `""` (string vacío)
- `0` (cero)
- `[]` (array vacío)
- `{}` (objeto vacío — **atención**: en Handlebars estándar un objeto vacío es truthy, pero este sistema lo trata como falsy)

## {{#unless}}

Es la negación de `{{#if}}`:

```html
{{#unless suspendido}}
  <p>El usuario no está suspendido</p>
{{/unless}}

<!-- Equivalente a: -->
{{#if suspendido}}{{else}}
  <p>El usuario no está suspendido</p>
{{/if}}
```

## Condicionales con helpers de comparación

Estos helpers devuelven `true` o `false` para usar dentro de `{{#if}}`:

```html
<!-- JSON: { "edad": 25, "total": 15000, "rol": "admin" } -->

{{#if (eq rol "admin")}}
  <p>Acceso completo</p>
{{/if}}

{{#if (gt total 10000)}}
  <p>Documento prioritario</p>
{{/if}}

{{#if (lte edad 18)}}
  <p>Menor de edad</p>
{{else}}
  <p>Mayor de edad</p>
{{/if}}

{{#if (ne rol "invitado")}}
  <p>Usuario autenticado</p>
{{/if}}
```

## {{#and}}, {{#or}}, {{#not}}

Combina múltiples condiciones:

```html
{{#and activo (gt saldo 0)}}
  <p>Usuario activo con saldo disponible</p>
{{/and}}

{{#or (eq rol "admin") (eq rol "supervisor")}}
  <p>Acceso administrativo</p>
{{/or}}

{{#not suspendido}}
  <p>Usuario habilitado</p>
{{/not}}
```

## {{#compare}}

Un helper de comparación más flexible que acepta operadores como strings:

```html
{{#compare edad ">" 18}}
  <p>Mayor de edad</p>
{{/compare}}

{{#compare saldo ">=" 1000}}
  <p>Saldo suficiente</p>
{{else}}
  <p>Saldo insuficiente</p>
{{/compare}}

{{#compare status "===" "completado"}}
  <p>Proceso finalizado</p>
{{/compare}}
```

**Operadores soportados:** `>`, `<`, `>=`, `<=`, `==`, `!=`, `===`, `!==`

## {{#if}} en clases CSS

Puedes usar condicionales dentro del atributo `class` para aplicar estilos dinámicos:

```html
<!-- Clase condicional básica -->
<tr class="{{#if (isEven @index)}}fila-par{{else}}fila-impar{{/if}}">
  <td>{{nombre}}</td>
</tr>

<!-- Múltiples clases condicionales -->
<div class="item {{#if destacado}}destacado{{/if}} {{#if (gt prioridad 5)}}urgente{{/if}}">
  {{titulo}}
</div>

<!-- Clase condicional con compare -->
<td class="{{#compare cantidad ">" 10}}alta{{else}}baja{{/compare}}">
  {{cantidad}}
</td>
```

## {{#with}}

Cambia el contexto dentro de un bloque:

```html
<!-- JSON: { "cliente": { "nombre": "Ana", "telefono": "555-1234", "email": "ana@mail.com" } } -->

{{#with cliente}}
  <div class="card">
    <h3>{{nombre}}</h3>
    <p>Tel: {{telefono}}</p>
    <p>Email: {{email}}</p>
  </div>
{{/with}}

<!-- Sin #with tendrías que escribir cliente.nombre, cliente.telefono, etc. -->
```

## {{#each}} con condicionales

Combina ciclos y condicionales para filtros avanzados:

```html
{{#each items}}
  {{#if (gt total 1000)}}
    <tr class="item-importante">
      <td>{{nombre}}</td>
      <td>$ {{total}}</td>
    </tr>
  {{/if}}
{{/each}}
```

## Ejemplo práctico: factura con condiciones

```html
<div class="factura">
  <h1>{{titulo}}</h1>

  {{#if (eq tipo "credito")}}
    <div class="alerta">Pago pendiente en {{diasCredito}} días</div>
  {{/if}}

  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th>Cantidad</th>
        <th>Precio</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr class="{{#if (gt cantidad 10)}} volumen {{/if}}">
        <td>{{nombre}}</td>
        <td>{{cantidad}}</td>
        <td>$ {{precio}}</td>
        <td>$ {{total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="totales">
    <p>Subtotal: $ {{subtotal}}</p>
    {{#if (gt descuento 0)}}
      <p>Descuento: -$ {{descuento}}</p>
    {{/if}}
    <p><strong>Total: $ {{total}}</strong></p>
  </div>
</div>
```

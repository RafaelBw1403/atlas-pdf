# HTML — Cuerpo del Documento

En la pestaña **HTML** escribes la estructura del documento usando etiquetas HTML estándar. Aquí colocas el contenido que variará según los datos del JSON.

## Sintaxis básica

Usas `{{nombreVariable}}` para insertar valores del JSON:

```html
<h1>{{titulo}}</h1>
<p>Cliente: {{clienteNombre}}</p>
<p>Fecha: {{fecha}}</p>
```

## Estructura recomendada

No necesitas escribir `<html>`, `<head>` ni `<body>` completos. El sistema envuelve tu HTML automáticamente. Solo escribe el contenido:

```html
<div class="reporte">
  <header class="encabezado">
    <h1>{{tituloReporte}}</h1>
    <p>Generado el: {{fechaGeneracion}}</p>
  </header>

  <section class="datos-cliente">
    <h2>Datos del Cliente</h2>
    <p><strong>Nombre:</strong> {{cliente.nombre}}</p>
    <p><strong>RFC:</strong> {{cliente.rfc}}</p>
    <p><strong>Dirección:</strong> {{cliente.direccion}}</p>
  </section>

  <section class="detalle">
    <h2>Conceptos</h2>
    <table>
      <thead>
        <tr>
          <th>Concepto</th>
          <th>Cantidad</th>
          <th>Precio</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td>{{nombre}}</td>
          <td>{{cantidad}}</td>
          <td>{{precio}}</td>
          <td>{{total}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </section>
</div>
```

## Datos anidados

Puedes acceder a propiedades anidadas usando **notación de punto**:

```json
{
  "cliente": {
    "nombre": "Juan Pérez",
    "direccion": {
      "calle": "Av. Principal 123",
      "ciudad": "CDMX"
    }
  }
}
```

```html
<p>{{cliente.nombre}}</p>
<p>{{cliente.direccion.ciudad}}</p>
```

## HTML sin escapar

Por seguridad, Handlebars escapa el HTML por defecto (convierte `<` en `&lt;`). Si necesitas insertar HTML directamente (por ejemplo, contenido enriquecido), usa **triple llave**:

```html
{{{contenidoRichText}}}
```

> ⚠️ Usa `{{{ }}}` solo con contenido de confianza para evitar inyección XSS.

## Nombres de variables

- Pueden contener letras, números, guiones bajos y puntos
- **No pueden** contener espacios ni caracteres especiales
- Sensibles a mayúsculas/minúsculas: `{{Nombre}}` ≠ `{{nombre}}`

## Variables que no existen

Si una variable no existe en el JSON, Handlebars no muestra nada (cadena vacía), sin errores.

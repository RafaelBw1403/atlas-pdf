# Handlebars — Variables

Handlebars es el motor de plantillas que permite inyectar datos del JSON en tu HTML.

## Variables simples

```html
<!-- JSON: { "nombre": "Juan", "edad": 30 } -->
<p>Hola, {{nombre}}. Tienes {{edad}} años.</p>
<!-- Resultado: Hola, Juan. Tienes 30 años. -->
```

## Variables anidadas

Usa **notación de punto** para acceder a propiedades profundas:

```html
<!-- JSON: { "cliente": { "nombre": "María", "direccion": { "ciudad": "Monterrey" } } } -->
<p>{{cliente.nombre}} - {{cliente.direccion.ciudad}}</p>
```

## Pipe con helpers

Puedes transformar el valor de una variable usando helpers:

```html
<p>{{uppercase nombre}}</p>
<p>{{dateFormat fecha "DD/MM/YYYY"}}</p>
<p>{{lowercase (concat nombre " " apellido)}}</p>
```

## HTML sin escapar

Por seguridad, Handlebars escapa caracteres HTML. Para insertar HTML directamente:

```html
<!-- JSON: { "contenido": "<strong>Importante</strong>" } -->
<p>{{contenido}}</p>     <!-- &lt;strong&gt;Importante&lt;/strong&gt; -->
<p>{{{contenido}}}</p>   <!-- <strong>Importante</strong> -->
```

## La variable `this`

Dentro de un `{{#each}}`, `this` se refiere al elemento actual:

```html
{{#each numeros}}
  <li>{{this}}</li>
  <!-- Si numeros = [10, 20, 30], imprime: 10, 20, 30 -->
{{/each}}
```

También funciona con strings en un array:

```html
{{#each etiquetas}}
  <span class="tag">{{this}}</span>
{{/each}}
```

## Variables en atributos HTML

```html
<!-- JSON: { "url": "https://ejemplo.com/foto.jpg" } -->
<img src="{{url}}" alt="Foto de {{persona}}" width="200">

<!-- Condicional en clase -->
<div class="{{#if activo}}activo{{else}}inactivo{{/if}}">
  {{nombre}}
</div>

<!-- Clase dinámica con helper -->
<div class="item {{#if (isEven @index)}}par{{else}}impar{{/if}}">
```

## Variables en estilos inline

```html
<div style="background-color: {{colorFondo}};">
  {{contenido}}
</div>
```

## Valores por defecto

Handlebars no tiene un helper nativo para valores por defecto, pero puedes usar `{{#if}}`:

```html
{{#if telefono}}
  <p>Tel: {{telefono}}</p>
{{else}}
  <p>Tel: No especificado</p>
{{/if}}
```

O crear un helper personalizado:

```html
<!-- Usando #if con defined -->
{{#if (defined descuento)}}
  <p>Descuento: {{descuento}}%</p>
{{/if}}
```

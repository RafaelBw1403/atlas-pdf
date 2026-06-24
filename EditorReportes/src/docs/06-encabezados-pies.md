# Encabezados y Pies de Página

Las pestañas **Encabezado** y **Pie de página** te permiten definir contenido que se repetirá en todas las páginas del PDF.

## Cómo funcionan

- El **encabezado** aparece al inicio de cada página
- El **pie de página** aparece al final de cada página
- Ambos soportan **HTML** y **CSS** independientes del cuerpo
- Usan el **mismo JSON** que el cuerpo del documento

## Datos dinámicos en encabezados y pies

Al igual que en el cuerpo, puedes usar `{{variable}}` para insertar datos:

```html
<!-- Encabezado -->
<div class="header-content">
  <div class="header-left">
    <strong>{{empresa.nombre}}</strong>
  </div>
  <div class="header-right">
    Reporte: {{titulo}} | Fecha: {{fecha}}
  </div>
</div>
```

```html
<!-- Pie de página -->
<div class="footer-content">
  <span>© {{año}} {{empresa.nombre}}</span>
  <span>Página <span class="pageNumber"></span> / <span class="totalPages"></span></span>
  <span>{{confidencialidad}}</span>
</div>
```

## CSS de encabezados y pies

Puedes dar estilos independientes al encabezado y al pie:

```css
/* CSS del Encabezado */
.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 2px solid #1e40af;
  font-size: 11px;
}
```

```css
/* CSS del Pie */
.footer-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid #cbd5e1;
  font-size: 10px;
  color: #64748b;
}
```

## Numeración de páginas

Usa las clases especiales para mostrar números de página:

```html
<span class="pageNumber"></span>   <!-- Página actual -->
<span class="totalPages"></span>   <!-- Total de páginas -->
```

Ejemplo completo:
```html
Página <span class="pageNumber"></span> de <span class="totalPages"></span>
```

> ⚠️ Estas clases **solo funcionan en el PDF final** (no en la vista previa del navegador).

## Condicionales en encabezados/pies

Puedes usar toda la potencia de Handlebars:

```html
{{#if (gte total 10000)}}
  <div class="urgente">Documento Prioritario</div>
{{/if}}
```

## Ejemplo de encabezado profesional

```html
<div style="width:100%; display:flex; justify-content:space-between; align-items:center; padding-bottom:8px; border-bottom:2px solid #0f172a;">
  <div>
    <strong style="font-size:14px;">{{empresa}}</strong>
    <br>
    <span style="font-size:10px; color:#64748b;">{{departamento}}</span>
  </div>
  <div style="text-align:right; font-size:10px; color:#64748b;">
    <div>{{titulo}}</div>
    <div>{{fechaDocumento}}</div>
  </div>
</div>
```

## Ejemplo de pie de página

```html
<div style="width:100%; display:flex; justify-content:space-between; font-size:9px; color:#94a3b8; padding-top:6px; border-top:1px solid #e2e8f0;">
  <span>Confidencial - {{empresa}}</span>
  <span>Pág. <span class="pageNumber"></span> / <span class="totalPages"></span></span>
  <span>Versión {{version}}</span>
</div>
```

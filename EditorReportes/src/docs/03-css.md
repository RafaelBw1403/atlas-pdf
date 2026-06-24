# CSS — Estilos del Documento

En la pestaña **CSS** defines la apariencia del documento. Usas **CSS puro** (no SCSS, no Tailwind, no Bootstrap).

## Buenas prácticas

```css
:root {
  --primary: #0f172a;
  --accent: #3b82f6;
  --border: #e2e8f0;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 12px;
  line-height: 1.6;
  color: #334155;
  margin: 0;
  padding: 0;
}

h1 {
  color: var(--primary);
  font-size: 24px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f8fafc;
  padding: 10px;
  border: 1px solid var(--border);
}

td {
  padding: 10px;
  border: 1px solid var(--border);
}
```

## Regla @page para configuración de página

Aunque la configuración gráfica (pestaña "Configuración de página") es más fácil de usar, también puedes controlar el tamaño y márgenes con CSS:

```css
@page {
  size: A4;
  margin: 20mm 16mm 20mm 16mm;
}
```

Opciones: `A4`, `Letter`, `Legal`, `A3`, `A5`, o medidas personalizadas: `210mm 297mm`.

## Saltos de página

Controla dónde se rompen las páginas:

```css
.page-break {
  page-break-after: always;
}

.no-break {
  page-break-inside: avoid;
}
```

## Números de página

El sistema provee clases especiales para la numeración automática (funcionan en **Encabezado** y **Pie de página**):

```html
<span class="pageNumber"></span>
<span class="totalPages"></span>
```

Estos se reemplazan automáticamente con el número de página actual y el total de páginas al generar el PDF.

```css
.pageNumber {
  font-weight: bold;
}
```

## Colores y fuentes

- Usa variables CSS para mantener consistencia
- Prefiere fuentes del sistema (`system-ui`, `Segoe UI`, `Arial`, `Helvetica`)
- El sistema sanitiza los estilos permitidos: `color`, `text-align`, `font-size`, `margin`, `padding`, `border`, `background-color`

## Fondos y watermarks

Si el documento está en estado **Borrador**, **QA** o **Producción**, el sistema agrega automáticamente un watermark usando `body::after` con posición fija y rotación.

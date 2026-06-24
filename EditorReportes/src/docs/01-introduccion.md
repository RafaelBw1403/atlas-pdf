# Introducción al Editor de Reportes

## ¿Qué es?

Este sistema permite crear documentos HTML profesionales y convertirlos a PDF. Funciona como un **procesador de plantillas**: escribes HTML con marcadores dinámicos (`{{variable}}`), los conectas con datos en formato JSON, y el sistema genera el documento final con los valores reemplazados.

## Flujo de trabajo básico

```
HTML + CSS + JSON  →  Handlebars  →  Vista previa / PDF
```

1. **HTML** — Escribes la estructura del documento usando etiquetas HTML estándar
2. **CSS** — Defines los estilos (colores, fuentes, márgenes, etc.)
3. **JSON** — Proporcionas los datos que se inyectarán en la plantilla
4. **Handlebars** — El motor de plantillas reemplaza `{{variable}}` con los valores reales
5. **Resultado** — Puedes ver la vista previa o generar el PDF

## Pestañas del editor

El editor se organiza en pestañas para separar cada aspecto del documento:

| Pestaña | Descripción |
|---------|-------------|
| **HTML** | Cuerpo principal del documento |
| **CSS** | Estilos del cuerpo |
| **JSON** | Datos que se inyectan en la plantilla |
| **Configuración de página** | Tamaño de papel, márgenes, orientación |
| **Encabezado** | HTML y CSS del encabezado (se repite en cada página) |
| **Pie de página** | HTML y CSS del pie (se repite en cada página) |
| **Vista Previa** | Renderizado en vivo del documento completo |

## Conceptos clave

- **Separación de responsabilidades**: El contenido (HTML), la presentación (CSS) y los datos (JSON) están separados
- **Reutilización**: Cambia solo los datos (JSON) para generar documentos diferentes con la misma plantilla
- **Potencia de Handlebars**: Usa condicionales, ciclos, y más de 20 helpers para lógica avanzada

# Configuración de Página

La pestaña **Configuración de página** controla cómo se verá tu documento en PDF.

## Tamaño de papel (Formato)

Selecciona entre formatos predefinidos o crea uno personalizado:

| Categoría | Formatos |
|-----------|----------|
| **ISO A (Estándar)** | A4 (210×297mm), A3 (297×420mm), A5 (148×210mm) |
| **Norteamérica (ANSI)** | Carta (216×279mm), Legal (216×356mm), Tabloid (279×432mm) |
| **Regional** | Oficio MX (216×340mm), Folio (210×330mm) |
| **ISO B** | B5 ISO (176×250mm) |
| **JIS (Japón)** | B5 JIS (182×257mm) |
| **Personalizado** | Define ancho y alto en mm |

### Formato Personalizado

Al seleccionar "Personalizado", puedes definir:
- **Ancho (mm)**: Valor numérico
- **Alto (mm)**: Valor numérico

## Orientación

| Opción | Descripción |
|--------|-------------|
| **Vertical** | Retrato (alto > ancho) |
| **Horizontal** | Paisaje (ancho > alto) |

Al cambiar la orientación, el sistema intercambia automáticamente ancho y alto para formatos predefinidos.

## Márgenes

Define los márgenes en milímetros para cada lado:

| Margen | Descripción |
|--------|-------------|
| **Top** | Superior |
| **Right** | Derecho |
| **Bottom** | Inferior |
| **Left** | Izquierdo |

Valores recomendados: `20-25mm` para documentos formales, `15mm` para maximizar espacio.

## Altura de encabezado y pie

| Opción | Descripción |
|--------|-------------|
| **Alto encabezado (mm)** | Altura reservada para el encabezado. `0` = automático |
| **Alto pie (mm)** | Altura reservada para el pie de página. `0` = automático |

> El sistema ajusta los márgenes automáticamente para que el contenido principal no se superponga con encabezados y pies.

## Ejemplo de configuración típica

| Parámetro | Valor |
|-----------|-------|
| Formato | Carta |
| Orientación | Vertical |
| Margen superior | 25 mm |
| Margen derecho | 20 mm |
| Margen inferior | 25 mm |
| Margen izquierdo | 20 mm |
| Alto encabezado | 0 (automático) |
| Alto pie | 0 (automático) |

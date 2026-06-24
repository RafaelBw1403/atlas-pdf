# API — Conceptos clave

Puedes generar PDF desde cualquier sistema externo usando las APIs del sistema. Aquí tienes lo que necesitas saber.

## ID de grupo

Cada documento tiene un **ID de grupo** que lo identifica de forma permanente. Este ID no cambia aunque crees borradores, publiques nuevas versiones o muevas el documento entre etapas.

- Es un identificador único del documento
- Sirve para referirte al documento completo, sin importar en qué versión esté
- Lo encuentras en el editor (junto al título) y en el historial de versiones

## ID de versión

Cada vez que guardas un documento se crea una **versión**. Cada versión tiene su propio ID.

- Cambia cada vez que creas un borrador o publicas una versión
- Si eliminas esa versión, el ID deja de funcionar
- Solo úsalo cuando necesites generar el PDF de una versión exacta

> **Regla general**: usa siempre el ID de grupo a menos que tengas una razón muy específica para usar el de versión.

## Etapas (stages)

Cada versión de un documento puede estar en una de estas etapas:

| Etapa | Significado | Marca de agua en PDF |
|-------|-------------|----------------------|
| **Borrador** (`draft`) | Versión en edición, aún no lista para usar | Sí |
| **QA** (`qa`) | Versión en pruebas | Sí ("QA - PRUEBAS") |
| **Producción** (`production`) | Versión final lista para usar | No |
| **Histórico** (`historical`) | Versión anterior guardada como respaldo | Sí |

Al generar un PDF:

- Si usas `production`, obtienes la versión final **sin marca de agua**
- Si usas `qa`, obtienes la versión de pruebas **con marca de agua**
- Si usas `draft`, obtienes el borrador actual **con marca de agua**
- Si usas `historical`, obtienes una versión anterior guardada como respaldo **con marca de agua**

## Cómo obtener tu API Key

1. Ve a la sección **API Keys** en el menú lateral
2. Ahí encontrarás tu llave de **desarrollo** y tu llave de **producción**
3. Usa la llave de desarrollo para hacer pruebas
4. Usa la llave de producción solo cuando estés listo

> Cada llave tiene un botón para copiarla. También puedes renovarla si es necesario.

## Dónde encontrar los IDs

- **ID de grupo**: aparece en el editor, justo debajo del nombre del documento, con la etiqueta "Grupo:"
- **ID de versión**: aparece igual en el editor con la etiqueta "ID:"
- Ambos tienen un botón de copia para que los uses en tus llamadas

También puedes consultar todos tus documentos desde la página **API Reference**, donde puedes seleccionar un documento y ver sus IDs listos para usar.

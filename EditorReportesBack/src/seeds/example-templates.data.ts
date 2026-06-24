export interface ExampleTemplateData {
  name: string;
  html: string;
  css: string;
  sampleData: Record<string, unknown>;
  tags: string[];
}

export const exampleTemplates: ExampleTemplateData[] = [
  {
    name: 'Factura',
    html: `<div class="factura">
  <div class="encabezado-factura">
    <div class="remitente">
      <h2>{{empresa.nombre}}</h2>
      <p>{{empresa.direccion}}</p>
      <p>RFC: {{empresa.rfc}} | Tel: {{empresa.telefono}}</p>
    </div>
    <div class="folio">
      <h1>FACTURA</h1>
      <p class="folio-num">{{folio}}</p>
      <p>Fecha: {{dateFormat fecha "DD [de] MMMM [de] YYYY"}}</p>
    </div>
  </div>

  <div class="datos-cliente">
    <h3>Cliente</h3>
    <p><strong>{{cliente.nombre}}</strong></p>
    <p>RFC: {{cliente.rfc}}</p>
    <p>{{cliente.direccion}}</p>
    <p>Tel: {{cliente.telefono}}</p>
  </div>

  <table class="tabla-conceptos">
    <thead>
      <tr>
        <th>Código</th>
        <th>Descripción</th>
        <th class="text-right">Cantidad</th>
        <th class="text-right">Precio Unitario</th>
        <th class="text-right">Importe</th>
      </tr>
    </thead>
    <tbody>
      {{#each conceptos}}
      <tr class="{{#if (isEven @index)}}fondo-claro{{/if}}">
        <td>{{codigo}}</td>
        <td>{{descripcion}}</td>
        <td class="text-right">{{cantidad}}</td>
        <td class="text-right">{{currency "MXN" precioUnitario}}</td>
        <td class="text-right">{{currency "MXN" importe}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="totales">
    <div class="linea-total">
      <span>Subtotal:</span>
      <span>{{currency "MXN" subtotal}}</span>
    </div>
    {{#if (gt descuento 0)}}
    <div class="linea-total descuento">
      <span>Descuento:</span>
      <span>-{{currency "MXN" descuento}}</span>
    </div>
    <div class="linea-total">
      <span>Subtotal con descuento:</span>
      <span>{{currency "MXN" subtotalConDescuento}}</span>
    </div>
    {{/if}}
    <div class="linea-total">
      <span>IVA:</span>
      <span>{{currency "MXN" iva}}</span>
    </div>
    <div class="linea-total total-final">
      <span>TOTAL:</span>
      <span>{{currency "MXN" total}}</span>
    </div>
  </div>

  <div class="condiciones-pago">
    <h3>Método de pago</h3>
    <p>{{metodoPago}}</p>
    <p>Cuenta: {{cuentaBancaria}}</p>
  </div>
</div>`,
    css: `:root {
  --primary: #1e3a5f;
  --accent: #3b82f6;
  --border: #e2e8f0;
  --bg-light: #f8fafc;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 12px;
  color: #1e293b;
  line-height: 1.5;
  margin: 0;
  padding: 20px;
}

.factura { max-width: 100%; }

.encabezado-factura {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 20px;
  border-bottom: 3px solid var(--primary);
  margin-bottom: 20px;
}

.remitente h2 {
  color: var(--primary);
  margin: 0 0 5px 0;
  font-size: 18px;
}

.remitente p {
  margin: 2px 0;
  color: #64748b;
  font-size: 11px;
}

.folio { text-align: right; }

.folio h1 {
  color: var(--primary);
  font-size: 28px;
  margin: 0;
  letter-spacing: 3px;
}

.folio-num {
  font-size: 14px;
  font-weight: bold;
  color: var(--accent);
}

.datos-cliente {
  background: var(--bg-light);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid var(--border);
}

.datos-cliente h3 {
  margin: 0 0 8px 0;
  color: var(--primary);
  text-transform: uppercase;
  font-size: 12px;
}

.datos-cliente p {
  margin: 3px 0;
  font-size: 12px;
}

.tabla-conceptos {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.tabla-conceptos th {
  background: var(--primary);
  color: white;
  padding: 10px 12px;
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tabla-conceptos td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
}

.fondo-claro { background: var(--bg-light); }

.text-right { text-align: right; }

.totales {
  margin-left: auto;
  width: 350px;
  background: var(--bg-light);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.linea-total {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 13px;
}

.descuento { color: #dc2626; }

.total-final {
  font-size: 18px;
  font-weight: bold;
  color: var(--primary);
  border-top: 2px solid var(--primary);
  padding-top: 10px;
  margin-top: 5px;
}

.condiciones-pago {
  margin-top: 30px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 11px;
  color: #64748b;
}

.condiciones-pago h3 {
  margin: 0 0 5px 0;
  color: var(--primary);
  font-size: 12px;
}

.condiciones-pago p { margin: 3px 0; }`,
    sampleData: {
      folio: 'F-2026-001',
      fecha: '2026-03-15',
      cliente: {
        nombre: 'Comercializadora del Norte S.A.',
        rfc: 'CDN-123456-ABC',
        direccion: 'Av. Industrial 500, Monterrey, N.L.',
        telefono: '81-1234-5678'
      },
      empresa: {
        nombre: 'Distribuidora Acme S.A. de C.V.',
        rfc: 'DAC-789012-XYZ',
        direccion: 'Calzada de Tlalpan 3000, CDMX',
        telefono: '55-9876-5432'
      },
      conceptos: [
        { codigo: 'LAP-001', descripcion: 'Laptop Pro 15"', cantidad: 3, precioUnitario: 25000, importe: 75000 },
        { codigo: 'MON-023', descripcion: 'Monitor 27" 4K', cantidad: 5, precioUnitario: 8500, importe: 42500 },
        { codigo: 'TEC-045', descripcion: 'Teclado Mecánico RGB', cantidad: 10, precioUnitario: 1800, importe: 18000 },
        { codigo: 'MOU-012', descripcion: 'Mouse Inalámbrico', cantidad: 8, precioUnitario: 950, importe: 7600 }
      ],
      subtotal: 143100,
      descuento: 5000,
      subtotalConDescuento: 138100,
      iva: 22096,
      total: 160196,
      metodoPago: 'Transferencia Electrónica',
      cuentaBancaria: '0721 8000 1234 5678 90'
    },
    tags: ['factura', 'comercial', 'ejemplo']
  },
  {
    name: 'Reporte de Ventas Mensual',
    html: `<div class="reporte-ventas">
  <div class="titulo-reporte">
    <h1>{{titulo}}</h1>
    <p class="periodo">{{periodo}}</p>
    <p class="fecha-generacion">Generado: {{dateFormat generado "DD/MM/YYYY"}}</p>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card {{#if (gte cumplimiento 100)}}kpi-exito{{else}}kpi-pendiente{{/if}}">
      <span class="kpi-label">Total Ventas</span>
      <span class="kpi-valor">{{currency "MNX" totalVentas}}</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">Meta</span>
      <span class="kpi-valor">{{currency "MNX" meta}}</span>
    </div>
    <div class="kpi-card {{#if (gte cumplimiento 100)}}kpi-exito{{else}}kpi-pendiente{{/if}}">
      <span class="kpi-label">Cumplimiento</span>
      <span class="kpi-valor">{{cumplimiento}}%</span>
    </div>
    <div class="kpi-card kpi-destacado">
      <span class="kpi-label">Vendedor Estrella</span>
      <span class="kpi-valor">{{vendedorEstrella}}</span>
    </div>
  </div>

  <div class="seccion">
    <h2>Desempeño por Vendedor</h2>
    <table class="tabla-desempeno">
      <thead>
        <tr>
          <th>Vendedor</th>
          <th class="text-right">Ventas</th>
          <th class="text-right">Meta</th>
          <th class="text-center">Cumplimiento</th>
          <th class="text-right">Comisión</th>
        </tr>
      </thead>
      <tbody>
        {{#each vendedores}}
        {{#with this}}
        <tr class="{{#if (gte ventas meta)}}supero-meta{{/if}}">
          <td>
            <strong>{{nombre}}</strong>
            {{#if (eq nombre ../vendedorEstrella)}}
              <span class="estrella">⭐</span>
            {{/if}}
          </td>
          <td class="text-right">{{currency "MNX" ventas}}</td>
          <td class="text-right">{{currency "MNX" meta}}</td>
          <td class="text-center">
            {{#compare ventas ">=" meta}}
              <span class="badge-exito">{{multiply (divide ventas meta) 100}}%</span>
            {{else}}
              <span class="badge-pendiente">{{multiply (divide ventas meta) 100}}%</span>
            {{/compare}}
          </td>
          <td class="text-right">{{currency "MNX" comision}}</td>
        </tr>
        {{/with}}
        {{/each}}
      </tbody>
    </table>
  </div>

  {{#if (gt (length productosMasVendidos) 0)}}
  <div class="seccion">
    <h2>Productos Más Vendidos</h2>
    <table class="tabla-productos">
      <thead>
        <tr>
          <th>Producto</th>
          <th class="text-right">Unidades</th>
          <th class="text-right">Ingresos</th>
        </tr>
      </thead>
      <tbody>
        {{#each productosMasVendidos}}
        <tr>
          <td>{{nombre}}</td>
          <td class="text-right">{{unidades}}</td>
          <td class="text-right">{{currency "MNX" ingresos}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
  {{/if}}

  {{#if notas}}
  <div class="notas">
    <h3>Notas</h3>
    <p>{{notas}}</p>
  </div>
  {{/if}}
</div>`,
    css: `:root {
  --success: #16a34a;
  --warning: #d97706;
  --danger: #dc2626;
  --primary: #1e40af;
  --border: #e2e8f0;
  --bg: #f8fafc;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 12px;
  color: #1e293b;
  margin: 0;
  padding: 20px;
}

.titulo-reporte {
  text-align: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--primary);
}

.titulo-reporte h1 {
  color: var(--primary);
  margin: 0;
  font-size: 24px;
}

.periodo {
  font-size: 16px;
  color: #475569;
  margin: 5px 0;
}

.fecha-generacion {
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 25px;
}

.kpi-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 15px;
  text-align: center;
}

.kpi-exito {
  border-color: var(--success);
  background: #f0fdf4;
}

.kpi-pendiente {
  border-color: var(--warning);
  background: #fffbeb;
}

.kpi-destacado {
  border-color: var(--primary);
  background: #eff6ff;
}

.kpi-label {
  display: block;
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 5px;
}

.kpi-valor {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: var(--primary);
}

.seccion {
  margin-bottom: 25px;
}

.seccion h2 {
  color: var(--primary);
  font-size: 16px;
  border-left: 4px solid var(--primary);
  padding-left: 10px;
  margin: 0 0 12px 0;
}

.tabla-desempeno, .tabla-productos {
  width: 100%;
  border-collapse: collapse;
}

.tabla-desempeno th, .tabla-productos th {
  background: var(--primary);
  color: white;
  padding: 10px 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tabla-desempeno td, .tabla-productos td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
}

.supero-meta {
  background: #f0fdf4;
}

.text-right { text-align: right; }
.text-center { text-align: center; }

.badge-exito, .badge-pendiente {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.badge-exito {
  background: #dcfce7;
  color: var(--success);
}

.badge-pendiente {
  background: #fef3c7;
  color: var(--warning);
}

.estrella {
  font-size: 14px;
  margin-left: 4px;
}

.notas {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
}

.notas h3 {
  margin: 0 0 8px 0;
  color: #92400e;
  font-size: 13px;
}

.notas p {
  margin: 0;
  color: #78350f;
  font-size: 11px;
  line-height: 1.6;
}`,
    sampleData: {
      titulo: 'Reporte de Ventas Mensual',
      periodo: 'Febrero 2026',
      generado: '2026-03-01',
      totalVentas: 456780,
      meta: 400000,
      cumplimiento: 114.2,
      vendedorEstrella: 'María García',
      vendedores: [
        { nombre: 'María García', ventas: 125000, meta: 100000, comision: 12500 },
        { nombre: 'Carlos López', ventas: 98000, meta: 100000, comision: 7840 },
        { nombre: 'Ana Martínez', ventas: 87500, meta: 80000, comision: 7000 },
        { nombre: 'José Rodríguez', ventas: 72300, meta: 80000, comision: 5784 },
        { nombre: 'Laura Sánchez', ventas: 73980, meta: 70000, comision: 5918 }
      ],
      productosMasVendidos: [
        { nombre: 'Laptop Pro', unidades: 45, ingresos: 1125000 },
        { nombre: 'Monitor 27"', unidades: 82, ingresos: 697000 },
        { nombre: 'Teclado Mecánico', unidades: 150, ingresos: 270000 }
      ],
      notas: 'Este mes se superó la meta global gracias al desempeño excepcional del equipo.'
    },
    tags: ['reporte', 'ventas', 'ejemplo']
  },
  {
    name: 'Certificado',
    html: `<div class="certificado">
  <div class="borde-decorativo"></div>

  <div class="contenido">
    <div class="sello">{{institucion}}</div>

    <h1>{{titulo}}</h1>

    <p class="otorga">El Instituto {{institucion}} otorga el presente certificado a:</p>

    <p class="participante">{{participante}}</p>

    <p class="descripcion">
      Por haber completado satisfactoriamente el curso
      <strong>{{curso}}</strong>
      con una duración de <strong>{{duracion}}</strong>,
      del {{dateFormat fechaInicio "DD [de] MMMM [de] YYYY"}}
      al {{dateFormat fechaFin "DD [de] MMMM [de] YYYY"}}.
    </p>

    {{#if esHonores}}
    <div class="mencion-honor">
      <p>⭐ Otorgado con Mención Honorífica ⭐</p>
      <p class="calificacion">Calificación: {{calificacion}}/100</p>
    </div>
    {{/if}}

    <div class="temas">
      <h3>Temas cubiertos:</h3>
      <ul>
        {{#each temasCubiertos}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>

    <div class="firmas">
      <div class="firma">
        <div class="linea-firma"></div>
        <p>{{instructor}}</p>
        <p class="cargo">Instructora</p>
      </div>
      <div class="firma">
        <div class="linea-firma"></div>
        <p>Dr. Alejandro Ruiz</p>
        <p class="cargo">Director Académico</p>
      </div>
    </div>

    <div class="codigo-verificacion">
      <p>Código de verificación: <strong>{{codigoVerificacion}}</strong></p>
      <p class="fecha-exp">Expedido: {{dateFormat fechaExpedicion "DD [de] MMMM [de] YYYY"}}</p>
    </div>
  </div>

  <div class="borde-decorativo inferior"></div>
</div>`,
    css: `body {
  margin: 0;
  padding: 0;
  font-family: 'DejaVu Serif', 'Georgia', 'Times New Roman', serif;
  background: #faf9f6;
  color: #1c1917;
}

.certificado {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.borde-decorativo {
  height: 12px;
  background: #1e3a5f;
}

.contenido {
  flex: 1;
  margin-top: 50px;
  padding: 40px 60px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;

}

.sello {
  font-size: 14px;
  color: #1e3a5f;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-bottom: 10px;
  font-family: 'DejaVu Sans', 'Segoe UI', sans-serif;
}

h1 {
  font-size: 36px;
  color: #1e3a5f;
  letter-spacing: 6px;
  margin: 0 0 20px 0;
  border-top: 2px solid #cbd5e1;
  border-bottom: 2px solid #cbd5e1;
  padding: 15px 0;
}

.otorga {
  font-size: 14px;
  color: #57534e;
  margin: 20px 0 10px;
  font-style: italic;
}

.participante {
  font-size: 32px;
  font-weight: bold;
  color: #1e3a5f;
  margin: 5px 0 20px;
  letter-spacing: 1px;
}

.descripcion {
  font-size: 14px;
  color: #44403c;
  line-height: 1.8;
  text-align: center;
}

.mencion-honor {
  background: #fde68a;
  border: 2px solid #d97706;
  border-radius: 12px;
  padding: 12px 25px;
  margin: 0 auto 25px;
  display: inline-block;
}

.mencion-honor p {
  margin: 3px 0;
  font-weight: bold;
  color: #92400e;
  font-size: 14px;
}

.calificacion {
  font-size: 16px;
}

.temas {}

.temas h3 {
  font-size: 13px;
  color: #78716c;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.temas ul {
  list-style: none;
  padding: 0;
}

.temas li {
  padding: 4px 0;
  font-size: 13px;
  color: #44403c;
}

.temas li::before {
  content: "✓ ";
  color: #16a34a;
  font-weight: bold;
}

.firmas {
  text-align: center;
  margin: 35px 0 25px;
}

.firma {
  display: inline-block;
  text-align: center;
  width: 180px;
  margin: 0 20px;
}

.linea-firma {
  border-top: 1px solid #1c1917;
  width: 180px;
  margin-bottom: 8px;
}

.firma p {
  margin: 2px 0;
  font-size: 13px;
}

.cargo {
  font-size: 11px;
  color: #78716c;
  font-style: italic;
}

.codigo-verificacion {
  border-top: 1px solid #d6d3d1;
  padding-top: 15px;
}

.codigo-verificacion p {
  margin: 3px 0;
  font-size: 11px;
  color: #78716c;
  font-family: 'DejaVu Sans Mono', 'Courier New', monospace;
}

.fecha-exp {
  color: #a8a29e;
}`,
    sampleData: {
      titulo: 'CERTIFICADO DE FINALIZACIÓN',
      numero: 'CERT-2026-0042',
      participante: 'Roberto Hernández Jiménez',
      curso: 'Desarrollo Web Full Stack con React y Node.js',
      institucion: 'Acme Tech Institute',
      duracion: '120 horas',
      fechaInicio: '2026-01-10',
      fechaFin: '2026-03-28',
      fechaExpedicion: '2026-04-01',
      calificacion: 95,
      esHonores: true,
      instructor: 'Dra. Patricia Mendoza',
      codigoVerificacion: 'AVK-4MN9-XQ2P',
      temasCubiertos: [
        'Fundamentos de JavaScript ES6+',
        'React con TypeScript',
        'Node.js y Express',
        'Bases de datos SQL y NoSQL',
        'Despliegue en producción'
      ]
    },
    tags: ['certificado', 'diploma', 'ejemplo']
  }
];

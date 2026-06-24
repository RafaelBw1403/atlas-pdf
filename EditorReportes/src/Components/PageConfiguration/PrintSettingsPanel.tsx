import React from 'react';
import { PaperSettingsComponent } from './PaperSettingsComponent';
import { MarginSettingsComponent } from './MarginSettingsComponent';
import type { ILayoutSettings, IMarginSettings, IPrintConfig } from '../../interfaces/IPrintSettings';
import { initDocument } from '../../store/initOrganization';

// --- 1. DEFINICIONES DE TIPOS (Interfaces) ---



interface PrintSettingsPanelProps {
  config: IPrintConfig;
  setConfig: (newConfig: IPrintConfig) => void;
  readOnly?: boolean;
}


// Estilos inline para portabilidad rápida
const styles: Record<string, React.CSSProperties> = {
  container: { padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px', color: '#333', fontFamily: 'system-ui, sans-serif' },
  section: { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px', background: '#fff' },
  title: { margin: '0 0 15px 0', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em' },
  row: { display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' },
  col: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  label: { fontSize: '12px', fontWeight: '600', color: '#374151' },
  input: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', width: '100%', boxSizing: 'border-box' },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '8px' },
  disabledInput: { backgroundColor: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }
};

// --- 3. COMPONENTE PRINCIPAL ---

const PrintSettingsPanel: React.FC<PrintSettingsPanelProps> = ({ config, setConfig, readOnly = false }) => {
  const safeConfig = config || initDocument.printConfig;

  const handleLayoutChange = (newLayout: ILayoutSettings) => {
    setConfig({
      ...safeConfig,
      layout: newLayout
    });
  };

  const handleMarginsChange = (newMargins: IMarginSettings) => {
    setConfig({
      ...safeConfig,
      margin: newMargins
    });
  };

  const handleHeaderHeightChange = (val: number) => {
    setConfig({
      ...safeConfig,
      headerHeight: val
    });
  };

  const handleFooterHeightChange = (val: number) => {
    setConfig({
      ...safeConfig,
      footerHeight: val
    });
  };

  return (
    <div style={styles.container}>
      
      {/* SECCIÓN 1: PAPEL */}
      <PaperSettingsComponent
        layout={safeConfig.layout}
        onLayoutChange={handleLayoutChange}
        readOnly={readOnly}
      />

      {/* SECCIÓN 2: MÁRGENES */}
      <MarginSettingsComponent
        margins={safeConfig.margin}
        onMarginsChange={handleMarginsChange}
        readOnly={readOnly}
      />

      {/* SECCIÓN 3: ALTURA HEADER / FOOTER */}
      <div style={styles.section}>
        <h4 style={styles.title}>Altura de encabezado y pie</h4>

        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>Alto encabezado (mm)</label>
            <input
              type="number"
              min="0"
              step="1"
              style={styles.input}
              value={safeConfig.headerHeight}
              onChange={(e) => handleHeaderHeightChange(parseInt(e.target.value, 10) || 0)}
              readOnly={readOnly}
              placeholder="0 = automático"
            />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>Alto pie (mm)</label>
            <input
              type="number"
              min="0"
              step="1"
              style={styles.input}
              value={safeConfig.footerHeight}
              onChange={(e) => handleFooterHeightChange(parseInt(e.target.value, 10) || 0)}
              readOnly={readOnly}
              placeholder="0 = automático"
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: OPCIONES */}
      {/* <div style={styles.section}>
        <h4 style={styles.title}>Visualización</h4>
        
        <div style={styles.col}>
          <label style={styles.label}>Escala ({config.options.scale}%)</label>
          <input 
            type="range" 
            min="50" 
            max="150" 
            step="5"
            style={{ width: '100%', cursor: 'pointer', marginTop: '5px' }}
            value={config.options.scale}
            onChange={(e) => handleOptionChange('scale', parseInt(e.target.value, 10))}
          />
        </div>

        <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={styles.checkboxRow}>
            <input 
              type="checkbox" 
              checked={config.options.printBackground}
              onChange={(e) => handleOptionChange('printBackground', e.target.checked)}
            />
            <span>Imprimir fondos (Más tinta)</span>
          </label>

          <label style={styles.checkboxRow}>
            <input 
              type="checkbox" 
              checked={config.options.pageNumbers}
              onChange={(e) => handleOptionChange('pageNumbers', e.target.checked)}
            />
            <span>Mostrar números de pág.</span>
          </label>
        </div>
      </div> */}

    </div>
  );
};

export default PrintSettingsPanel;
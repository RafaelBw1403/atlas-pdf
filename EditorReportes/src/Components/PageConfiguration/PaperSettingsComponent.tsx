import React, { useEffect } from 'react';
import { Select, InputNumber, Form, Typography } from 'antd';
import type { ILayoutSettings } from "../../interfaces/IPrintSettings";

const { Title } = Typography;
const { Option } = Select;

interface PaperSettingsProps {
  layout: ILayoutSettings;
  onLayoutChange: (newLayout: ILayoutSettings) => void;
  readOnly?: boolean;
}

// --- CONSTANTES ---

interface IPaperSize {
  w: number;
  h: number;
  label: string;
  category: string;
}

const PAPER_SIZES: Record<string, IPaperSize> = {
  // --- ISO A Series (International Standard) ---
  a4: { w: 210, h: 297, label: 'A4 (210 x 297 mm)', category: 'ISO A' },
  a3: { w: 297, h: 420, label: 'A3 (297 x 420 mm)', category: 'ISO A' },
  a5: { w: 148, h: 210, label: 'A5 (148 x 210 mm)', category: 'ISO A' },
  
  // --- North American Standard (ANSI) ---
  letter: { w: 216, h: 279, label: 'Carta (216 x 279 mm)', category: 'ANSI' },
  legal: { w: 216, h: 356, label: 'Legal US (216 x 356 mm)', category: 'ANSI' },
  tabloid: { w: 279, h: 432, label: 'Tabloid (279 x 432 mm)', category: 'ANSI' },
  
  // --- Regional / Special ---
  oficio_mx: { w: 216, h: 340, label: 'Oficio MX (216 x 340 mm)', category: 'Regional' },
  folio: { w: 210, h: 330, label: 'Folio / F4 (210 x 330 mm)', category: 'Regional' },
  
  // --- ISO B Series ---
  b5: { w: 176, h: 250, label: 'B5 (ISO) (176 x 250 mm)', category: 'ISO B' },
  jis_b5: { w: 182, h: 257, label: 'B5 (JIS) (182 x 257 mm)', category: 'JIS' },
  
  // --- Other common sizes ---
  executive: { w: 184, h: 267, label: 'Executive (184 x 267 mm)', category: 'ANSI' },
  half_letter: { w: 140, h: 216, label: 'Half Letter (140 x 216 mm)', category: 'ANSI' },
};

// Group labels for categories
const PAPER_CATEGORY_LABELS: Record<string, string> = {
  'ISO A': '📄 Estándar Internacional (ISO A)',
  'ANSI': '📏 Norteamérica (ANSI)',
  'Regional': '🌎 Regional',
  'ISO B': '📐 ISO B',
  'JIS': '🗾 JIS (Japón)'
};

// --- COMPONENTE ---

export const PaperSettingsComponent = ({ layout, onLayoutChange, readOnly = false }: PaperSettingsProps) => {
  const [form] = Form.useForm();
  const isCustom = layout.format === 'custom';

  // Sincronizar el formulario cuando cambia el layout externamente
  useEffect(() => {
    form.setFieldsValue({
      format: layout.format,
      orientation: layout.orientation,
      width: layout.width,
      height: layout.height
    });
  }, [layout, form]);

  const handleFormatChange = (newFormat: string) => {
    const isPreset = newFormat in PAPER_SIZES;
    let newWidth = layout.width;
    let newHeight = layout.height;
    let newOrientation = layout.orientation;

    if (isPreset) {
      const selectedSize = PAPER_SIZES[newFormat];
      newWidth = selectedSize?.w;
      newHeight = selectedSize?.h;
      newOrientation = false; // vertical
    } else if (newFormat === 'custom') {
      // Limpiar los valores cuando se selecciona custom
      newWidth = 0;
      newHeight = 0;
    }

    // Actualizar el formulario manualmente ---
    form.setFieldsValue({
      width: newWidth,
      height: newHeight,
      orientation: newOrientation
    });

    onLayoutChange({
      ...layout,
      format: newFormat,
      orientation: newOrientation,
      width: newWidth ?? 0,
      height: newHeight ?? 0
    });
  };

  const handleOrientationChange = (newOrientation: boolean) => {
    // if (layout.format === 'custom') return;

    const currentW = layout.width || 0;
    const currentH = layout.height || 0;

    let finalW = currentW;
    let finalH = currentH;

    if (newOrientation === true // horizontal
      && currentH > currentW) {
        finalW = currentH;
        finalH = currentW;
    } else if (newOrientation === false // vertical
      && currentW > currentH) {
        finalW = currentH;
        finalH = currentW;
    }

    // Sincronizar el formulario visualmente
    form.setFieldsValue({
      width: finalW,
      height: finalH
    });

    onLayoutChange({
      ...layout,
      orientation: newOrientation,
      width: finalW,
      height: finalH
    });
  };

  const handleDimensionChange = (key: 'width' | 'height', val: number | null) => {
    onLayoutChange({
      ...layout,
      [key]: val || undefined
    });
  };

  // Obtener categorías únicas
  const categories = Object.keys(PAPER_CATEGORY_LABELS).filter(cat => 
    Object.values(PAPER_SIZES).some(size => size.category === cat)
  );

  return (
    <div className="print-settings-section" style={{ padding: '24px' }}>
      <Title level={5} style={{ margin: '0 0 16px 0', color: '#6b7280', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '0.05em' }}>
        Papel y Dimensiones
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          format: layout.format,
          orientation: layout.orientation,
          width: layout.width,
          height: layout.height
        }}
      >
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <Form.Item 
            name="format" 
            label={<span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Formato</span>}
            style={{ flex: 1, marginBottom: 0 }}
          >
            <Select 
              onChange={handleFormatChange}
              value={layout.format}
              size="middle"
              placeholder="Selecciona un formato"
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              disabled={readOnly}
            >
              {/* Generar opciones agrupadas por categoría */}
              {categories.map(category => (
                <Select.OptGroup key={category} label={PAPER_CATEGORY_LABELS[category]}>
                  {Object.entries(PAPER_SIZES)
                    .filter(([_, size]) => size.category === category)
                    .map(([key, size]) => (
                      <Option key={key} value={key}>
                        {size.label}
                      </Option>
                    ))
                  }
                </Select.OptGroup>
              ))}
              
              {/* Separador visual */}
              <Option disabled value="separator" style={{ borderTop: '1px solid #e5e7eb', margin: '8px 0', padding: 0 }}>───</Option>
              
              {/* Opción personalizada */}
              <Option value="custom">✏️ -- Personalizado --</Option>
            </Select>
          </Form.Item>

          <Form.Item 
            name="orientation" 
            label={<span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Orientación</span>}
            style={{ flex: 1, marginBottom: 0 }}
          >
            <Select 
              onChange={handleOrientationChange}
              value={layout.orientation}
              disabled={isCustom || readOnly}
              size="middle"
              style={{ width: '100%' }}
            >
              <Option value={false}>Vertical</Option>
              <Option value={true}>Horizontal</Option>
            </Select>
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Form.Item 
            name="width" 
            label={<span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Ancho (mm)</span>}
            style={{ flex: 1, marginBottom: 0 }}
          >
            <InputNumber
              min={0}
              step={0.1}
              value={layout.width ?? 0}
              disabled={!isCustom || readOnly}
              onChange={(val) => handleDimensionChange('width', val)}
              style={{ width: '100%' }}
              placeholder={isCustom ? "Ingresa ancho" : "Selecciona formato"}
              controls={true}
              precision={1}
            />
          </Form.Item>

          <Form.Item 
            name="height" 
            label={<span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Alto (mm)</span>}
            style={{ flex: 1, marginBottom: 0 }}
          >
            <InputNumber
              min={0}
              step={0.1}
              value={layout.height ?? 0}
              disabled={!isCustom || readOnly}
              onChange={(val) => handleDimensionChange('height', val)}
              style={{ width: '100%' }}
              placeholder={isCustom ? "Ingresa alto" : "Selecciona formato"}
              controls={true}
              precision={1}
            />
          </Form.Item>
        </div>

        {/* Mensaje informativo cuando está en modo preset */}
        {!isCustom && layout.width && layout.height && (
          <div style={{ 
            marginTop: '12px', 
            fontSize: '12px', 
            color: '#6b7280',
            backgroundColor: '#f9fafb',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }}>
            ℹ️ Dimensiones predefinidas: {layout.width} x {layout.height} mm
            {layout.orientation === true && ' (Horizontal)'}
          </div>
        )}
      </Form>
    </div>
  );
};
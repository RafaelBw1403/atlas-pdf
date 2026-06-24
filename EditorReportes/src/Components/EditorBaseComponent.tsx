// EditorBaseComponent.tsx - Versión con botón de formateo
import { memo, useState } from 'react';
import { Button, Space, Tooltip } from 'antd';
import { FormatPainterOutlined } from '@ant-design/icons';
import MonacoCodeEditor from './MonacoEditor/MonacoCodeEditor';
import { useCodeFormatter } from '../hooks/useCodeFormatter';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  language: "html" | "css" | "json";
  jsonSchema?: object;
  error?: string;
  path?: string;
  autocompleteJson?: Record<string, any>;
  readOnly?: boolean;
  onAttemptEditLocked?: () => void;
}

export const EditorBaseComponent = memo(({
  label,
  value,
  onChange,
  language,
  jsonSchema,
  error,
  path, 
  autocompleteJson,
  readOnly = false,
  onAttemptEditLocked = () => {},
}: Props) => {
  const { formatCode, isValidCode } = useCodeFormatter();
  const [formatTrigger, setFormatTrigger] = useState(0);


  const handleFormat = () => {
    try {
      if (language === 'json' && !isValidCode(value, language)) {
        console.warn('Código JSON inválido, no se puede formatear');
        return;
      }
      
      const formatted = formatCode(value, language);
      onChange(formatted);
      // Trigger para el efecto en MonacoCodeEditor
      setFormatTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error formateando código:', error);
    }
  };

  return (
    <div className="editor-host" style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      {/* Header con botón de formateo */}
      <div style={{ 
        padding: "8px 12px", 
        background: "#1e1e1e", 
        borderBottom: "1px solid #333",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span style={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}>
          {label}
        </span>
        
        <Space>
          {!readOnly && (
            <Tooltip title="Formatear código (Ctrl+Shift+F)">
              <Button 
                type="text" 
                icon={<FormatPainterOutlined />} 
                onClick={handleFormat}
                size="small"
                style={{ color: "#fff" }}
              >
                Formatear
              </Button>
            </Tooltip>
          )}
        </Space>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <MonacoCodeEditor
          value={value}
          onChange={onChange}
          language={language}
          onFormat={formatTrigger}
          autocompleteJson={autocompleteJson || {}}
          readOnly={readOnly}
          onAttemptEditLocked={onAttemptEditLocked}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{ 
          background: "#ff4d4f", 
          color: "#fff", 
          padding: "8px 12px", 
          fontSize: "12px",
          borderTop: "1px solid #ff7875"
        }}>
          {error}
        </div>
      )}
    </div>
  );
});
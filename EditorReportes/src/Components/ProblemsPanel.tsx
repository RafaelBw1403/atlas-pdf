import { useState } from "react";
import { Typography, Collapse, Tag } from "antd";
import { WarningFilled, DownOutlined, UpOutlined } from "@ant-design/icons";
import type { CompileErrorDetail } from "../utils/reportEngine";

const { Text } = Typography;

type Props = {
  errors: CompileErrorDetail[];
  data?: any;
  collapsible?: boolean;
};

const findRelevantLines = (template: string, message: string): Array<{ line: number; content: string }> => {
  if (!template) return [];
  const lines = template.split('\n');
  const results: Array<{ line: number; content: string }> = [];

  const keywords: string[] = [];
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('currency')) keywords.push('currency');

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l.includes('{{')) continue;
    if (keywords.length > 0 && !keywords.some(kw => l.includes(kw))) continue;
    results.push({ line: i + 1, content: l });
  }
  return results;
};

const renderTemplateWithLineNumbers = (template: string) => {
  if (!template) return <Text type="secondary">(vacío)</Text>;
  const arr = template.split('\n');
  return (
    <pre style={{ fontSize: 12, lineHeight: 1.6, maxHeight: 300, overflow: 'auto', background: '#f6f8fa', padding: 8, borderRadius: 4, margin: 0, fontFamily: 'Consolas, monospace' }}>
      {arr.map((line, i) => (
        <div key={i} style={{ display: 'flex' }}>
          <span style={{ color: '#999', userSelect: 'none', minWidth: 36, textAlign: 'right', marginRight: 12 }}>{i + 1}</span>
          <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{line}</span>
        </div>
      ))}
    </pre>
  );
};

const formatJson = (data: any): string => {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

export const ProblemsPanel = ({ errors, data, collapsible }: Props) => {
  const [expanded, setExpanded] = useState(true);
  const count = errors?.length || 0;

  if (count === 0) return null;

  const header = collapsible ? (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 16px',
        cursor: 'pointer',
        background: expanded ? '#fff2f0' : '#fafafa',
        borderTop: '2px solid #ff4d4f',
        userSelect: 'none',
      }}
    >
      <WarningFilled style={{ color: '#ff4d4f', fontSize: 14 }} />
      <Text strong style={{ fontSize: 13, color: '#cf1322' }}>
        {count} error{count !== 1 ? 'es' : ''} de compilación
      </Text>
      <span style={{ flex: 1 }} />
      {expanded ? <DownOutlined style={{ fontSize: 12, color: '#999' }} /> : <UpOutlined style={{ fontSize: 12, color: '#999' }} />}
    </div>
  ) : (
    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
      <WarningFilled style={{ color: '#ff4d4f', fontSize: 18 }} />
      <Text strong style={{ fontSize: 16, color: '#cf1322' }}>
        {count} error{count !== 1 ? 'es' : ''} de compilación
      </Text>
    </div>
  );

  const body = (!collapsible || expanded) && (
    <div style={{ overflow: 'auto', maxHeight: collapsible ? '40vh' : undefined, padding: collapsible ? 12 : 0 }}>
      {errors.map((err, idx) => {
        const lines = findRelevantLines(err.template, err.message);
        return (
          <div
            key={idx}
            style={{
              background: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: 6,
              padding: 12,
              marginBottom: 12
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <Tag color="red" style={{ marginRight: 8 }}>{err.part}</Tag>
              <Text strong style={{ color: '#cf1322', fontFamily: 'Consolas, monospace' }}>{err.message}</Text>
            </div>

            {lines.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  Posibles líneas en el template ({err.part}):
                </Text>
                <div style={{ background: '#fff', borderRadius: 4, padding: '6px 8px', fontSize: 12, fontFamily: 'Consolas, monospace', maxHeight: 200, overflow: 'auto' }}>
                  {lines.slice(0, 15).map((l, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 2 }}>
                      <span style={{ color: '#999', minWidth: 28, textAlign: 'right' }}>{l.line}</span>
                      <span style={{ color: '#333' }}>{l.content}</span>
                    </div>
                  ))}
                  {lines.length > 15 && (
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>... y {lines.length - 15} líneas más</Text>
                  )}
                </div>
              </div>
            )}

            <Collapse ghost size="small" items={[
              {
                key: 'template',
                label: <Text style={{ fontSize: 12 }}>Ver template completo ({err.part})</Text>,
                children: renderTemplateWithLineNumbers(err.template)
              },
              ...(data ? [{
                key: 'data',
                label: <Text style={{ fontSize: 12 }}>Ver datos JSON</Text>,
                children: (
                  <pre style={{ fontSize: 12, maxHeight: 300, overflow: 'auto', background: '#f6f8fa', padding: 8, borderRadius: 4, margin: 0, fontFamily: 'Consolas, monospace' }}>
                    {formatJson(data)}
                  </pre>
                )
              }] : [])
            ]} />
          </div>
        );
      })}

      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
        Revisa la consola del navegador (F12 → Console) para más detalles sobre cada error.
      </Text>
    </div>
  );

  return collapsible ? (
    <div style={{ background: '#fff' }}>
      {header}
      {body}
    </div>
  ) : (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      {header}
      {body}
    </div>
  );
};

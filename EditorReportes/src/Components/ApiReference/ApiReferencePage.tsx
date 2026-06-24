import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Col,
  Row,
  Select,
  Space,
  Typography,
  Divider,
  Tag,
  Input,
  Tabs,
  Alert,
  Spin,
  Empty,
} from 'antd';
import {
  KeyOutlined,
  FileTextOutlined,
  ApiOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { useReportStore } from '../../store/useReportStore';
import { useApiKeyActions } from '../../hooks/useApiKeyActions';

const { Title, Text } = Typography;
const { TextArea } = Input;

const API_BASE_URL = import.meta.env.VITE_API_BACK_URL || 'http://localhost:4000';
const API_PDF_URL = import.meta.env.VITE_API_PDF_URL || 'http://localhost:4000/api/pdf';

type Stage = 'draft' | 'qa' | 'production' | 'historical';

const STAGE_LABELS: Record<Stage, string> = {
  draft: 'Borrador',
  qa: 'QA',
  production: 'Producción',
  historical: 'Histórico',
};

const STAGE_COLORS: Record<Stage, string> = {
  draft: 'blue',
  qa: 'orange',
  production: 'green',
  historical: 'purple',
};

export const ApiReferencePage = () => {
  const { documents, getDocumentsByOwner } = useReportStore();
  const { devApiKey, prodApiKey } = useApiKeyActions({ autoFetch: true, autoCreateMissing: true });

  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [selectedStage, setSelectedStage] = useState<Stage>('production');
  const [selectedEnv, setSelectedEnv] = useState<'dev' | 'prod'>('dev');
  const [sampleData, setSampleData] = useState('{\n  "cliente": "Ejemplo SA de CV",\n  "fecha": "2026-06-17"\n}');

  useEffect(() => {
    getDocumentsByOwner();
  }, [getDocumentsByOwner]);

  const uniqueDocs = useMemo(() => {
    const seen = new Set<string>();
    return documents.filter((doc) => {
      const gid = doc.documentGroupId || doc.id;
      if (seen.has(gid)) return false;
      seen.add(gid);
      return true;
    });
  }, [documents]);

  const selectedDoc = useMemo(
    () => documents.find((d) => d.id === selectedDocId || d.documentGroupId === selectedDocId),
    [documents, selectedDocId],
  );

  const groupVersions = useMemo(
    () => documents.filter((d) => d.documentGroupId === selectedDoc?.documentGroupId),
    [documents, selectedDoc],
  );

  const availableStages = useMemo(() => {
    const stages = new Set(groupVersions.map((d) => d.stage));
    return (['draft', 'qa', 'production', 'historical'] as Stage[]).filter((s) => stages.has(s));
  }, [groupVersions]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (availableStages.length > 0 && !availableStages.includes(selectedStage)) {
      setSelectedStage(availableStages[0]);
    }
  }, [availableStages]);

  useEffect(() => {
    if (selectedDoc?.sampleData && Object.keys(selectedDoc.sampleData).length > 0) {
      setSampleData(JSON.stringify(selectedDoc.sampleData, null, 2));
    }
  }, [selectedDoc]);

  const activeKey = selectedEnv === 'dev' ? devApiKey?.apiKey : prodApiKey?.apiKey;
  const groupId = selectedDoc?.documentGroupId || '';
  const docId = selectedDoc?.id || '';

  const codeExamples = {
    curlByGroup: `curl -X POST ${API_PDF_URL}/generatePdfByGroup \\
  -H "Content-Type: application/json" \\
  -d '{
    "apiKey": "${activeKey || 'sk_xxx'}",
    "id": "${groupId || 'document-group-id'}",
    "stage": "${selectedStage}",
    "data": ${sampleData || '{}'},
    "deleteImmediately": false,
    "expiresInMinutes": 5
  }'`,
    fetchByGroup: `const response = await fetch('${API_PDF_URL}/generatePdfByGroup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: '${activeKey || 'sk_xxx'}',
    id: '${groupId || 'document-group-id'}',
    stage: '${selectedStage}',
    data: ${sampleData || '{}'},
    deleteImmediately: false,
    expiresInMinutes: 5
  })
});

const result = await response.json();
// result.sseUrl → conectar a SSE para progreso
// result.jobId  → ID del trabajo en cola`,
    fetchTsByGroup: `interface GeneratePDFResponse {
  success: boolean;
  jobId: string;
  sseUrl: string;
  status: string;
}

const generatePDF = async (
  apiKey: string,
  documentGroupId: string,
  stage: 'draft' | 'qa' | 'production',
  data: Record<string, unknown>,
  deleteImmediately?: boolean,
  expiresInMinutes?: number
): Promise<GeneratePDFResponse> => {
  const res = await fetch('${API_PDF_URL}/generatePdfByGroup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, id: documentGroupId, stage, data, deleteImmediately, expiresInMinutes }),
  });
  return res.json();
};

// Uso:
const result = await generatePDF(
  '${activeKey || 'sk_xxx'}',
  '${groupId || 'document-group-id'}',
  '${selectedStage}',
  ${sampleData || '{}'},
  false,   // deleteImmediately
  5        // expiresInMinutes
);
console.log(result.sseUrl); // Escuchar progreso`,
    curlSimple: `curl -X POST ${API_PDF_URL}/generatePdf \\
  -H "Content-Type: application/json" \\
  -d '{
    "apiKey": "${activeKey || 'sk_xxx'}",
    "documentId": "${docId || 'document-id'}",
    "data": ${sampleData || '{}'},
    "deleteImmediately": false,
    "expiresInMinutes": 5
  }'`,
    fetchTsSimple: `const res = await fetch('${API_PDF_URL}/generatePdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: '${activeKey || 'sk_xxx'}',
    documentId: '${docId || 'document-id'}',
    data: ${sampleData || '{}'},
    deleteImmediately: false,
    expiresInMinutes: 5
  })
});
const result = await res.json();
console.log('PDF generado:', result.sseUrl);`,
  };

  const endpointTabs = [
    {
      key: 'byGroup',
      label: 'Por grupo + etapa (recomendado)',
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message="Recomendado para entorno productivo"
            description="Usa documentGroupId + stage. Siempre obtienes la versión activa del stage indicado. El campo data es requerido. Ideal para integrar con sistemas externos."
          />
          <Card size="small" title={<><CodeOutlined /> cURL</>}>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 13, margin: 0 }}>
              <code>{codeExamples.curlByGroup}</code>
            </pre>
          </Card>
          <Card size="small" title={<><CodeOutlined /> JavaScript (fetch)</>}>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 13, margin: 0 }}>
              <code>{codeExamples.fetchByGroup}</code>
            </pre>
          </Card>
          <Card size="small" title={<><CodeOutlined /> TypeScript (tipado)</>}>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 13, margin: 0 }}>
              <code>{codeExamples.fetchTsByGroup}</code>
            </pre>
          </Card>

          <Card
            size="small"
            title={
              <Space>
                <CodeOutlined />
                <span>Función reusable: <Text code>listenPDFProgress</Text> (SSE)</span>
              </Space>
            }
          >
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 13, margin: 0 }}>
              <code>{`/**
 * Escucha el progreso de generación de un PDF vía SSE.
 * Resuelve cuando el PDF está listo, rechaza si hay error.
 */
function listenPDFProgress(sseUrl: string): Promise<{ slug: string; url: string }> {
  return new Promise((resolve, reject) => {
    const source = new EventSource(sseUrl);

    source.addEventListener('progreso', (e) => {
      const data = JSON.parse(e.data);
      console.log(\`[\${data.porcentaje}%] \${data.mensaje}\`);
    });

    source.addEventListener('completado', (e) => {
      const data = JSON.parse(e.data);
      source.close();
      resolve({ slug: data.slug, url: data.url });
    });

    source.addEventListener('error', (e) => {
      const data = JSON.parse(e.data);
      source.close();
      reject(new Error(data.message || 'Error desconocido'));
    });

    // Timeout de seguridad (5 min)
    setTimeout(() => {
      source.close();
      reject(new Error('Tiempo de espera agotado'));
    }, 300_000);
  });
}`}</code>
            </pre>
          </Card>

          <Card
            size="small"
            title={
              <Space>
                <CodeOutlined />
                <span>Uso completo: generar PDF + escuchar progreso</span>
              </Space>
            }
          >
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 13, margin: 0 }}>
              <code>{`async function generatePDF() {
  // 1. Iniciar generación por grupo + etapa
  const res = await fetch('${API_PDF_URL}/generatePdfByGroup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: '${activeKey || 'sk_xxx'}',
      id: '${groupId || 'document-group-id'}',
      stage: '${selectedStage}',
      data: ${sampleData || '{}'},
      deleteImmediately: false,
      expiresInMinutes: 5
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al generar PDF');
  }

  const { sseUrl } = await res.json();
  console.log('PDF en cola, escuchando progreso...');

  // 2. Escuchar progreso hasta completar
  const pdf = await listenPDFProgress(
    \`${API_BASE_URL}\${sseUrl}\`
  );

  console.log('PDF listo:', pdf.url);
  return pdf;
}

// ── Ejecutar ─────────────────────────────────────
generatePDF()
  .then((pdf) => {
    // pdf.url → {BASE_URL}/api/pdf/v/<slug>
    window.open(pdf.url, '_blank');
  })
  .catch((err) => console.error(err));`}</code>
            </pre>
          </Card>
        </Space>
      ),
    },
    {
      key: 'simple',
      label: 'Por documentId',
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            type="warning"
            showIcon
            message="Genera el PDF de la versión exacta"
            description="
            Es el ID de una versión en particular — no del documento completo. Si mañana publicas una nueva versión y eliminas esta, el ID ya no servirá. El método por grupo + stage resuelve este problema porque siempre apunta a la versión activa sin importar sus cambios.
            
            Nota: Cada documento tiene un id de grupo Grupo: 3a18d5... y un id de la versión ID: 6a32e53f...
            "
          />
          <Card size="small" title={<><CodeOutlined /> cURL</>}>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 13, margin: 0 }}>
              <code>{codeExamples.curlSimple}</code>
            </pre>
          </Card>
          <Card size="small" title={<><CodeOutlined /> TypeScript</>}>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 13, margin: 0 }}>
              <code>{codeExamples.fetchTsSimple}</code>
            </pre>
          </Card>
        </Space>
      ),
    },
    {
      key: 'webhook',
      label: 'Con webhook',
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message="Generación asíncrona con callback"
            description="Útil para procesos batch o cuando no quieres mantener una conexión SSE abierta. El PDF se envía a tu webhook cuando termina."
          />
          <Card size="small" title={<><CodeOutlined /> cURL</>}>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 13, margin: 0 }}>
              <code>{`curl -X POST ${API_PDF_URL}/generatePdfWebhook \\
  -H "Content-Type: application/json" \\
  -d '{
    "apiKey": "${activeKey || 'sk_xxx'}",
    "id": "${docId || 'document-id'}",
    "webhookUrl": "https://tu-servidor.com/webhook-pdf",
    "data": ${sampleData || '{}'},
    "deleteImmediately": false,
    "expiresInMinutes": 5
  }'`}</code>
            </pre>
          </Card>
          <Card size="small" title={<><CodeOutlined /> TypeScript</>}>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 13, margin: 0 }}>
              <code>{`const res = await fetch('${API_PDF_URL}/generatePdfWebhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: '${activeKey || 'sk_xxx'}',
    id: '${docId || 'document-id'}',
    webhookUrl: 'https://tu-servidor.com/webhook-pdf',
    data: ${sampleData || '{}'},
    deleteImmediately: false,
    expiresInMinutes: 5
  })
});
const result = await res.json();
// Tu webhook recibirá: { event, jobId, slug, url }`}</code>
            </pre>
          </Card>
        </Space>
      ),
    },
    {
      key: 'webhookByGroup',
      label: 'Por grupo + webhook',
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message="Generación por grupo + etapa con callback"
            description="Combina la flexibilidad de grupo+etapa con notificación vía webhook. Ideal para integraciones server-to-server donde no conviene mantener SSE abierto."
          />
          <Card size="small" title={<><CodeOutlined /> cURL</>}>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 13, margin: 0 }}>
              <code>{`curl -X POST ${API_PDF_URL}/generatePdfWebhookByGroup \\
  -H "Content-Type: application/json" \\
  -d '{
    "apiKey": "${activeKey || 'sk_xxx'}",
    "idGroup": "${groupId || 'document-group-id'}",
    "stage": "${selectedStage}",
    "webhookUrl": "https://tu-servidor.com/webhook-pdf",
    "data": ${sampleData || '{}'},
    "deleteImmediately": false,
    "expiresInMinutes": 5
  }'`}</code>
            </pre>
          </Card>
          <Card size="small" title={<><CodeOutlined /> JavaScript (fetch)</>}>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 13, margin: 0 }}>
              <code>{`const response = await fetch('${API_PDF_URL}/generatePdfWebhookByGroup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: '${activeKey || 'sk_xxx'}',
    idGroup: '${groupId || 'document-group-id'}',
    stage: '${selectedStage}',
    webhookUrl: 'https://tu-servidor.com/webhook-pdf',
    data: ${sampleData || '{}'},
    deleteImmediately: false,
    expiresInMinutes: 5
  })
});

const result = await response.json();
// result.jobId → ID del trabajo en cola
// El webhook recibirá: { event, jobId, slug, url }`}</code>
            </pre>
          </Card>
        </Space>
      ),
    },

  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1000px',  overflowY: "auto" }}>
      <div style={{ marginBottom: 32 }}>
        <Space align="center">
          <ApiOutlined style={{ fontSize: 28, color: '#1890ff' }} />
          <div>
            <Title level={2} style={{ margin: 0 }}>API Reference</Title>
            <Text type="secondary">
              Integra la generación de PDF desde cualquier sistema externo
            </Text>
          </div>
        </Space>
      </div>

      {/* Selectores */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card size="small" title={<Space><KeyOutlined /> API Key</Space>}>
            <Select
              style={{ width: '100%' }}
              value={selectedEnv}
              onChange={setSelectedEnv}
              options={[
                {
                  value: 'dev',
                  label: `Development${devApiKey?.apiKey ? ' ✅' : ' ❌'}`,
                },
                {
                  value: 'prod',
                  label: `Production${prodApiKey?.apiKey ? ' ✅' : ' ❌'}`,
                },
              ]}
            />
            {activeKey ? (
              <Tag color="blue" style={{ marginTop: 8, display: 'block', textAlign: 'center' }}>
                {activeKey.slice(0, 20)}...
              </Tag>
            ) : (
              <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                Sin API Key — crea una en API Keys
              </Text>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card size="small" title={<Space><FileTextOutlined /> Documento</Space>}>
            {uniqueDocs.length === 0 ? (
              <Spin size="small" />
            ) : (
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="Seleccionar documento..."
                value={selectedDocId}
                onChange={setSelectedDocId}
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
                options={uniqueDocs.map((doc) => ({
                  value: doc.documentGroupId || doc.id,
                  label: doc.name,
                }))}
                notFoundContent={<Empty description="Sin documentos" />}
              />
            )}
            {selectedDoc && (
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 6 }} copyable={{ text: groupId }}>
                Grupo: {groupId.slice(0, 16)}...
              </Text>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card size="small" title="Stage">
            {!selectedDoc ? (
              <Text type="secondary" style={{ fontSize: 13 }}>Selecciona un documento</Text>
            ) : availableStages.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 13 }}>Sin versiones activas</Text>
            ) : (
              <>
                <Select
                  style={{ width: '100%' }}
                  value={selectedStage}
                  onChange={setSelectedStage}
                  options={availableStages.map((s) => ({
                    value: s,
                    label: STAGE_LABELS[s],
                  }))}
                />
                <Tag
                  color={STAGE_COLORS[selectedStage]}
                  style={{ marginTop: 8, display: 'block', textAlign: 'center' }}
                >
                  {STAGE_LABELS[selectedStage]}
                </Tag>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} md={24}>
          <Card size="small" title="Payload JSON">
            <TextArea
              rows={3}
              value={sampleData}
              onChange={(e) => setSampleData(e.target.value)}
              placeholder='{"cliente": "Ejemplo"}'
              style={{ fontFamily: 'monospace', fontSize: 12 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Endpoints */}
      <Divider style={{ margin: '16px 0' }} />
      <Title level={4}>Endpoints</Title>
      <Tabs items={endpointTabs} />

      <Divider style={{ margin: '16px 0' }} />
      <Card size="small" style={{ background: '#fafafa' }}>
        <Space direction="vertical" size="small">
          <Text strong>Notas importantes:</Text>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
            <li>La API Key se valida contra el usuario autenticado — asegúrate de usar la key correcta según el entorno</li>
            <li>Los PDFs generados expiran automáticamente (default: 5 min, configurable con <Tag>expiresInMinutes</Tag>)</li>
            <li>Si usas <Tag>deleteImmediately: true</Tag>, el PDF se elimina justo después de entregarse al cliente</li>
            <li>Para producción, siempre usa <Tag>stage: "production"</Tag> para obtener la versión publicada sin marca de agua</li>
          </ul>
        </Space>
      </Card>
    </div>
  );
};

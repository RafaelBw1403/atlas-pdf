import { useState } from 'react';
import Swal from 'sweetalert2';
import {
    Drawer,
    Tag,
    Button,
    Typography,
    Space,
    Tooltip,
    Modal,
    Input,
    Popconfirm,
    Spin,
    Alert,
    Empty,
    Divider,
} from 'antd';
import {
    CheckCircleFilled,
    EditOutlined,
    EyeOutlined,
    DeleteOutlined,
    RocketOutlined,
    CopyOutlined,
    HistoryOutlined,
    ExperimentOutlined,
    CrownOutlined,
} from '@ant-design/icons';
import type { IDocument } from '../interfaces/IGeneric';
import { useTemplateVersions } from '../hooks/useTemplateVersions';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

const { Text, Paragraph } = Typography;

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface VersionHistoryPanelProps {
    /** documentGroupId del grupo de versiones */
    documentGroupId: string | null | undefined;
    /** Callback cuando el usuario quiere ver/editar una versión */
    onOpenVersion?: (version: IDocument) => void;
    /** Callback para previsualizar PDF de una versión */
    onPreviewVersion?: (version: IDocument) => void;
    open: boolean;
    onClose: () => void;
    /** ID de la versión actualmente abierta en el editor (para resaltarla) */
    currentVersionId?: string | null;
    /** Callback cuando se publica/restaura a producción — pasa el nuevo documentGroupId del grupo */
    onPublishSuccess?: (newDocumentGroupId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────
export const VersionHistoryPanel = ({
    documentGroupId,
    onOpenVersion,
    onPreviewVersion,
    open,
    onClose,
    currentVersionId,
    onPublishSuccess,
}: VersionHistoryPanelProps) => {
    const {
        versions,
        loadingVersions,
        versionsError,
        publishing,
        creatingDraft,
        deletingVersion,
        publishingToQA,
        hasDraft,
        draftVersion,
        productionVersion,
        qaVersion,
        publishTemplate,
        createDraft,
        deleteVersion,
        publishToQA,
    } = useTemplateVersions(documentGroupId);

    // Modal "Publicar a Producción"
    const [publishModalOpen, setPublishModalOpen] = useState(false);
    const [publishComment, setPublishComment] = useState('');
    const [publishTargetVersion, setPublishTargetVersion] = useState<IDocument | null>(null);

    // Modal "Publicar en QA"
    const [qaModalOpen, setQaModalOpen] = useState(false);
    const [qaSelectedVersion, setQaSelectedVersion] = useState<IDocument | null>(null);

    const handlePublish = async () => {
        if (!publishComment.trim()) return;
        let newDocGroupId: string | undefined;
        if (publishTargetVersion?.stage === 'draft') {
            newDocGroupId = await publishTemplate(publishComment.trim());
        } else if (publishTargetVersion) {
            newDocGroupId = await publishTemplate(publishComment.trim(), publishTargetVersion.id);
        }
        setPublishComment('');
        setPublishTargetVersion(null);
        setPublishModalOpen(false);
        if (newDocGroupId) onPublishSuccess?.(newDocGroupId);
    };

    const handlePublishToQA = async () => {
        if (!qaSelectedVersion) return;
        await publishToQA(qaSelectedVersion.id);
        setQaSelectedVersion(null);
        setQaModalOpen(false);
    };

    // ── Render ────────────────────────────────────────────────────────────────
    const renderVersionTag = (v: IDocument) => {
        if (v.stage === 'production') return <Tag color="green" icon={<CheckCircleFilled />}>Publicado en Producción</Tag>;
        if (v.stage === 'draft')      return <Tag color="blue"  icon={<EditOutlined />}>Borrador</Tag>;
        if (v.stage === 'qa')         return <Tag color="orange" icon={<ExperimentOutlined />}>Publicado en QA</Tag>;
        return <Tag color="default">Histórica</Tag>;
    };

    const formatDate = (dateStr?: string | Date) => {
        if (!dateStr) return '—';
        return dayjs(dateStr).format('DD MMM YYYY, HH:mm');
    };

    // Separar versiones activas vs históricas
    const activeVersions = versions.filter(v => v.stage === 'draft' || v.stage === 'production' || v.stage === 'qa');
    const historicalVersions = versions.filter(v => v.stage === 'historical');
    const sortedActive = [...activeVersions].sort((a, b) => {
        const orderA = a.stage === 'production' ? 0 : a.stage === 'qa' ? 1 : 2;
        const orderB = b.stage === 'production' ? 0 : b.stage === 'qa' ? 1 : 2;
        return orderA - orderB;
    });

    const renderVersionItem = (version: IDocument) => (
        <div
            key={version.id}
            style={{
                background: version.stage === 'production'
                    ? 'rgba(82, 196, 26, 0.06)'
                    : version.stage === 'draft'
                        ? 'rgba(24, 144, 255, 0.06)'
                        : version.stage === 'qa'
                            ? 'rgba(255, 165, 0, 0.06)'
                            : 'rgba(0, 0, 0, 0.02)',
                borderRadius: 8,
                padding: '14px 16px',
                marginBottom: 10,
                border: currentVersionId === version.id
                    ? '2px solid #1890ff'
                    : '1px solid #f0f0f0',
                boxShadow: currentVersionId === version.id
                    ? '0 0 0 1px rgba(24,144,255,0.2)'
                    : 'none',
                transition: 'all 0.2s ease',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Space size={4} wrap>
                    {renderVersionTag(version)}
                    {version.id === currentVersionId && (
                        <Tag color="geekblue" icon={<EditOutlined />}>Actual</Tag>
                    )}
                </Space>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {/* Ver / Editar */}
                    <Tooltip title={
                        version.id === currentVersionId
                            ? 'Esta versión ya está abierta en el editor'
                            : version.stage === 'draft'
                                ? 'Editar este borrador'
                                : version.stage === 'qa'
                                    ? 'Editar esta versión de QA'
                                    : 'Ver código de esta versión'
                    }>
                        <Button
                            size="small"
                            disabled={version.id === currentVersionId}
                            icon={(version.stage === 'draft' || version.stage === 'qa') ? <EditOutlined /> : <EyeOutlined />}
                            onClick={() => onOpenVersion?.(version)}
                        >
                            {version.id === currentVersionId ? 'Abierto' : ((version.stage === 'draft' || version.stage === 'qa') ? 'Editar' : 'Ver código')}
                        </Button>
                    </Tooltip>

                    {/* Previsualizar PDF */}
                    <Tooltip title="Generar PDF de prueba">
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => onPreviewVersion?.(version)}
                        >
                            PDF
                        </Button>
                    </Tooltip>

                    {/* Crear draft desde esta versión */}
                    {version.stage !== 'draft' && version.stage !== 'qa' && !hasDraft && (
                        <Tooltip title="Crear un borrador editable basado en esta versión">
                            <Button
                                size="small"
                                icon={<CopyOutlined />}
                                loading={creatingDraft}
                                onClick={async () => {
                                    try {
                                        const newDraft = await createDraft(version.id);
                                        if (newDraft) {
                                            Swal.fire({ icon: 'success', title: 'Borrador creado', text: 'Ahora puedes editarlo desde la lista.', timer: 2000, toast: true, position: 'top-end', showConfirmButton: false });
                                        }
                                    } catch (err: any) {
                                        Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'No se pudo crear el borrador.' });
                                    }
                                }}
                            >
                                Usar como base
                            </Button>
                        </Tooltip>
                    )}

                    {/* Publicar en QA (todas las versiones no-QA) */}
                    {version.stage !== 'qa' && (
                        <Tooltip title={version.stage === 'draft' ? 'Publicar borrador en QA (dejará de ser editable)' : 'Publicar esta versión en QA para pruebas'}>
                            <Button
                                size="small"
                                icon={<ExperimentOutlined />}
                                loading={publishingToQA}
                                onClick={() => {
                                    setQaSelectedVersion(version);
                                    setQaModalOpen(true);
                                }}
                            >
                                Publicar en QA
                            </Button>
                        </Tooltip>
                    )}

                    {/* Publicar a Producción (drafts, QA, históricos) */}
                    {version.stage !== 'production' && version.stage !== 'draft' && (
                        <Tooltip title={version.stage === 'qa' ? 'Promover esta versión QA a producción' : 'Restaurar esta versión histórica a producción'}>
                            <Button
                                size="small"
                                type="primary"
                                icon={<RocketOutlined />}
                                loading={publishing}
                                onClick={() => {
                                    setPublishTargetVersion(version);
                                    setPublishModalOpen(true);
                                }}
                            >
                                {version.stage === 'qa' ? 'Publicar a Producción' : 'Restaurar a Producción'}
                            </Button>
                        </Tooltip>
                    )}
                    {version.stage === 'draft' && (
                        <Tooltip title="Publicar este borrador como nueva versión de producción">
                            <Button
                                size="small"
                                type="primary"
                                icon={<RocketOutlined />}
                                loading={publishing}
                                onClick={() => {
                                    setPublishTargetVersion(version);
                                    setPublishModalOpen(true);
                                }}
                            >
                                Publicar a Producción
                            </Button>
                        </Tooltip>
                    )}

                    {/* Eliminar (drafts, QA, históricos — producción bloqueado en backend) */}
                    {version.stage !== 'production' && (
                        <Popconfirm
                            title="¿Eliminar esta versión?"
                            description={
                                version.stage === 'qa'
                                    ? 'Esta versión está publicada en QA. Si la eliminas, los PDFs generados para QA dejarán de funcionar a menos que otra versión tome su lugar en QA.'
                                    : 'Esta acción no se puede deshacer.'
                            }
                            okText="Sí, eliminar"
                            cancelText="Cancelar"
                            okButtonProps={{ danger: true }}
                            onConfirm={() => deleteVersion(version.id)}
                        >
                            <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                loading={deletingVersion}
                            />
                        </Popconfirm>
                    )}
                </div>
            </div>

            <div>
                <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 2 }}>
                    {version.name}
                </Text>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                    {version.stage === 'production'
                        ? `Publicado el: ${formatDate(version.version_tag)}`
                        : version.stage === 'draft'
                            ? `Última modificación: ${formatDate(version.updatedAt)}`
                            : version.stage === 'qa'
                                ? `QA desde: ${formatDate(version.updatedAt)}`
                                : `Versión del: ${formatDate(version.version_tag)}`
                    }
                </Text>
                {version.comment && (
                    <Paragraph
                        ellipsis={{ rows: 2, expandable: true, symbol: 'más' }}
                        style={{ fontSize: 12, marginBottom: 0, marginTop: 4, color: '#595959' }}
                    >
                        {version.comment}
                    </Paragraph>
                )}
            </div>
        </div>
    );

    return (
        <>
            <Drawer
                title={
                    <Space>
                        <HistoryOutlined />
                        <span>Historial de Versiones</span>
                    </Space>
                }
                width={520}
                open={open}
                onClose={onClose}
                extra={
                    <Space split={<Divider type="vertical" />}>
                        {documentGroupId && (
                            <Text type="secondary" style={{ fontSize: 12 }} copyable={{ text: documentGroupId }}>
                                ID: {documentGroupId.slice(0, 12)}...
                            </Text>
                        )}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {versions.length} versión(es)
                        </Text>
                    </Space>
                }
            >
                {loadingVersions && <Spin tip="Cargando versiones..." style={{ display: 'block', marginTop: 48 }} />}

                {versionsError && (
                    <Alert
                        type="error"
                        message="Error al cargar versiones"
                        description={versionsError.message}
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                {!loadingVersions && versions.length === 0 && (
                    <Empty description="Esta plantilla aún no tiene versiones registradas." />
                )}

                {!loadingVersions && versions.length > 0 && (
                    <>
                        {/* Resumen de estados activos */}
                        <div style={{
                            background: '#fafafa',
                            borderRadius: 8,
                            padding: '10px 14px',
                            marginBottom: 16,
                            border: '1px solid #e8e8e8',
                        }}>
                            <Space size={[12, 4]} wrap>
                                <Text strong style={{ fontSize: 13 }}>Estado:</Text>
                                {productionVersion ? (
                                    <Tag color="green" icon={<CheckCircleFilled />} style={{ margin: 0 }}>
                                        Producción activa
                                    </Tag>
                                ) : (
                                    <Tag style={{ margin: 0 }}>Sin producción</Tag>
                                )}
                                {qaVersion ? (
                                    <Tag color="orange" icon={<ExperimentOutlined />} style={{ margin: 0 }}>
                                        QA activo
                                    </Tag>
                                ) : (
                                    <Tag style={{ margin: 0 }}>Sin QA</Tag>
                                )}
                                {hasDraft ? (
                                    <Tag color="blue" icon={<EditOutlined />} style={{ margin: 0 }}>
                                        Borrador disponible
                                    </Tag>
                                ) : (
                                    <Tag style={{ margin: 0 }}>Sin borrador</Tag>
                                )}
                            </Space>
                        </div>

                        {/* Sección: Activos */}
                        {sortedActive.length > 0 && (
                            <>
                                <div style={{ marginBottom: 12 }}>
                                    <Space>
                                        <CrownOutlined style={{ color: '#faad14' }} />
                                        <Text strong style={{ fontSize: 14 }}>Versiones activas</Text>
                                    </Space>
                                </div>
                                {sortedActive.map(v => renderVersionItem(v))}
                                {historicalVersions.length > 0 && <Divider style={{ margin: '16px 0' }} />}
                            </>
                        )}

                        {/* Sección: Histórico */}
                        {historicalVersions.length > 0 && (
                            <>
                                <div style={{ marginBottom: 12 }}>
                                    <Space>
                                        <HistoryOutlined style={{ color: '#8c8c8c' }} />
                                        <Text strong style={{ fontSize: 14 }}>Histórico ({historicalVersions.length})</Text>
                                    </Space>
                                </div>
                                {historicalVersions.map(v => renderVersionItem(v))}
                            </>
                        )}
                    </>
                )}
            </Drawer>

            {/* Modal: Publicar a Producción (dinámico según tipo de versión) */}
            <Modal
                title={
                    <Space>
                        <RocketOutlined style={{ color: '#52c41a' }} />
                        {publishTargetVersion?.stage === 'draft'
                            ? 'Publicar a Producción'
                            : publishTargetVersion?.stage === 'qa'
                                ? 'Publicar a Producción (desde QA)'
                                : 'Restaurar a Producción'}
                    </Space>
                }
                open={publishModalOpen}
                onCancel={() => { setPublishModalOpen(false); setPublishComment(''); setPublishTargetVersion(null); }}
                onOk={handlePublish}
                okText={publishTargetVersion?.stage === 'draft' ? 'Sí, publicar' : 'Sí, restaurar'}
                okButtonProps={{ loading: publishing, disabled: !publishComment.trim() }}
                cancelText="Cancelar"
            >
                {publishTargetVersion?.stage === 'draft' ? (
                    <>
                        <Paragraph>
                            El borrador <strong>{publishTargetVersion.name}</strong> será publicado como la nueva versión en producción.
                        </Paragraph>
                        <Paragraph type="secondary">
                            La versión anterior quedará guardada en el historial y el PDF generado <strong>no tendrá</strong> marcas de agua.
                        </Paragraph>
                    </>
                ) : publishTargetVersion?.stage === 'qa' ? (
                    <>
                        <Paragraph>
                            La versión en QA <strong>{publishTargetVersion.name}</strong> será promovida a producción.
                        </Paragraph>
                        <Paragraph type="secondary">
                            Dejará de estar marcada como QA. La versión de producción actual quedará guardada en el historial.
                        </Paragraph>
                    </>
                ) : publishTargetVersion ? (
                    <>
                        <Paragraph>
                            La versión histórica <strong>{publishTargetVersion.name}</strong> será restaurada como la nueva versión de producción.
                        </Paragraph>
                        <Paragraph type="secondary">
                            La versión de producción actual quedará guardada en el historial.
                        </Paragraph>
                    </>
                ) : null}
                <div style={{ background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 6, padding: '10px 14px', marginBottom: 16 }}>
                    <Text type="warning" style={{ fontSize: 13 }}>
                        ⚠️ <strong>Asegúrate de que la plantilla funcione correctamente.</strong> Si tiene errores, podría afectar el entorno productivo.
                    </Text>
                </div>
                <Input.TextArea
                    placeholder="Describe los cambios de esta versión (obligatorio)..."
                    rows={4}
                    maxLength={500}
                    showCount
                    value={publishComment}
                    onChange={(e) => setPublishComment(e.target.value)}
                    autoFocus
                />
            </Modal>

            {/* Modal: Publicar en QA */}
            <Modal
                title={
                    <Space>
                        <ExperimentOutlined style={{ color: '#fa8c16' }} />
                        Publicar en QA
                    </Space>
                }
                open={qaModalOpen}
                onCancel={() => { setQaModalOpen(false); setQaSelectedVersion(null); }}
                onOk={handlePublishToQA}
                okText="Sí, publicar en QA"
                okButtonProps={{ loading: publishingToQA }}
                cancelText="Cancelar"
            >
                <Paragraph>
                    Se publicará la versión <strong>{qaSelectedVersion?.name}</strong> en el entorno de QA.
                    Esta versión tendrá una marca de agua de <strong>"QA - PRUEBAS"</strong> en los PDFs generados.
                </Paragraph>
                {qaSelectedVersion?.stage === 'draft' ? (
                    <Paragraph type="secondary">
                        <strong>Nota:</strong> El borrador dejará de ser editable al publicarse en QA, pero se podrá crear un nuevo borrador desde esta versión si es necesario.
                    </Paragraph>
                ) : (
                    <Paragraph type="secondary">
                        Se creará una copia independiente en QA. La versión de producción no se verá afectada.
                    </Paragraph>
                )}
            </Modal>
        </>
    );
};

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Button,
    Card,
    Col,
    Row,
    Typography,
    Space,
    Empty,
    Breadcrumb,
    Dropdown,
    Input,
    Select,
    Badge,
    Spin,
    type MenuProps
} from 'antd';
import {
    ArrowLeftOutlined,
    PlusOutlined,
    FolderOutlined,
    HomeOutlined,
    SearchOutlined,
    SortAscendingOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { DocumentCardComponent } from './DocumentCardComponent';
import { useReportStore } from '../../store/useReportStore';
import { MoveModalComponent } from '../MoveModalComponent';
import { types } from '../../types/types';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export const FolderPage = () => {
    const { folderId } = useParams<{ folderId: string }>();
    const {
        folders,
        getFoldersByOwner,
        getDocumentsByFolder,
        setCurrentFolder,
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        selectedDocuments,
        moveSelectedDocuments,
        clearSelection,
        delDocument,
        setSelectedMoveDocuments,
        setIsOpenMoveModal
    } = useReportStore();

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const currentFolder = folders.find(f => f.id === folderId);
    const folderDocuments = getDocumentsByFolder(folderId);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            await getFoldersByOwner();
            setIsLoading(false);
        };
        load();
    }, [getFoldersByOwner]);

    useEffect(() => {
        setCurrentFolder(folderId || null);
        return () => {
            setCurrentFolder(null);
            clearSelection();
        };
    }, [folderId, setCurrentFolder, clearSelection]);

    const breadcrumbItems = [
        {
            title: <Link to="/app/documents"><HomeOutlined /> Documentos</Link>,
        },
        {
            title: (
                <Space>
                    <span>{currentFolder?.icon}</span>
                    <span>{currentFolder?.name}</span>
                </Space>
            ),
        }
    ];

    const viewModeItems: MenuProps['items'] = [
        {
            key: 'grid',
            icon: <AppstoreOutlined />,
            label: 'Vista de cuadrícula',
            onClick: () => setViewMode('grid')
        },
        {
            key: 'list',
            icon: <UnorderedListOutlined />,
            label: 'Vista de lista',
            onClick: () => setViewMode('list')
        }
    ];

    const sortItems: MenuProps['items'] = [
        {
            key: 'date',
            label: 'Por fecha',
            onClick: () => setSortBy('date')
        },
        {
            key: 'name',
            label: 'Por nombre',
            onClick: () => setSortBy('name')
        },
        {
            key: 'type',
            label: 'Por tipo',
            onClick: () => setSortBy('type')
        }
    ];

    if (isLoading) {
        return (
            <section style={{ padding: 80, textAlign: 'center' }}>
                <Spin size="large" />
                <br />
                <Text type="secondary" style={{ marginTop: 16, display: 'inline-block' }}>Cargando carpeta...</Text>
            </section>
        );
    }

    if (!currentFolder) {
        return (
            <section style={{ padding: 80 }}>
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <Title level={2}>Carpeta no encontrada</Title>
                    <Text type="secondary">La carpeta que buscas no existe o fue eliminada</Text>
                    <br />
                    <Link to="/app/documents">
                        <Button type="primary" style={{ marginTop: 20 }}>
                            Volver a Documentos
                        </Button>
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section
            style={{
                padding: 30,
                overflowY: 'auto'
            }}
            className='tabs-container'
        >
            {/* Breadcrumb */}
            <Breadcrumb
                items={breadcrumbItems}
                style={{ marginBottom: 24 }}
            />

            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 30 }}>
                <Col>
                    <Space size={16}>
                        <Link to="/app/documents">
                            <Button icon={<ArrowLeftOutlined />} type="text">
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <Title level={1} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontSize: 32 }}>{currentFolder.icon}</span>
                                {currentFolder.name}
                            </Title>
                            <Text type="secondary">
                                {folderDocuments.length} documento{folderDocuments.length !== 1 ? 's' : ''} en esta carpeta
                                {selectedDocuments.length > 0 && (
                                    <Badge
                                        count={selectedDocuments.length}
                                        style={{ marginLeft: 8 }}
                                        showZero={false}
                                    />
                                )}
                            </Text>
                            {currentFolder.description && (
                                <div>
                                    <Text type="secondary" style={{ fontSize: 14 }}>
                                        {currentFolder.description}
                                    </Text>
                                </div>
                            )}
                        </div>
                    </Space>
                </Col>
                <Col>
                    <Space>
                        {selectedDocuments.length > 0 && (
                            <Button
                                onClick={() => {
                                    setSelectedMoveDocuments(selectedDocuments);
                                    setIsOpenMoveModal(true);
                                }}
                                icon={<FolderOutlined />}
                            >
                                Mover ({selectedDocuments.length})
                            </Button>
                        )}
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`/app/editor?op=${types.documentNew}`)}>
                            Nuevo Documento
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Toolbar */}
            <Card
                size="small"
                style={{ marginBottom: 24 }}
            >
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space size="middle">
                            <Search
                                placeholder="Buscar en esta carpeta..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: 300 }}
                                allowClear
                            />

                            <Dropdown menu={{ items: sortItems }} trigger={['click']}>
                                <Button icon={<SortAscendingOutlined />}>
                                    Ordenar: {sortBy === 'date' ? 'Fecha' : sortBy === 'name' ? 'Nombre' : 'Tipo'}
                                </Button>
                            </Dropdown>
                        </Space>
                    </Col>

                    <Col>
                        <Space>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {folderDocuments.length} items
                            </Text>

                            <Dropdown menu={{ items: viewModeItems }} trigger={['click']}>
                                <Button icon={viewMode === 'grid' ? <AppstoreOutlined /> : <UnorderedListOutlined />}>
                                    {viewMode === 'grid' ? 'Cuadrícula' : 'Lista'}
                                </Button>
                            </Dropdown>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Document List */}
            <Row gutter={[16, 16]}>
                {folderDocuments.length > 0 ? (
                    folderDocuments.map((doc) => (
                        <Col
                            key={doc.id}
                            xs={24} sm={viewMode === "grid" ? 12 : 24} md={viewMode === "grid" ? 8 : 24} lg={viewMode === "grid" ? 6 : 24}
                        >
                            <DocumentCardComponent
                                doc={doc}
                                viewMode={viewMode}
                                isSelected={selectedDocuments.includes(doc.id)}
                                onSelect={() => { }}
                                // onEdit={(id) => console.log("edit", id)}
                                // onDuplicate={(id) => console.log("duplicate", id)}
                                // onMove={(id) => console.log("move", id)}
                                onDelete={(id) => delDocument(id)}
                            />
                        </Col>
                    ))
                ) : (
                    <Col xs={24}>
                        <Card>
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <span>
                                        Esta carpeta está vacía<br />
                                        <Text type="secondary">Crea un nuevo documento o mueve documentos existentes aquí</Text>
                                    </span>
                                }
                            >
                                <Space>
                                    <Button type="primary" onClick={() => navigate(`/app/editor?op=${types.documentNew}`)}>Crear Documento</Button>
                                    <Link to="/app/documents">
                                        <Button>Ver todos los documentos</Button>
                                    </Link>
                                </Space>
                            </Empty>
                        </Card>
                    </Col>
                )}
            </Row>

            <MoveModalComponent />
        </section>
    );
};
// DocumentPage.tsx - Versión completa
import { useEffect, useMemo, useState } from 'react';
import {
    Button,
    Card,
    Col,
    Row,
    Input,
    Form,
    Space,
    Dropdown,
    Typography,
    Badge,
    type MenuProps
} from 'antd';
import {
    PlusOutlined,
    FolderAddOutlined,
    SearchOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
    SortAscendingOutlined
} from '@ant-design/icons';
import { DocumentCardComponent } from './DocumentCardComponent';
import { FolderComponent } from './FolderComponent';
import { useReportStore } from '../../store/useReportStore';
import { MoveModalComponent } from '../MoveModalComponent';
import { CreateFolderModalComponent } from '../CreateFolderModalComponent';
import { Link, useNavigate } from 'react-router-dom';
import { types } from '../../types/types';
import type { IDocument } from '../../interfaces/IGeneric';

const { Title, Text } = Typography;
const { Search } = Input;

export const DocumentPage = () => {

    const getFoldersByOwner = useReportStore(state => state.getFoldersByOwner);
    const getDocumentsByOwner = useReportStore(state => state.getDocumentsByOwner);

    const setIsOpenCreateFolderModal = useReportStore(state => state.setIsOpenCreateFolderModal);
    const setIsOpenMoveModal = useReportStore(state => state.setIsOpenMoveModal);
    const setSelectedMoveDocuments = useReportStore(state => state.setSelectedMoveDocuments);
    const [form] = Form.useForm();

    const {
        folders,
        documents,
        delDocument,
        addFolder,
        deleteFolder,
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        selectedDocuments,
        moveSelectedDocuments,
        clearSelection
    } = useReportStore();

    useEffect(() => {
        getFoldersByOwner();
        getDocumentsByOwner();
    }, []);
    
    // Documentos filtrados y ordenados
    const filteredDocuments = useMemo(() => {

        let filtered = documents.filter(doc =>
            (doc.folderId === null || doc.folderId === undefined)
        );

        // Mostrar solo un documento por grupo (el de mayor prioridad: production > draft > qa > historical)
        const uniqueByGroup = new Map<string, IDocument>();
        for (const doc of filtered) {
            const groupId = doc.documentGroupId || doc.id;
            const existing = uniqueByGroup.get(groupId);
            if (!existing) {
                uniqueByGroup.set(groupId, doc);
            } else {
                const priority = (s: string) => s === 'production' ? 0 : s === 'draft' ? 1 : s === 'qa' ? 2 : 3;
                if (priority(doc.stage) < priority(existing.stage)) {
                    uniqueByGroup.set(groupId, doc);
                }
            }
        }
        filtered = Array.from(uniqueByGroup.values());

        if (searchQuery) {
            filtered = filtered.filter(doc =>
                doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                // case 'type':
                // return (a.type || '').localeCompare(b.type || '');
                case 'date':
                default:
                    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
            }
        });
    }, [documents, searchQuery, sortBy]);


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

    return (
        <section style={{ padding: "10px 50px 10px 50px", overflow: 'hidden' }}>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 30 }}>
                <Col>
                    <Title level={1} style={{ margin: 0 }}>Documentos</Title>
                    <Text type="secondary">
                        {selectedDocuments.length > 0
                            ? `${selectedDocuments.length} documento(s) seleccionado(s)`
                            : `${filteredDocuments.length} documento(s) sin carpeta`
                        }
                    </Text>
                </Col>
                <Col>
                    <Space>
                        {selectedDocuments.length > 0 && (
                            <Button
                                onClick={() => {
                                    setSelectedMoveDocuments(selectedDocuments);
                                    setIsOpenMoveModal(true);
                                }}
                                icon={<FolderAddOutlined />}
                            >
                                Mover ({selectedDocuments.length})
                            </Button>
                        )}
                        <Button
                            type="default"
                            icon={<FolderAddOutlined />}
                            onClick={() => setIsOpenCreateFolderModal(true)}
                        >
                            Nueva Carpeta
                        </Button>
                        <Link
                            type="primary"
                            // icon={<PlusOutlined />}
                            to={`/app/editor?op=${types.documentNew}`}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 16px',
                                background: '#1890ff',
                                color: 'white',
                                borderRadius: '6px',
                                textDecoration: 'none'
                            }}
                        >
                            <PlusOutlined />
                            Nuevo Documento
                        </Link>
                    </Space>
                </Col>
            </Row>

            {/* Toolbar */}
            <Card
                size="small"
                style={{ marginBottom: 24, overflowY: 'auto' }}
            // bodyStyle={{ padding: '12px 16px' }}
            >
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space size="middle">
                            <Search
                                placeholder="Buscar documentos..."
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
                                {filteredDocuments.length} items
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

            <div
                style={{
                    padding: 24,
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    // boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#ccc #f1f1f1',
                    overflowY: 'auto',
                    height: 'calc(100vh - 205px)',
                }}
            >
                {/* Folders Section */}
                <Title level={2} style={{ marginBottom: 16 }}>Carpetas</Title>
                <Row gutter={[16, 16]} style={{ marginBottom: 32 }} wrap>
                    {folders.map((folder) => {
                        const folderGrouped = documents.filter(doc => doc.folderId === folder.id);
                        const uniqueFolderDocs = new Map<string, IDocument>();
                        for (const doc of folderGrouped) {
                            const groupId = doc.documentGroupId || doc.id;
                            const existing = uniqueFolderDocs.get(groupId);
                            if (!existing) {
                                uniqueFolderDocs.set(groupId, doc);
                            } else {
                                const priority = (s: string) => s === 'production' ? 0 : s === 'draft' ? 1 : s === 'qa' ? 2 : 3;
                                if (priority(doc.stage) < priority(existing.stage)) {
                                    uniqueFolderDocs.set(groupId, doc);
                                }
                            }
                        }
                        const folderDocs = Array.from(uniqueFolderDocs.values());

                        return (
                            <Col
                                xs={24} sm={12} md={8} lg={6} key={folder.id}
                            >
                                <FolderComponent
                                    id={folder.id}
                                    name={folder.name}
                                    // icon={folder.icon}
                                    color={folder.color || "#339af0"}
                                    description={folder.description || ""}
                                    isShared={folder.isShared || false}
                                    sharedWith={folder.sharedWith || []}
                                    documentCount={folderDocs.length}
                                    onEdit={(id) => console.log("Editar folder", id)}
                                    onShare={(id) => console.log("Compartir folder", id)}
                                    onDelete={deleteFolder}
                                />
                            </Col>
                        );
                    })}

                    {/* Empty Folder Card */}
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card
                            hoverable
                            style={{
                                border: '2px dashed #d9d9d9',
                                borderRadius: 12,
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onClick={() => setIsOpenCreateFolderModal(true)}
                        >
                            <FolderAddOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                            <Text type="secondary" strong>
                                Crear nueva carpeta
                            </Text>
                        </Card>
                    </Col>
                </Row>

                {/* Documents Section */}
                <Title level={2} style={{ marginBottom: 16 }}>
                    Documentos Recientes
                    {selectedDocuments.length > 0 && (
                        <Badge
                            count={selectedDocuments.length}
                            style={{ marginLeft: 8 }}
                            showZero={false}
                        />
                    )}
                </Title>

                <Row gutter={[16, 16]}>
                    {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((doc) => (
                            <Col
                                key={doc.id}
                                xs={24}
                                sm={viewMode === "grid" ? 12 : 24}  // 2 columns on small screens
                                md={viewMode === "grid" ? 8 : 24}   // 3 columns on medium screens
                                lg={viewMode === "grid" ? 6 : 24}   // 4 columns on large screens
                            >
                                <DocumentCardComponent
                                    doc={doc}
                                    viewMode={viewMode}
                                    isSelected={selectedDocuments.includes(doc.id)}
                                    onSelect={() => { }}
                                    // onEdit={(id) =>  navigate(`app/editor/${types.documentEdit}/${id}`) }
                                    // onEdit={(id) => navigate(`/app/editor/edit/${id}`)}
                                    // onDuplicate={(id) => console.log("duplicate", id)}
                                    // onMove={(id) => console.log("move", id)}
                                    onDelete={(id) => delDocument(id)}
                                />
                            </Col>
                        ))
                    ) : (
                        <Col xs={24}>
                            <Card>
                                <div style={{ textAlign: 'center', padding: 40 }}>
                                    <SearchOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                                    <Title level={3} type="secondary">
                                        {searchQuery ? 'No se encontraron documentos' : 'No hay documentos'}
                                    </Title>
                                    <Text type="secondary">
                                        {searchQuery
                                            ? 'Intenta con otros términos de búsqueda'
                                            : 'Crea tu primer documento o agrega documentos a carpetas'
                                        }
                                    </Text>
                                </div>
                            </Card>
                        </Col>
                    )}
                </Row>

            </div>

            <CreateFolderModalComponent />
            <MoveModalComponent />
        </section>
    );
}
import React from 'react';
import Swal from 'sweetalert2';
import { Card, Button, Space, Typography, Dropdown, Checkbox, Tag, type MenuProps } from 'antd';
import {
    EditOutlined,
    CopyOutlined,
    FolderOutlined,
    DeleteOutlined,
    MoreOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useReportStore } from '../../store/useReportStore';
import type { IDocument } from '../../interfaces/IGeneric';
import { useNavigate } from 'react-router-dom';
import { types } from '../../types/types';
import { formatDate } from '../../utils/general';

const { Text, Title } = Typography;

interface DocumentCardProps {
    doc: IDocument;
    viewMode?: 'grid' | 'list';
    isSelected?: boolean;
    onSelect?: (id: string) => void;
    onDuplicate?: (id: string) => void;
    onDelete: (id: string) => void;
}

export const DocumentCardComponent: React.FC<DocumentCardProps> = ({
    doc,
    viewMode = 'grid',
    isSelected = false,
    onSelect,
    // onDuplicate,
    onDelete
}) => {
    const navigate = useNavigate();
    const { toggleDocumentSelection } = useReportStore();
    const setIsOpenMoveModal = useReportStore(state => state.setIsOpenMoveModal);
    const setSelectedMoveDocuments = useReportStore(state => state.setSelectedMoveDocuments);

    const handleSelect = () => {
        onSelect?.(doc.id);
        toggleDocumentSelection(doc.id);
    };

    const handleEdit = () => {
        navigate(`/app/editor/${types.documentEdit}/${doc.id}`)
    };

    const handleMove = (idDocument: string) => {
        setSelectedMoveDocuments([idDocument]);
        setIsOpenMoveModal(true);
    };

    const handleDelete = (id: string) => {
        Swal.fire({
            title: '¿Desea eliminar el documento?',
            text: "Si se elimina no podrà ser recuperado",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                onDelete(id);
            }
        });
    };

    // const formatDate = (date?: Date) => {
    //     if (!date) return '';
    //     return new Date(date).toLocaleDateString('es-ES', {
    //         day: '2-digit',
    //         month: '2-digit',
    //         year: 'numeric'
    //     });
    // };

    const menuItems: MenuProps['items'] = [
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Editar',
            onClick: () => handleEdit()
        },
        // {
        //     key: 'duplicate',
        //     icon: <CopyOutlined />,
        //     label: 'Duplicar',
        //     // onClick: () => onDuplicate(doc.id)
        // },
        {
            key: 'move',
            icon: <FolderOutlined />,
            label: 'Mover a carpeta',
            onClick: () => handleMove(doc.id)
        },
        {
            type: 'divider',
        },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Eliminar',
            danger: true,
            onClick: () => handleDelete(doc.id)
        }
    ];

    if (viewMode === 'list') {
        return (
            <Card
                size="small"
                style={{
                    marginBottom: 8,
                    border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    backgroundColor: isSelected ? '#f0f8ff' : '#fff'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Checkbox
                        checked={isSelected}
                        onChange={handleSelect}
                    />

                    <FileTextOutlined style={{ fontSize: 20, color: '#1890ff' }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong style={{ display: 'block', fontSize: 14 }}>
                            {doc.name}
                        </Text>
                        <Space size={8} style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Actualizado: {formatDate(doc.updatedAt)}
                            </Text>
                            {doc.stage === 'draft' && <Tag color="blue" style={{ fontSize: 11, lineHeight: '18px' }}>Borrador</Tag>}
                            {doc.stage === 'production' && <Tag color="green" style={{ fontSize: 11, lineHeight: '18px' }}>Producción</Tag>}
                            {doc.stage === 'qa' && <Tag color="orange" style={{ fontSize: 11, lineHeight: '18px' }}>QA</Tag>}
                        </Space>
                    </div>

                    <Space size="small">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={handleEdit}
                        >
                            Editar
                        </Button>

                        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                            <Button type="text" icon={<MoreOutlined />} size="small" />
                        </Dropdown>
                    </Space>
                </div>
            </Card>
        );
    }

    // Grid View
    return (
        <Card
            hoverable
            style={{
                marginBottom: 16,
                border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                backgroundColor: isSelected ? '#f0f8ff' : '#fff',
                height: '100%'
            }}
        >
            {/* Selection Checkbox */}
            <div style={{ position: 'absolute', top: 12, left: 12 }}>
                <Checkbox
                    checked={isSelected}
                    onChange={handleSelect}
                />
            </div>

            {/* Options Menu */}
            <div style={{ position: 'absolute', top: 8, right: 8 }}>
                <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} size="small" />
                </Dropdown>
            </div>

            {/* Content */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                textAlign: 'center',
                paddingTop: 8
            }}>
                {/* Icon */}
                <div style={{ marginBottom: 12 }}>
                    <FileTextOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                </div>

                {/* Document Info */}
                <div style={{ flex: 1, marginBottom: 12 }}>
                    <Text strong style={{
                        display: 'block',
                        fontSize: 14,
                        marginBottom: 4,
                        lineHeight: 1.4
                    }}>
                        {doc.name}
                    </Text>
                    <Text type="secondary" style={{
                        fontSize: 12,
                        display: 'block',
                        lineHeight: 1.4
                    }}>
                        Actualizado: {formatDate(doc.updatedAt)}
                    </Text>
                    <Space size={4} style={{ marginTop: 4, justifyContent: 'center', width: '100%' }}>
                        {doc.stage === 'draft' && <Tag color="blue" style={{ fontSize: 11, lineHeight: '18px' }}>Borrador</Tag>}
                        {doc.stage === 'production' && <Tag color="green" style={{ fontSize: 11, lineHeight: '18px' }}>Producción</Tag>}
                        {doc.stage === 'qa' && <Tag color="orange" style={{ fontSize: 11, lineHeight: '18px' }}>QA</Tag>}
                    </Space>
                </div>

                {/* Actions */}
                <div>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={handleEdit}
                        block
                    >
                        Editar
                    </Button>
                </div>
            </div>
        </Card>
    );
};
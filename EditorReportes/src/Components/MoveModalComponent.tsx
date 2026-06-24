import { Form, Modal, Select, Space, Typography } from 'antd'
import { useReportStore } from '../store/useReportStore';
import { useOrgStore } from '../store/useOrganizationStore';

const { Text } = Typography;
const { Option } = Select;

export const MoveModalComponent = () => {

    const documents = useOrgStore(state => state.documents);

    const setIsOpenMoveModal  = useReportStore( state => state.setIsOpenMoveModal );
    const isOpenMoveModal     = useReportStore(state => state.isOpenMoveModal);
    // const setSelectedMoveDocuments = useReportStore(state => state.setSelectedMoveDocuments);
    const selectedMoveDocuments = useReportStore(state => state.selectedMoveDocuments);
    const moveSingleDocument = useReportStore(state => state.moveSingleDocument);

    const moveSelectedDocuments = useReportStore(state => state.moveSelectedDocuments);
    const clearSelection = useReportStore(state => state.clearSelection);
    const getFoldersByOwner = useReportStore(state => state.getFoldersByOwner);
    const folders  = useReportStore( state => state.folders );
    const [form] = Form.useForm();

    const handleMoveDocuments = async (values: { folderId: string }) => {
        try {
            if (selectedMoveDocuments.length === 1) {
                // Single document move
                const documentId = selectedMoveDocuments[0];
                if (documentId) {
                    await moveSingleDocument(documentId, values.folderId || null);
                }
            } else if (selectedMoveDocuments.length > 1) {
                // Multiple documents move
                await moveSelectedDocuments(values.folderId || null);
            }
            setIsOpenMoveModal(false);
            clearSelection();
            getFoldersByOwner();
        } catch (error) {
            console.error('Error moving documents:', error);
        }
    };

    return (
        <Modal
            title={`Mover ${selectedMoveDocuments.length} documento(s)`}
            open={isOpenMoveModal}
            onCancel={() => setIsOpenMoveModal(false)}
            onOk={() => form.submit()}
            okText="Mover"
            cancelText="Cancelar"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleMoveDocuments}
            >
                <Form.Item
                    name="folderId"
                    label="Seleccionar carpeta destino"
                >
                    <Select placeholder="Selecciona una carpeta (dejar vacío para mover a raíz)">
                        <Option value="">📁 Raíz de documentos</Option>
                            {folders.map(folder => (
                                <Option key={folder.id} value={folder.id}>
                                    <Space>
                                        <span>{folder.icon}</span>
                                        <span>{folder.name}</span>
                                        <Text type="secondary">
                                        {/* ({folder.idDocuments.length } docs) */}
                                            {documents.filter(doc => doc.folderId === folder.id).length} docs
                                        </Text>
                                    </Space>
                                </Option>
                            ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    )
}

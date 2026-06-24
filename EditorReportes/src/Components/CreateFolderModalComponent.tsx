import { Form, Modal, Input, ColorPicker, Grid } from 'antd';
import { useReportStore } from '../store/useReportStore';

// Lista de emojis/iconos populares para carpetas
const FOLDER_ICONS = [
  '📁', '📂', '📅', '📊', '📈', '📉', '📋', '📎', '📌', '📍',
  '📝', '📑', '📒', '📓', '📔', '📕', '📖', '📗', '📘', '📙',
  '🔖', '🎯', '🏷️', '📥', '📤', '🗂️', '🗃️', '🗄️', '💼', '🎒',
  '📦', '🧰', '⭐', '🌟', '🔶', '🔷', '💛', '💙', '💚', '💜',
  '❤️', '🖤', '🤍', '💎', '🔑', '🗝️', '📜', '🎨', '🧩', '📐'
];

const { useBreakpoint } = Grid;

export const CreateFolderModalComponent = () => {
    const setIsOpenCreateFolderModal = useReportStore(state => state.setIsOpenCreateFolderModal);
    const isOpenCreateFolderModal = useReportStore(state => state.isOpenCreateFolderModal);
    const addFolder = useReportStore(state => state.addFolder);
    const [form] = Form.useForm();
    const screens = useBreakpoint();

    const handleCreateFolder = async (values: { 
        name: string; 
        description?: string;
        color?: string;
        icon?: string;
    }) => {
        try {
            await addFolder({
                name: values.name,
                description: values.description || '',
                icon: values.icon || '📁',
                color: values.color || '#339af0',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            setIsOpenCreateFolderModal(false);
            form.resetFields();
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    const handleIconSelect = (icon: string) => {
        form.setFieldValue('icon', icon);
    };

    const handleColorSelect = (color: string) => {
        form.setFieldValue('color', color);
    };

    return (
        <Modal
            title="Crear nueva carpeta"
            open={isOpenCreateFolderModal}
            onCancel={() => setIsOpenCreateFolderModal(false)}
            onOk={() => form.submit()}
            okText="Crear carpeta"
            cancelText="Cancelar"
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleCreateFolder}
                initialValues={{
                    icon: '📁',
                    color: '#339af0'
                }}
            >
                <Form.Item
                    name="name"
                    label="Nombre de la carpeta"
                    rules={[{ required: true, message: 'Por favor ingresa un nombre para la carpeta' }]}
                >
                    <Input placeholder="Ej: Proyectos 2024" />
                </Form.Item>
                
                <Form.Item
                    name="description"
                    label="Descripción (opcional)"
                >
                    <Input.TextArea 
                        placeholder="Describe el contenido de esta carpeta..."
                        rows={3}
                    />
                </Form.Item>

                {/* Selector de Color */}
                <Form.Item
                    name="color"
                    label="Color de la carpeta"
                >
                    <ColorPicker
                        format="hex"
                        onChange={(color) => handleColorSelect(color.toHexString())}
                        presets={[
                            {
                                label: 'Colores recomendados',
                                colors: [
                                    '#339af0', '#51cf66', '#ffd43b', '#ff6b6b', 
                                    '#cc5de8', '#ff922b', '#20c997', '#748ffc',
                                    '#f783ac', '#5c7cfa', '#38d9a9', '#ffa94d'
                                ],
                            },
                        ]}
                    />
                </Form.Item>

                {/* Selector de Icono */}
                {/* <Form.Item
                    name="icon"
                    label="Icono de la carpeta"
                >
                    <div style={{ 
                        border: '1px solid #d9d9d9', 
                        borderRadius: '6px', 
                        padding: '16px',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: screens.xs ? 'repeat(6, 1fr)' : 'repeat(8, 1fr)',
                            gap: '8px'
                        }}>
                            {FOLDER_ICONS.map((icon) => (
                                <div
                                    key={icon}
                                    onClick={() => handleIconSelect(icon)}
                                    style={{
                                        fontSize: '24px',
                                        textAlign: 'center',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        backgroundColor: form.getFieldValue('icon') === icon ? '#f0f0f0' : 'transparent',
                                        border: form.getFieldValue('icon') === icon ? '2px solid #1890ff' : '1px solid #e8e8e8',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (form.getFieldValue('icon') !== icon) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    {icon}
                                </div>
                            ))}
                        </div>
                    </div>
                </Form.Item> */}
            </Form>
        </Modal>
    );
};
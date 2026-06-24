import { Menu, Modal, Spin, Tooltip, type MenuProps } from "antd"
import {
    AppstoreOutlined,
    FileTextOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import Sider from "antd/es/layout/Sider";
import { useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import { types } from "../types/types";
import { useAuthStore } from "../store/useAuthStore";

export const MenuComponent = () => {

    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const deleteAccount = useAuthStore((state) => state.deleteAccount);

    const canAdmin = useAuthStore(state => state.canAdminister());

    const [deleteModalStep, setDeleteModalStep] = useState<'confirm' | 'processing' | 'success' | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleDeleteAccount = () => {
        setDeleteError(null);
        setDeleteModalStep('confirm');
    };

    const handleConfirmDelete = async () => {
        if (inputValue.toUpperCase() !== 'ELIMINAR') {
            setDeleteError('Debes escribir ELIMINAR para confirmar');
            return;
        }
        setDeleteError(null);
        setDeleteModalStep('processing');
        const result = await deleteAccount();
        if (!result.success) {
            setDeleteError(result.message || 'Error al eliminar la cuenta');
            setDeleteModalStep('confirm');
            return;
        }
        setDeleteModalStep('success');
    };

    const handleFinalRedirect = () => {
        setDeleteModalStep(null);
        logout();
    };

    const [inputValue, setInputValue] = useState('');

    const location = useLocation();

    const getSelectedKey = (pathname: string): string => {
        if (pathname.startsWith('/app/documents')) return 'documents';
        if (pathname.startsWith('/app/editor')) return 'studio';
        if (pathname.startsWith('/app/admin')) return 'adminUsers';
        if (pathname.startsWith('/app/api-key')) return 'apyKey';
        if (pathname.startsWith('/app/api-reference')) return 'api-reference';
        if (pathname.startsWith('/app/documentation')) return 'documentation';
        if (pathname.startsWith('/changePassword')) return 'changePassword';
        return 'studio';
    };

    const selectedKey = getSelectedKey(location.pathname);

    const [collapsed, setCollapsed] = useState(false);

    // Modal Paso 1: Confirmación con input "ELIMINAR"
    const confirmModal = (
        <Modal
            key="confirm"
            open={deleteModalStep === 'confirm'}
            title="Eliminar cuenta"
            okText="Eliminar cuenta"
            okButtonProps={{ danger: true }}
            cancelText="Cancelar"
            onCancel={() => { setDeleteModalStep(null); setDeleteError(null); setInputValue(''); }}
            onOk={handleConfirmDelete}
        >
            <p>Esta acción eliminará <strong>permanentemente</strong> tu cuenta y todos tus datos (documentos, carpetas, claves API, etc.).</p>
            <p>Escribe <strong>ELIMINAR</strong> para confirmar:</p>
            <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4 }}
                placeholder="ELIMINAR"
            />
            {deleteError && <p style={{ color: '#ff4d4f', marginTop: 8 }}>{deleteError}</p>}
        </Modal>
    );

    // Modal Paso 2: Procesando
    const processingModal = (
        <Modal
            key="processing"
            open={deleteModalStep === 'processing'}
            closable={false}
            footer={null}
            centered
        >
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Spin size="large" />
                <p style={{ marginTop: 16, fontSize: 16 }}>Eliminando información...</p>
            </div>
        </Modal>
    );

    // Modal Paso 3: Éxito / Despedida
    const successModal = (
        <Modal
            key="success"
            open={deleteModalStep === 'success'}
            closable={false}
            okText="Aceptar"
            onOk={handleFinalRedirect}
            cancelButtonProps={{ style: { display: 'none' } }}
            centered
        >
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: 18, fontWeight: 500 }}>Tu cuenta ha sido eliminada permanentemente.</p>
                <p style={{ marginTop: 12, fontSize: 15, color: '#595959' }}>
                    Eres bienvenido cuando lo necesites.
                </p>
            </div>
        </Modal>
    );

    const menuItems:  MenuProps['items'] = [
        {
            key: 'user',
            icon: <AppstoreOutlined />,
            label: user?.name,
            children: [
                // {
                //     key: 'nu1',
                //     label: <Link to="dashboard">Mi cuenta</Link>
                // },
                // {
                //     key: 'nu2',
                //     label: 'Planes y Pagos'
                // },
                // {
                //     key: 'nu3',
                //     label: 'Mi estatus'
                // },
                {
                    key:'changePassword',
                    label: <Link to="changePassword"> Cambio de contraseña </Link>,
                },
                {
                    key: 'nu4',
                    label: 'Cerrar sesión',
                    onClick: () => logout()
                },
                {
                    key: 'nu5',
                    label: <span style={{ color: '#ff4d4f' }}>Eliminar cuenta</span>,
                    onClick: handleDeleteAccount
                },
            ]
        },
        {
            key: `divider0`,
            type: 'divider'
        },
        {
            key: 'documents',
            label: <Link to="/app/documents">Documentos</Link>
        },
        // {
        //     key: 'snippets',
        //     label: 'Fragmentos segunda version'
        // },
        // {
        //     key: 'team',
        //     label: 'Equipo de trabajo 2da version'
        // },
        {
            key: 'studio',
            icon: <AppstoreOutlined />,
            label: <Link to={`/app/editor?op=${types.documentNew}`}>Nuevo Documento</Link>,
        },
        ...(canAdmin ? [{
            key: 'adminUsers',
            label: <Link to={`/app/admin`}>Administración Usuarios</Link>,
        }] : []),
        {
            key: `divider1`,
            type: 'divider'
        },
        {
            key: 'apyKey',
            label: <Link to="/app/api-key">API Key</Link>,
        },
        // {
        //     key: 'reportes',
        //     icon: <FileTextOutlined />,
        //     label: <Link to="/app/reportes">Mis Documentos</Link>,
        //     children: [
        //         {
        //             key: 'd1',
        //             label: (
        //                 <Tooltip title="Documento  de la jefa de joselito que es no mms que pedul muajaja 1">
        //                     <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '150px', display: 'block' }}>
        //                         Documento  de la jefa de joselito que es no mms que pedul muajaja 1
        //                     </span>
        //                 </Tooltip>
        //             )
        //         },
        //         {
        //             key: 'd2',
        //             label: 'Documento 2'
        //         }
        //     ]
        // },
        {
            key: 'api-reference',
            label: <Link to="/app/api-reference">API Reference</Link>,
        },
        {
            key: 'documentation',
            label: <Link to="/app/documentation">Documentación</Link>,
        },
        // {
        //     key: 'ajustes',
        //     icon: <SettingOutlined />,
        //     label: <Link to="/app/configuracion">Configuración</Link>,
        // },
    ];

    return (
        <Sider
            width={220}
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            className="custom-sider"
            theme="light"
        >
            {/* <div className="logo">
            {collapsed ? '' : 'Reportes'}
            </div> */}
            <Menu
                theme="light"
                mode="inline"
                selectedKeys={[selectedKey]}
                items={menuItems}
            />
            {confirmModal}
            {processingModal}
            {successModal}
        </Sider>

    )
}

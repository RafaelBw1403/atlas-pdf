import React, { useEffect } from 'react';
import { Table, Tag, Button, Space, Card, Typography, Tooltip } from 'antd';
import { 
    ReloadOutlined, 
    LockOutlined, 
    UserDeleteOutlined, 
    UserAddOutlined,
    CrownOutlined,
    StopOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import Swal from 'sweetalert2';
import { useAuthActions } from '../../hooks/useAuthActions';


const { Title } = Typography;

export const AdminUsersPage: React.FC = () => {
    const { getAllUsers, users, loading } = useAuthStore();
    const { handleToggleStatus, handleToggleAdmin, handleResetPassword } = useAuthActions();


    useEffect(() => {
        getAllUsers();
    }, [getAllUsers]);

    const handleRefresh = async () => {
        
        Swal.fire({
            title: 'Cargando...',
            text: 'Por favor espera un momento',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        await getAllUsers();
        Swal.close();
    }

    // const handleResetPassword = async ( id: string ) => {

    //     const confirm = await Swal.fire({
    //         title: '¿Estás seguro de resetear la contraseña?',
    //         icon: 'warning',
    //         showCancelButton: true,
    //         confirmButtonText: 'Sí, resetear'
    //     });

    //     if (confirm.isConfirmed) {
    //         // MOSTRAMOS LOADING
    //         Swal.fire({
    //             title: 'Procesando...',
    //             allowOutsideClick: false,
    //             didOpen: () => { Swal.showLoading() }
    //         });

    //         await resetPassword( id );

    //     }
    // }

    // const handleToggleStatus = async (id: string, active: boolean) => {
    //     // Dinamizamos el texto según el estado actual
    //     const accion = active ? 'inactivar' : 'activar';

    //     const confirm = await Swal.fire({
    //         title: `¿Estás seguro de ${accion} al usuario?`,
    //         icon: 'warning',
    //         showCancelButton: true,
    //         confirmButtonText: 'Sí, continuar', // Antes decía "resetear"
    //         cancelButtonText: 'Cancelar'
    //     });

    //     if (confirm.isConfirmed) {
    //         // 1. Mostramos el loading inmediatamente
    //         Swal.fire({
    //             title: 'Procesando...',
    //             allowOutsideClick: false,
    //             didOpen: () => { Swal.showLoading() }
    //         });

    //         try {
    //             // 2. IMPORTANTE: Usar await para esperar la respuesta del servidor
    //             // Pasamos 'active' para que el store sepa qué valor negar o validar
    //             await toggleStatus(id, active); 
                
    //             // 3. El Swal.close() o el Swal de éxito debería estar DENTRO de toggleStatus
    //             // o lo puedes poner aquí si toggleStatus no lanza alertas.
    //         } catch (error) {
    //             Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
    //         }
    //     }
    // };

    const columns = [
        {
            title: 'Nombre',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <b>{text}</b>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Estado',
            dataIndex: 'active',
            key: 'active',
            render: (active: boolean) => (
                <Tag color={active ? 'green' : 'volcano'}>
                    {active ? 'ACTIVO' : 'INACTIVO'}
                </Tag>
            ),
        },
        {
            title: 'Admin',
            dataIndex: 'isAdmin',
            key: 'isAdmin',
            render: (isAdmin: boolean) => (
                <Tag icon={<CrownOutlined />} color={isAdmin ? 'gold' : 'default'}>
                    {isAdmin ? 'SI' : 'NO'}
                </Tag>
            ),
        },
        {
            title: 'Acciones',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title={record.active ? "Desactivar usuario" : "Activar usuario"}>
                        <Button 
                            type={record.active ? "default" : "primary"}
                            danger={record.active}
                            icon={record.active ? <UserDeleteOutlined /> : <UserAddOutlined />}
                            onClick={() => handleToggleStatus(record.id, record.active) }
                        >
                            {record.active ? 'Suspender' : 'Habilitar'}
                        </Button>
                    </Tooltip>

                    <Tooltip title={record.isAdmin ? "Quitar permisos de administrador" : "Hacer administrador"}>
                        <Button
                            type={record.isAdmin ? "default" : "primary"}
                            icon={record.isAdmin ? <StopOutlined /> : <CrownOutlined />}
                            onClick={() => handleToggleAdmin(record.id, record.isAdmin)}
                        >
                            {record.isAdmin ? 'Quitar Admin' : 'Hacer Admin'}
                        </Button>
                    </Tooltip>

                    <Tooltip title="Restablecer a contraseña por defecto">
                        <Button 
                            icon={<LockOutlined />} 
                            onClick={ () => handleResetPassword( record.id ) }
                        >
                            Reset Pass
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={3}>Gestión de Usuarios</Title>
                <Button 
                    icon={<ReloadOutlined />} 
                    onClick={ handleRefresh } 
                    loading={loading}
                >
                    Refrescar
                </Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={users} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </Card>
    );
};
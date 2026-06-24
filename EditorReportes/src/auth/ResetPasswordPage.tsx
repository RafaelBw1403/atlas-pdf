import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Alert, Result } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { RESET_PASSWORD_WITH_TOKEN } from '../graphql/operations/graphql.auth.operations';
import { useMutation } from '@apollo/client/react';

const { Title, Text } = Typography;

interface ResetPasswordData {
    resetPasswordWithToken: boolean;
}
interface ResetPasswordVars {
    token: string;
    newPassword: string;
}

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token'); // Extraemos el token de la URL
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetPassword, { loading, error }] = useMutation<ResetPasswordData, ResetPasswordVars>(RESET_PASSWORD_WITH_TOKEN);

  const onFinish = async (values: any) => {
    try {
      // Ejecutamos la mutación con el token de la URL y la nueva clave
      const { data } = await resetPassword({ 
        variables: { 
          token: token || '', 
          newPassword: values.password 
        } 
      });

      if (data?.resetPasswordWithToken) {
        setIsSuccess(true);
      }
    } catch (e) {
      console.error("Error al resetear contraseña:", e);
    }
  };

  // 1. Si el token no existe en la URL, mostramos advertencia inmediata
  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <Result
          status="warning"
          title="Enlace inválido"
          subTitle="No se encontró un código de recuperación válido en la dirección."
          extra={<Button type="primary" onClick={() => navigate('/login')}>Ir al Login</Button>}
        />
      </div>
    );
  }

  // 2. Estado de éxito tras el cambio
  if (isSuccess) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <Result
          status="success"
          title="Contraseña actualizada"
          subTitle="Tu contraseña ha sido cambiada correctamente. Ya puedes iniciar sesión."
          extra={<Button type="primary" onClick={() => navigate('/login')}>Iniciar Sesión</Button>}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Card style={{ width: 400, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>Nueva contraseña</Title>
          <Text type="secondary">Crea una contraseña segura para tu cuenta.</Text>
        </div>

        {error && <Alert message={error.message} type="error" showIcon style={{ marginBottom: 20 }} />}

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="password"
            label="Contraseña nueva"
            rules={[
              { required: true, message: 'Ingresa tu nueva contraseña' },
              { min: 6, message: 'Mínimo 6 caracteres' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirmar contraseña"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Confirma tu contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
          </Form.Item>

          <Form.Item style={{ marginTop: 32, marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Restablecer contraseña
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
import { useRef, useState } from 'react';
import 'altcha';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { GraphQLService } from '../graphql/graphql.service';
import { CHANGE_PASSWORD } from '../graphql/operations/graphql.auth.operations';
import Swal from 'sweetalert2';
import { AltchaComponent } from '../Components/Altcha/AltchaComponent';
import { isLocalMode } from '../helpers/env.helpers';

const { Title } = Typography;

const LOCAL_DUMMY_PAYLOAD = 'local-mode-altcha-skip';

export const ChangePasswordComponent = () => {

  const [altchaPayload, setAltchaPayload] = useState<string | null>(
    isLocalMode() ? LOCAL_DUMMY_PAYLOAD : null
  );
  const [resetAltcha, setResetAltcha] = useState(false);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = isLocalMode() ? LOCAL_DUMMY_PAYLOAD : (altchaPayload || '');
      const result = await GraphQLService.mutate(CHANGE_PASSWORD, 
        { oldPassword: values.oldPassword, newPassword: values.newPassword },
        { headers: { 'x-altcha-payload': payload } } 
      );

      if (result?.error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al cambiar contraseña',
          text: 'La contraseña actual no coincide o es inválida.',
          confirmButtonColor: '#1890ff'
        });
        setResetAltcha(true);
        return;
      };
      
      message.success('Contraseña actualizada correctamente');
      form.resetFields();
      setResetAltcha(true);
    } catch (error) {
      message.error('Error al actualizar la contraseña');
      setResetAltcha(true);
    } finally {
      setLoading(false);
      setResetAltcha(true);
    }
  };

  return (
    <Card style={{ maxWidth: 400, margin: '20px auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Title level={3} style={{ textAlign: 'center' }}>Cambiar Contraseña</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        {/* Contraseña Actual */}
        <Form.Item
          label="Contraseña Actual"
          name="oldPassword"
          rules={[{ required: true, message: 'Ingresa tu contraseña actual' }]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="Contraseña actual" 
          />
        </Form.Item>

        {/* Nueva Contraseña */}
        <Form.Item
          label="Nueva Contraseña"
          name="newPassword"
          rules={[
            { required: true, message: 'Ingresa tu nueva contraseña' },
            { min: 6, message: 'Debe tener al menos 8 caracteres' }
          ]}
          hasFeedback
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="Nueva contraseña" 
          />
        </Form.Item>

        {/* Confirmar Nueva Contraseña */}
        <Form.Item
          label="Confirmar Nueva Contraseña"
          name="confirmPassword"
          dependencies={['newPassword']}
          hasFeedback
          rules={[
            { required: true, message: 'Confirma tu nueva contraseña' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Las contraseñas no coinciden'));
              },
            }),
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="Repite la nueva contraseña" 
          />
        </Form.Item>

        {!isLocalMode() && (
          <div style={{ marginBottom: 16 }}>
            <AltchaComponent
              onVerify={(payload) => setAltchaPayload(payload)}
              reset={resetAltcha}
            />
          </div>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Actualizar Contraseña
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

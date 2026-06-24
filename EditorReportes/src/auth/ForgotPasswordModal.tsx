import { useState } from 'react';
import { Modal, Form, Input, Button, Typography, Alert, Result, Popconfirm } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { REQUEST_PASSWORD_RECOVERY } from '../graphql/operations/graphql.auth.operations';
import { AltchaComponent } from '../Components/Altcha/AltchaComponent';
import { useGraphQL } from '../hooks/useGraphql';
import Swal from 'sweetalert2';
import { useAltcha } from '../hooks/useAltcha';

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal = ({ open, onClose }: Props) => {
  
  const { 
        altchaPayload, 
        resetAltcha, 
        handleAltchaVerify, 
        validateAltcha,
        resetAltchaComponent 
    } = useAltcha();

  const [submitted, setSubmitted] = useState(false);
  const [form] = Form.useForm();
  const [userEmail, setUserEmail] = useState('');
  
  // // Mutación para solicitar el correo
  // const [requestRecovery, { loading, error }] = useMutation(REQUEST_PASSWORD_RECOVERY);
    const { mutate, loading, error } = useGraphQL();


  const onFinish = async (values: { email: string }) => {

    if (!validateAltcha()) {
        return;
    }
    try {
      await mutate(REQUEST_PASSWORD_RECOVERY, 
          { variables: { email: values.email } },
          { headers: { 'x-altcha-payload': altchaPayload!} } 
      );
      setUserEmail(values.email);
      setSubmitted(true); // Éxito genérico por seguridad
      resetAltchaComponent();
    } catch (e) {
      console.error("Error en recuperación:", e);
      resetAltchaComponent();
    }
  };

  const handleAfterClose = () => {
    setSubmitted(false);
    form.resetFields();
  };

  return (
    <Modal
      title="Recuperar contraseña"
      open={open}
      onCancel={onClose}
      afterClose={handleAfterClose}
      footer={null} 
      destroyOnClose
    >
      {submitted ? (
        <Result
          status="success"
          title={`Correo enviado a ${userEmail}`}
          subTitle={
            <span>
              Si el correo existe en nuestro sistema, recibirás las instrucciones en unos minutos. 
              <b> Si no lo encuentras en tu bandeja de entrada, búscalo en la carpeta de spam o correo no deseado.</b>
            </span>
          }
          extra={[
            <Button type="primary" key="close" onClick={onClose}>
              Entendido
            </Button>
          ]}
        />
      ) : (
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 20 }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu cuenta.
          </Text>

          {/* Manejo de errores de cooldown o bloqueos */}
          {error && (
            <Alert 
              message={error.message} 
              type="error" 
              showIcon 
              style={{ marginBottom: 16 }} 
            />
          )}

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'El correo es obligatorio' },
              { type: 'email', message: 'Ingresa un correo válido' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="ejemplo@correo.com" size="large" />
          </Form.Item>

          <AltchaComponent
            onVerify={handleAltchaVerify}
            reset={resetAltcha}
          />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Cancelar
            </Button>
            <Popconfirm
              title="Confirmación"
              description={() => (
                <span>
                  ¿Seguro de enviar el correo a <b>{form.getFieldValue('email')}</b>?
                </span>
              )}
              onConfirm={() => {
                      form.submit();
              }}
              okText="Sí, enviar"
              cancelText="No"
              disabled={loading}
            >
              <Button type="primary" loading={loading}>
                Enviar enlace
              </Button>
            </Popconfirm>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};
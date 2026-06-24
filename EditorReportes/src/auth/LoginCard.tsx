import { Button, Card, Divider, Form, Input, Typography } from 'antd'
import { MailOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ModalSignUpComponent } from './ModalSIgnInComponent';
import { useEffect, useState } from 'react';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { useAuthActions } from '../hooks/useAuthActions';
import { AltchaComponent } from '../Components/Altcha/AltchaComponent';
import { useAltcha } from '../hooks/useAltcha';

const { Title, Text, Link } = Typography;



export const LoginCard = () => {

    const navigate = useNavigate();

    const { 
        altchaPayload, 
        resetAltcha, 
        handleAltchaVerify, 
        validateAltcha,
        resetAltchaComponent 
    } = useAltcha();

    const { handleLogin: loginAction } = useAuthActions();
    const [form] = Form.useForm();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isRecoveryModalVisible, setIsRecoveryModalVisible] = useState(false);

    useEffect(() => {
        form.setFieldsValue({
            email: '',
            password: ''
        });
    }, []);


    const handleLogin = async () => {
        if (!validateAltcha()) {
            return;
        }
        try {
            const values = await form.validateFields(); //
            
            // The hook triggers the Swal alerts and returns a boolean
            const success = await loginAction({
                email: values.email,
                password: values.password
            }, altchaPayload!); //

            if (success) {
                form.resetFields(); //
                navigate('/app'); //
            }
            resetAltchaComponent();
        } catch (error) {
            // Ant Design handles field validation errors automatically
            console.error('Validation failed:', error);
            resetAltchaComponent();
        }
    };

    return (
        <Card
            variant="borderless"
            style={{ width: 360, maxWidth: '100%' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 24 }}>
                {/* Tiny icon — swap for your own asset if you wish */}
                <span
                    style={{
                        width: 32,
                        height: 32,
                        backgroundColor: '#4F90FF',
                        borderRadius: 8,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                    }}
                >
                    <span style={{ fontSize: 20, color: '#fff' }}>≡</span>
                </span>
                <Title level={4} style={{ margin: 0 }}>
                    Generador de<br />Documentos
                </Title>
            </div>

            <Form
                form={form}
                layout="vertical"
                name="login_form"
                initialValues={{ remember: true }}
            >
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Por favor, ingresa tu correo electrónico' },
                        { type: 'email', message: 'El formato de correo electrónico no es válido.' },
                    ]}
                    hasFeedback
                >
                    <Input
                        prefix={<MailOutlined />}
                        placeholder="Correo electrónico"
                        size="large"
                    />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[
                        { required: true, message: 'Por favor, ingresa tu contraseña' },
                    ]}
                    hasFeedback
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Contraseña"
                        size="large"
                    />
                </Form.Item>

                <AltchaComponent
                    onVerify={handleAltchaVerify}
                    reset={resetAltcha}
                />

                <Form.Item style={{ marginBottom: 0 }}>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        block size="large"
                        onClick={handleLogin}
                    >
                        Iniciar sesión
                    </Button>
                </Form.Item>
            </Form>


            {/* Google sign-in */}
            {/* <Divider plain style={{ margin: '24px 0' }}>
                o
            </Divider> */}

            {/* <Button
                block
                icon={<GoogleOutlined />}
                // style={{ height: 40, marginBottom: 24 }}
                size="large"
                onClick={devLogin}
            >
                Inicia sesión con Google
            </Button> */}

            {/* Footer links */}
            <div
                style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                }}
            >
                <Text>
                    ¿No tienes cuenta? <Link href="#" onClick={() => setIsModalVisible(true)}>Regístrate</Link>
                </Text>
                <Link 
                    href="#" 
                    onClick={(e) => {
                        e.preventDefault();
                        setIsRecoveryModalVisible(true);
                    }}
                >
                    ¿Olvidaste tu contraseña?
                </Link>
            </div>

            <ModalSignUpComponent
                open={isModalVisible}
                setOpen={setIsModalVisible}
            />
            <ForgotPasswordModal
                open={isRecoveryModalVisible} 
                onClose={() => setIsRecoveryModalVisible(false)} 
            />
        </Card>
    )
}

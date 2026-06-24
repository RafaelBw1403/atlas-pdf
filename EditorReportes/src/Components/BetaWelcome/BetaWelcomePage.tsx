import { Card, Typography, Space, Divider, Tag } from 'antd';
import { GiftOutlined, HeartOutlined, SafetyOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const isLocalhost = () => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

const BetaWelcomePage = () => {
  if (isLocalhost()) {
    return null;
  }

  return (
    <div style={{
      overflow: 'auto',
      padding: '48px 24px',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card
        style={{
          maxWidth: 720,
          width: '100%',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          marginTop: 48,
        }}
        bodyStyle={{ padding: '48px 40px' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <Tag color="gold" style={{ fontSize: 14, padding: '4px 16px', borderRadius: 20, marginBottom: 16 }}>
              <GiftOutlined /> Beta Abierta
            </Tag>
            <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
              ¡Bienvenido a la Beta Abierta!
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Estamos emocionados de tenerte a bordo
            </Text>
          </div>

          <Divider />

          <Paragraph style={{ fontSize: 15, lineHeight: 1.8, textAlign: 'left' }}>
            Estamos en fase <strong>Beta Abierta</strong>. El uso de la plataforma en la nube es <strong>100% gratuito</strong> mientras seguimos puliendo los detalles y agregando nuevas funcionalidades.
          </Paragraph>

          <Paragraph style={{ fontSize: 15, lineHeight: 1.8, textAlign: 'left' }}>
            En el futuro introduciremos planes de pago para el servicio administrado en nuestra nube, pero <strong>Atlas-pdf es y seguirá siendo de código abierto (AGPLv3)</strong>. La opción de descargar el código y auto-hospedarlo (<em>self-host</em>) en tus propios servidores siempre será libre y gratuita.
          </Paragraph>

          <Card
            style={{
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 12,
              textAlign: 'left',
            }}
          >
            <Space direction="vertical" size="small">
              <Text strong style={{ fontSize: 15, color: '#135200' }}>
                <HeartOutlined style={{ marginRight: 8 }} />
                Para nuestros primeros usuarios
              </Text>
              <Paragraph style={{ margin: 0, fontSize: 14, color: '#135200' }}>
                Por ser de los primeros en confiar en el proyecto, tendrás <strong>prioridad en el acceso a nuevas funcionalidades</strong> y
                recibirás <strong>beneficios exclusivos</strong> cuando lancemos los planes de pago. Tus comentarios nos ayudan a
                mejorar, ¡gracias por ser parte de este viaje!
              </Paragraph>
            </Space>
          </Card>

          <Divider />

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space size="large" wrap style={{ justifyContent: 'center' }}>
              <Space>
                <SafetyOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                <Text>100% Gratuito</Text>
              </Space>
              <Space>
                <GiftOutlined style={{ fontSize: 20, color: '#faad14' }} />
                <Text>Beneficios Exclusivos</Text>
              </Space>
            </Space>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Versión Beta — Junio 2026
            </Text>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

export default BetaWelcomePage;

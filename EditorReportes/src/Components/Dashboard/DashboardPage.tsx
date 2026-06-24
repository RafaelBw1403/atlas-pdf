
import { Card, Col, Row, Progress, Statistic, Typography, Space, Divider } from 'antd';
import { CalendarOutlined, RocketOutlined, BarChartOutlined } from '@ant-design/icons';
import { Tiny } from '@ant-design/plots'; // For the sparkline

const { Title, Text } = Typography;

const Dashboard = () => {
  // Mock Data (In a real app, this comes from your API)
  const data = [20, 40, 35, 50, 49, 60, 70, 91, 125];

  const chartConfig = {
    height: 60,
    autoFit: true,
    data,
    smooth: true,
    areaStyle: { fill: 'l(270) 0:#ffffff 0.5:#e6f7ff 1:#1890ff' }, // Gradient
    line: { color: '#1890ff' },
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={2}>Dashboard de Uso</Title>
      
      <Row gutter={[16, 16]}>
        {/* Card 1: Plan & Expiration */}
        <Col xs={24} lg={12}>
          <Card title={<><RocketOutlined /> PLAN Y ESTADO</>} hoverable>
            <Row align="middle" gutter={24}>
              <Col span={8}>
                <Progress type="circle" percent={75} strokeColor="#52c41a" format={() => 'PRO'} />
              </Col>
              <Col span={16}>
                <Statistic title="Días Restantes" value={45} suffix="/ 60" prefix={<CalendarOutlined />} />
                <Text type="secondary">Expira: Feb 1, 2026</Text>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Card 2: Usage Quotas */}
        <Col xs={24} lg={12}>
          <Card title={<><BarChartOutlined /> CUOTAS DE LLAVE API</>}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>PRODUCCIÓN (pk_live_...)</Text>
                <Text>82% Usado</Text>
              </div>
              <Progress percent={82} status="active" strokeColor="#52c41a" />
              <Text type="secondary">7,842 / 10,000 PDFs • Resets in 12 days</Text>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>DESARROLLO (pk_test_...)</Text>
                <Text>22%</Text>
              </div>
              <Progress percent={22} strokeColor="#1890ff" />
              <Text type="secondary">112 / 500 PDFs</Text>
            </div>
          </Card>
        </Col>

        {/* Card 3: Metrics & Sparkline */}
        <Col span={24}>
          <Card>
            <Row gutter={24} align="middle">
              <Col xs={24} md={8}>
                <Tiny.Area {...chartConfig} />
                <Text type="secondary" size="small">Past 7 Days Activity</Text>
              </Col>
              <Col xs={24} md={16}>
                <Row gutter={16}>
                  <Col span={8}><Statistic title="Total PDFs" value={8321} precision={0} /></Col>
                  <Col span={8}><Statistic title="Pico Diario" value={312} /></Col>
                  <Col span={8}><Statistic title="Almacenamiento" value={16.8} suffix="GB" /></Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
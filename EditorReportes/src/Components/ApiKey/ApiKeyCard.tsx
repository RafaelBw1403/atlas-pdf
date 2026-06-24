import { 
  Card, 
  Typography, 
  Input, 
  Button, 
  Tag, 
  Space, 
  Modal,
  message
} from 'antd';
import { 
  CopyOutlined, 
  ReloadOutlined, 
  KeyOutlined 
} from '@ant-design/icons';

const { Text } = Typography;

interface Props {
    title: string;
    type: string;
    value: string;
    onRegenerate: () => void;
}

export const ApiKeyCard = ({ title, type, value, onRegenerate }: Props) => {

  // Design Config based on type
  const isProd = type === 'prod';
  const accentColor = isProd ? '#722ed1' : '#1890ff'; // Purple for Prod, Blue for Dev
  const badgeColor = isProd ? 'purple' : 'blue';

  

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    message.success('API Key copied to clipboard!');
  };

  const confirmRegenerate = () => {
    onRegenerate();
    // Modal.confirm({
    //   title: 'Are you sure you want to regenerate this key?',
    //   icon: <ReloadOutlined style={{ color: 'red' }} />,
    //   content: 'The current key will stop working immediately. You will need to update all your applications.',
    //   okText: 'Yes, Regenerate',
    //   okType: 'danger',
    //   cancelText: 'Cancel',
    //   onOk() {
    //     onRegenerate();
    //     message.success('New API Key generated successfully');
    //   },
    // });
  };

  return (
    <Card
      style={{ 
        marginBottom: 24, 
        borderLeft: `5px solid ${accentColor}` // Replicates your "Folder" design
      }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <KeyOutlined style={{ color: accentColor }} />
            <Text strong style={{ fontSize: 16 }}>{title}</Text>
          </Space>
          {isProd && <Tag color={badgeColor}>LIVE</Tag>}
        </div>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Text type="secondary">
          {isProd 
            ? "Use this key for live production transactions." 
            : "Use this key for testing and development only."}
        </Text>

        <Space.Compact style={{ width: '100%' }}>
          <Input.Password
            value={value}
            readOnly
            size="large"
            style={{ fontFamily: 'monospace' }}
            visibilityToggle
          />
          <Button 
            size="large" 
            icon={<CopyOutlined />} 
            onClick={handleCopy}
          >
            Copy
          </Button>
        </Space.Compact>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            danger 
            icon={<ReloadOutlined />} 
            onClick={confirmRegenerate}
          >
            Regenerate Key
          </Button>
        </div>
      </Space>
    </Card>
  );
};

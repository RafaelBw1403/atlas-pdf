import { Input, Space, Typography, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Props {
  name: string;
  id?: string;
  documentGroupId?: string;
  isEditing: boolean;
  readOnly?: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
  onNameChange: (name: string) => void;
}

export const DocumentTitle = ({ 
  name, 
  id, 
  documentGroupId,
  isEditing, 
  readOnly = false,
  onEditStart, 
  onEditEnd, 
  onNameChange 
}: Props) => (
  <Space size={0} align="start" style={{ display: 'flex', flexDirection: 'column' }}>
    {isEditing ? (
      <Input
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        onPressEnter={onEditEnd}
        onBlur={onEditEnd}
        autoFocus
        style={{ fontSize: '24px', fontWeight: 'bold', width: '300px' }}
      />
    ) : (
      <Space>
        <Title level={3} style={{ margin: 0, cursor: 'pointer' }} onClick={onEditStart}>
          {name}
        </Title>
        {<Button type="text" icon={<EditOutlined />} size="small" onClick={onEditStart} />}
      </Space>
    )}
    <Space size={16} style={{ marginTop: 2 }}>
      <Text type="secondary" style={{ fontSize: '13px' }} copyable={{ text: id }}>
        ID: {id ? `${id.slice(0, 8)}...` : "Sin ID"}
      </Text>
      {documentGroupId && (
        <Text type="secondary" style={{ fontSize: '13px' }} copyable={{ text: documentGroupId }}>
          Grupo: {documentGroupId.slice(0, 8)}...
        </Text>
      )}
    </Space>
  </Space>
);
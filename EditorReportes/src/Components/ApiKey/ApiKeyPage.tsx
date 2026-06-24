import { Typography } from 'antd';
import { useApiKeyActions } from '../../hooks/useApiKeyActions';
import { ApiKeyCard } from './ApiKeyCard';

const { Title, Text } = Typography;


// --- Main Page Component ---
export const ApiKeyPage = () => {

    const { 
        devApiKey, 
        prodApiKey, 
        renewKey,
    } = useApiKeyActions({ 
        autoFetch: true,
        autoCreateMissing: true
    });   

    return (
        <div
            style={{
                overflow: 'auto'
            }}
        >
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            
            {/* Header Section */}
            <div style={{ marginBottom: 32 }}>
            <Title level={2} style={{ margin: 0 }}>API Keys</Title>
            <Text type="secondary">Manage your API keys for Development and Production environments.</Text>
            </div>

            {/* 1. Dev Key Card */}
            <ApiKeyCard 
                title="Development Key"
                type="dev"
                value={devApiKey?.apiKey ?? ''}
                onRegenerate={() => renewKey(devApiKey?.apiKey ?? '')}
            />

            {/* 2. Prod Key Card */}
            <ApiKeyCard 
                title="Production Key"
                type="prod"
                value={prodApiKey?.apiKey ?? ''}
                onRegenerate={() => renewKey(prodApiKey?.apiKey ?? '')}
            />
            
        </div>
        </div>
    );
};
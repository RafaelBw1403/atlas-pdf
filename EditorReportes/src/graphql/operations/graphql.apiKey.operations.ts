import { gql } from '@apollo/client';

export const GET_API_KEY_BY_USER_ID = gql`
    query GetActiveApiKeysByUserId($userId: String!) {
        getActiveApiKeysByUserId(userId: $userId) {
            id
            userId
            type
            apiKey
            createdAt
            updatedAt
        }
    }
`;

export const GET_API_KEY_ACTIVE_BY_TYPE = gql`
    query GetApiKeyActiveByType($type: ApiKeyType!) {
        getApiKeyActiveByType(type: $type) {
            id
            userId
            type
            apiKey
            createdAt
            updatedAt
        }
    }
`;

// --- Mutations ---

export const CREATE_API_KEY = gql`
    mutation CreateApiKey($input: ApiKeyInput!) {
        createApiKey(input: $input) {
            id
            userId
            type
            apiKey
            createdAt
            updatedAt
        }
    }
`;

export const RENEW_API_KEY = gql`
    mutation RenewApiKey($input: ApiKeyRenewInput!) {
        renewApiKey(input: $input) {
            id
            userId
            type
            apiKey
            updatedAt
        }
    }
`;
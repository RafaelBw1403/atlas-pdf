import { ApiKeyService } from "../../services/apiKey.service";
import { requireAuth } from "../../guards/auth.guard";



export const apiKeyResolvers = {
    ApiKey: {
        // createdAt: (parent: any) => parent.created_at,
        // updatedAt: (parent: any) => parent.updated_at,
        userId: (parent: any) => {
            // if (parent.user && parent.user.id) {
            //     return parent.user.id;
            // }
            // Por si acaso TypeORM devuelve 'user_id' plano en algunas consultas raw
            return parent.user_id || null; 
        },
        apiKey: (parent: any) => parent.api_key,
    },
    Query: {
        getActiveApiKeysByUserId: async (_: any, context: any) => await ApiKeyService.getActiveApiKeysByUserId(context.userId),
        getApiKeyActiveByType: async (_: any, context: any) => await ApiKeyService.getApiKeyActiveByType(context.type),
    },
    Mutation: {
        createApiKey: requireAuth(async (_: any, { input }: { input: any }, context: any) => {
            input.userId = context.user.id;
            return await ApiKeyService.createApiKey(input)
        }),
        renewApiKey: requireAuth(async (_: any, { input }: { input: any }, context: any) => {
            input.userId = context.user.id;
            return await ApiKeyService.renewApiKey(input.apiKey, input.userId)
        }),
        deleteLogicalApiKey: requireAuth(async (_: any, { input }: { input: any }, context: any) => {
            input.userId = context.user.id;
            return await ApiKeyService.deleteLogicalApiKey(input.apiKey)
        }),
    }
}   
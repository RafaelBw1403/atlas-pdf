import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { resolvers } from './resolvers/index';
import { typeDefs } from './schema/index';
import { authenticateTokenMiddleware } from '../middlewares/auth.middleware';

export async function createApolloServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: true,
        // plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: false })],
        // introspection: process.env.NODE_ENV !== 'production',
        formatError: (error) => {
            console.error('GraphQL Error:', error);
            return {
                message: error.message,
                code: error.extensions?.code || 'INTERNAL_ERROR',
            };
        },
    });

    await server.start();
    return server;
}

export const apolloMiddleware = (server: ApolloServer) => 
    expressMiddleware(server, {
        context: async ({ req }) => {
            const authResult = await authenticateTokenMiddleware(req);
        
            return {
                user: authResult.user,
                authScope: authResult,
                req
            };
        },
    }
);
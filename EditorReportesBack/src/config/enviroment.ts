import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

dotenvExpand.expand(dotenv.config({ path: '../.env' }));

export const environment = {
    // App
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || process.env.API_PORT || '4000'),
    
    // Databases
    mongodbUri: process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/pdf_templates?authSource=admin&directConnection=true',
    postgresUri: process.env.POSTGRES_URI || 'postgresql://admin:password123@localhost:5432/pdf_auth',
    
    // JWT (para después)
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    
    // CORS
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

    // URL pública base (para construir URLs de descarga en webhooks y SSE)
    baseUrl: process.env.BASE_URL || `http://localhost:${process.env.API_PORT || '4000'}`,
};

// Validación básica de variables requeridas
export function validateEnvironment() {
    const required = ['MONGODB_URI', 'POSTGRES_URI'];
    
    for (const variable of required) {
        if (!process.env[variable]) {
        console.warn(`⚠️  Warning: ${variable} is not set in environment variables`);
        }
    }
}
import express from 'express';
import { createApolloServer, apolloMiddleware } from './graphql/server';
import cors from 'cors';
import helmet from 'helmet';
import { checkPostgreSQLHealth, connectPostgreSQL } from './database/postgres/conection';
import { connectMongoDB } from './database/mongo/conection';
import { environment } from './config/enviroment';
import mongoose from 'mongoose';
import { json } from 'body-parser';
import { AppDataSource } from './config/typeorm.config';
import routers from './routes';

// Importar el worker de PDF 
import './workers/pdf.worker'; // Inicia el worker de PDF

// Importa los cronjobs
import './cron/cleanup.cron';

const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 4000;

const isProd = process.env.NODE_ENV === "production";

// Middlewares básicos de seguridad
// 1. Configurar CORS usando tu variable real de entorno
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigin,
  credentials: true // Permite el paso de tokens/headers entre subdominios
}));
app.use(express.json());

if (isProd) {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        // 🚀 CONFIGURACIÓN CRÍTICA: Permite que tu front embeba los PDFs de la API
        "frame-ancestors": ["'self'", allowedOrigin]
      }
    }
  }));
} else {
  // Helment configurado para desarrollo (permite GraphiQL)
  app.use(helmet({
    contentSecurityPolicy: false, // ✅ Desactiva CSP en desarrollo
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false, 
    crossOriginOpenerPolicy: false,   
    xFrameOptions: false              
  }));
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const postgresHealth = await checkPostgreSQLHealth();
    const mongoHealth = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.status(200).json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'PDF Generator Backend',
      databases: {
        mongodb: mongoHealth,
        postgresql: postgresHealth.status
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

// Ruta básica de prueba
app.get('/', async (req, res) => {
  res.json({ 
    message: '🚀 PDF Generator Backend is running!',
    version: '1.0.0',
    graphql: '/graphql'
  });
});


// Rutas
app.use('/api', routers);


async function startServer() {
  try {
    console.log('🔄 Starting PDF Generator Backend...');
    
    // Conectar bases de datos
    await connectMongoDB();

    // Conectar base de datos de TypeORM
    await AppDataSource.initialize();
    
    // Conectar base de datos de PostgreSQL
    await connectPostgreSQL();
    
    // Inicializar Apollo Server
    const apolloServer = await createApolloServer();

    // Aplicar middleware de Apollo
    app.use(
      '/graphql',
      json(),
      apolloMiddleware(apolloServer)
    );
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 GraphQL ready at: http://localhost:${PORT}/graphql`);
      console.log(`📊 MongoDB: ${environment.mongodbUri}`);
      console.log(`🐘 PostgreSQL: ${environment.postgresUri}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Manejo graceful de shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Iniciar la aplicación
startServer();
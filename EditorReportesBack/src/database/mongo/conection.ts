import mongoose from 'mongoose';
import { environment } from '../../config/enviroment';


export async function connectMongoDB() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        
        await mongoose.connect(environment.mongodbUri, {
        // Opciones recomendadas para MongoDB
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        });

        console.log('✅ MongoDB connected successfully');
        
        // Event listeners para manejo de errores
        mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
        });

        process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('🛑 MongoDB connection closed');
        process.exit(0);
        });

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}
import mongoose from 'mongoose';
import { environment } from './enviroment';

async function verifyConnection() {
    console.log('🧪 Verifying MongoDB connection with environment config...');
    console.log(`URI: ${environment.mongodbUri.replace(/password123/g, '*******')}`);

    try {
        await mongoose.connect(environment.mongodbUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Connection successful!');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error);
        process.exit(1);
    }
}

verifyConnection();

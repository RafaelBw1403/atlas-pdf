const { MongoClient } = require('mongodb');

async function testDetailedConnection() {
    console.log('🔍 PRUEBA DETALLADA DE CONEXIÓN MONGODB\n');
    
    const connectionOptions = [
        {
            name: 'Opción 1 - Con directConnection',
            uri: 'mongodb://admin:pdf_password@localhost:27017/admin?authSource=admin&directConnection=true'
        },
        {
            name: 'Opción 2 - Sin directConnection',
            uri: 'mongodb://admin:pdf_password@localhost:27017/admin?authSource=admin'
        },
        {
            name: 'Opción 3 - Con retryWrites',
            uri: 'mongodb://admin:pdf_password@localhost:27017/admin?authSource=admin&retryWrites=true&w=majority'
        },
        {
            name: 'Opción 4 - Conexión simple',
            uri: 'mongodb://admin:pdf_password@localhost:27017'
        },
        {
            name: 'Opción 5 - Con opciones explícitas',
            uri: 'mongodb://admin:pdf_password@localhost:27017/admin?authSource=admin&directConnection=true&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000'
        }
    ];

    for (const option of connectionOptions) {
        console.log(`\n🧪 Probando: ${option.name}`);
        console.log(`🔗 URI: ${option.uri.replace(/password123/g, '*******')}`);
        
        const client = new MongoClient(option.uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            maxPoolSize: 1
        });

        try {
            await client.connect();
            console.log('✅ CONEXIÓN EXITOSA!');
            
            // Probar operaciones
            const adminDb = client.db('admin');
            const pingResult = await adminDb.command({ ping: 1 });
            console.log('✅ Ping:', pingResult);
            
            const dbs = await adminDb.admin().listDatabases();
            console.log(`✅ ${dbs.databases.length} bases de datos disponibles`);
            
            console.log('🎯 ¡ESTA CONFIGURACIÓN FUNCIONA!');
            return option.uri;
            
        } catch (error) {
            console.log('❌ ERROR:', error.message);
            console.log('   Código:', error.codeName);
            console.log('   Stack:', error.stack.split('\n')[0]);
        } finally {
            await client.close();
        }
    }
    
    return null;
}

async function main() {
    const workingUri = await testDetailedConnection();
    
    if (workingUri) {
        console.log('\n🎉 ¡CONEXIÓN EXITOSA!');
        console.log('📝 Usa esta URI en tu environment.ts:');
        console.log(`MONGODB_URI=${workingUri.replace(/password123/g, '*******')}`);
    } else {
        console.log('\n💥 Todas las conexiones fallaron');
        console.log('📋 Verifica:');
        console.log('   1. Que el contenedor esté corriendo: docker ps');
        console.log('   2. Las credenciales en docker-compose.yml');
        console.log('   3. La versión del driver MongoDB');
    }
}

main();
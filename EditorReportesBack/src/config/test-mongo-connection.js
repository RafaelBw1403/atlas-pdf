const { MongoClient } = require('mongodb');

// Prueba con diferentes URIs
const uris = [
    'mongodb://admin:password123@localhost:27017/admin?authSource=admin&directConnection=true',
    'mongodb://admin:password123@localhost:27017/pdf_templates?authSource=admin&directConnection=true',
    'mongodb://admin:password123@localhost:27017/?authSource=admin&directConnection=true',
    'mongodb://admin:password123@localhost:27017/pdf_templates?authSource=admin'
];

async function testConnection(uri, description) {
    console.log(`\n🔌 Probando: ${description}`);
    console.log(`URI: ${uri.replace(/password123/g, '*******')}`);

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ CONEXIÓN EXITOSA');

        // Probar operaciones básicas
        const adminDb = client.db('admin');
        await adminDb.command({ ping: 1 });
        console.log('✅ Ping exitoso');

        // Listar bases de datos
        const dbs = await adminDb.admin().listDatabases();
        console.log('📊 Bases de datos disponibles:');
        dbs.databases.forEach(db => console.log(`   - ${db.name}`));

        return true;
    } catch (error) {
        console.log('❌ ERROR:', error.message);
        console.log('Detalles:', error.codeName || 'Sin código de error');
        return false;
    } finally {
        await client.close();
    }
}

async function runTests() {
    console.log('🧪 INICIANDO PRUEBAS DE CONEXIÓN MONGODB\n');

    for (const uri of uris) {
        const success = await testConnection(uri, `URI ${uris.indexOf(uri) + 1}`);
        if (success) {
            console.log('🎯 ¡Esta URI funciona! Usa esta en tu environment.ts');
            break;
        }
    }
}

runTests();
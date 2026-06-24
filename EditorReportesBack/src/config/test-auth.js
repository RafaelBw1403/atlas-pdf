const { MongoClient } = require('mongodb');

async function testConnection() {
    console.log('🔌 Probando con mecanismo SCRAM...\n');
    
    const uris = [
        'mongodb://admin:password123@localhost:27017/admin?authMechanism=SCRAM-SHA-256',
        'mongodb://admin:password123@localhost:27017/admin?authMechanism=SCRAM-SHA-1',
        'mongodb://admin:password123@localhost:27017/admin?authSource=admin&authMechanism=SCRAM-SHA-256'
    ];

    for (const uri of uris) {
        console.log(`Probando: ${uri.replace(/password123/g, '*******')}`);
        
        try {
            const client = new MongoClient(uri);
            await client.connect();
            const dbs = await client.db().admin().listDatabases();
            console.log('✅ CONEXIÓN EXITOSA');
            await client.close();
            return uri;
        } catch (error) {
            console.log('❌ Error:', error.message);
        }
    }
    
    return null;
}

testConnection().then(workingUri => {
    if (workingUri) {
        console.log('\n🎉 URI que funciona:', workingUri.replace(/password123/g, '*******'));
    } else {
        console.log('\n💥 Todas fallaron');
    }
});
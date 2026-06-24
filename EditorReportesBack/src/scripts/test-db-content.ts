import mongoose from 'mongoose';

async function checkDBContent() {
    try {
        console.log("🔍 Revisando contenido de la base de datos...");
        
        // Conectar a la misma DB que tu servidor
        await mongoose.connect('mongodb://admin:password123@localhost:27017/pdf_templates?authSource=admin');
        
        // Verificar si la colección 'templates' existe
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }
        
        const collections = await db.listCollections().toArray();
        console.log("📂 Colecciones:", collections.map(c => c.name));
        
        // Contar documentos en templates
        const templateCount = await db.collection('templates').countDocuments();
        console.log("📊 Templates en la base de datos:", templateCount);
        
        // Mostrar algunos templates si existen
        if (templateCount > 0) {
            const templates = await db.collection('templates').find().limit(3).toArray();
            console.log("📝 Primeros templates:", JSON.stringify(templates, null, 2));
        } else {
            console.log("💡 La base de datos está vacía - necesitas crear templates");
        }
        
        await mongoose.disconnect();
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("❌ Error:", errorMessage);
    }
}

checkDBContent();
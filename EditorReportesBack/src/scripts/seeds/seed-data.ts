
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../../config/typeorm.config';
import { User } from '../../entities/User.entity';
import { Folder } from '../../models/Folder.model';
import { Template } from '../../models/Template.model';

export async function seedDatabase() {
    console.log('🌱 Starting database seeding...');

    try {
        // Conectar a PostgreSQL
        await AppDataSource.initialize();
        console.log('✅ PostgreSQL connected for seeding');

        // Crear usuario de prueba
        const user = new User();
        user.email = 'demo@example.com';
        user.name = 'Demo User';
        user.password_hash = await bcrypt.hash('password123', 12);
        
        const savedUser = await AppDataSource.manager.save(user);
        console.log('✅ Demo user created');

        // Crear folder principal
        const mainFolder = new Folder({
        name: 'Mis Templates',
        description: 'Folder principal para mis templates',
        owner: savedUser.id,
        icon: '📁',
        color: '#3B82F6'
        });
        await mainFolder.save();

        // Templates de ejemplo
        const sampleTemplates = [
        {
            name: 'Factura Simple',
            html: `
            <div class="invoice">
                <h1>Factura #{{invoiceNumber}}</h1>
                <div class="client">
                <p><strong>Cliente:</strong> {{clientName}}</p>
                <p><strong>Fecha:</strong> {{date}}</p>
                </div>
                <table class="items">
                <thead>
                    <tr>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each items}}
                    <tr>
                    <td>{{name}}</td>
                    <td>{{quantity}}</td>
                    <td>{{price}}</td>
                    <td>{{total}}</td>
                    </tr>
                    {{/each}}
                </tbody>
                </table>
                <div class="total">
                <h3>Total: {{grandTotal}}</h3>
                </div>
            </div>
            `,
            css: `
            .invoice { font-family: Arial, sans-serif; margin: 20px; }
            .client { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; margin-top: 20px; }
            `,
            jsonSchema: {
            invoiceNumber: "string",
            clientName: "string", 
            date: "string",
            items: [
                {
                name: "string",
                quantity: "number",
                price: "number",
                total: "number"
                }
            ],
            grandTotal: "number"
            },
            sampleData: {
            invoiceNumber: "INV-001",
            clientName: "Juan Pérez",
            date: "2024-01-15",
            items: [
                { name: "Producto A", quantity: 2, price: 25, total: 50 },
                { name: "Producto B", quantity: 1, price: 40, total: 40 }
            ],
            grandTotal: 90
            },
            tags: ['factura', 'ventas', 'comercial']
        },
        {
            name: 'Reporte de Ventas',
            html: `
            <div class="report">
                <h1>Reporte de Ventas - {{month}}</h1>
                <div class="summary">
                <p><strong>Total Ventas:</strong> {{totalSales}}</p>
                <p><strong>Productos Vendidos:</strong> {{totalProducts}}</p>
                <p><strong>Vendedor:</strong> {{salesPerson}}</p>
                </div>
                <div class="chart">
                <h3>Ventas por Categoría</h3>
                {{#each categories}}
                <div class="category">
                    <span class="name">{{name}}:</span>
                    <span class="amount">{{amount}}</span>
                </div>
                {{/each}}
                </div>
            </div>
            `,
            css: `
            .report { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; }
            .chart { margin-top: 20px; }
            .category { display: flex; justify-content: space-between; margin: 5px 0; }
            .name { font-weight: bold; }
            `,
            jsonSchema: {
            month: "string",
            totalSales: "number",
            totalProducts: "number", 
            salesPerson: "string",
            categories: [
                {
                name: "string",
                amount: "number"
                }
            ]
            },
            sampleData: {
            month: "Enero 2024",
            totalSales: 12500,
            totalProducts: 45,
            salesPerson: "María García",
            categories: [
                { name: "Electrónicos", amount: 8000 },
                { name: "Ropa", amount: 3000 },
                { name: "Hogar", amount: 1500 }
            ]
            },
            tags: ['reporte', 'ventas', 'análisis']
        }
        ];

        // Crear templates
        for (const templateData of sampleTemplates) {
        const template = new Template({
            ...templateData,
            owner: savedUser.id,
            folderId: mainFolder._id,
            status: 'published'
        });
        await template.save();
        }

        // Agregar templates al folder
        mainFolder.templateIds = (await Template.find({ owner: savedUser.id })).map(t => t._id as any);
        await mainFolder.save();

        console.log('✅ Seeds completed successfully!');
        console.log('📧 Demo user: demo@example.com / password123');
        console.log('📁 Created main folder with 2 sample templates');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await AppDataSource.destroy();
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    seedDatabase();
}
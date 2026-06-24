import { Template } from "../models/Template.model";


async function testTemplates() {
    console.log("=== TESTING TEMPLATES ===");
    
    // Test 1: Contar templates
    const count = await Template.countDocuments();
    console.log("Total templates:", count);
    
    // Test 2: Crear un template
    const testTemplate = new Template({
        name: "Test Template",
        html: "<h1>Test</h1>",
        jsonSchema: { test: "data" },
        sampleData: { test: "sample" },
        owner: "test-user"
    });
    
    const saved = await testTemplate.save();
    console.log("Template creado:", saved._id);
}

testTemplates();
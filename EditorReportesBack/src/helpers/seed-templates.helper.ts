import { TemplateService } from '../services/template.service';
import { exampleTemplates } from '../seeds/example-templates.data';
import { Template } from '../models/Template.model';

export async function seedExampleTemplates(userId: string): Promise<void> {
  console.log(`📦 Seeding ${exampleTemplates.length} example templates for user ${userId}`);

  let successCount = 0;
  let failCount = 0;

  for (const example of exampleTemplates) {
    console.log(`⏳ Creating template "${example.name}"...`);
    try {
      await TemplateService.createTemplate({
        name: example.name,
        html: example.html,
        css: example.css,
        sampleData: example.sampleData,
        tags: example.tags,
        owner: userId as any,
      });
      console.log(`✅ Template "${example.name}" seeded for user ${userId}`);
      successCount++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to seed template "${example.name}" for user ${userId}: ${message}`);
      failCount++;
    }
  }

  const totalInDb = await Template.countDocuments({ owner: userId });
  console.log(`📊 Result: ${successCount} created, ${failCount} failed, ${totalInDb} total in DB for user ${userId}`);
}

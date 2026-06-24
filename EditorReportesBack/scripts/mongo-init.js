db = db.getSiblingDB('pdf_templates');

db.createCollection('templates');
db.createCollection('generated_files');
db.createCollection('pdf_audit_logs');

db.generated_files.createIndex({ slug: 1 }, { unique: true });
db.generated_files.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });

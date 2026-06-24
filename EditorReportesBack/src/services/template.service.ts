
import { randomUUID } from 'crypto';
import { ITemplate } from '../types/mongo.types';
import { Template } from '../models/Template.model';
import toJsonSchema from 'to-json-schema';

export class TemplateService {
    // Crear un nuevo template
    static async createTemplate(templateData: Partial<ITemplate>): Promise<ITemplate> {
        try {
            let schema: Record<string, unknown>;
            try {
                schema = toJsonSchema(templateData.sampleData, { arrays: { mode: 'all' } });
            } catch (schemaError) {
                const schemaMsg = schemaError instanceof Error ? schemaError.message : String(schemaError);
                console.error(`⚠️ to-json-schema failed for template "${templateData.name}": ${schemaMsg}. Using fallback schema.`);
                schema = { type: 'object' };
            }
            templateData.jsonSchema = schema;

            const template = new Template({
                ...templateData,
                documentGroupId: randomUUID(),
            });
            return await template.save();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error creating template: ${message}`);
        }
    }

    // Obtener all templates 
    static async getAllTemplates(): Promise<ITemplate[]> {
        try {
            console.log("🟢 [getAllTemplates] EJECUTANDO...");

            const templates = await Template.find().exec();

            console.log("📦 Templates encontrados:", templates);
            console.log("🔢 Número de templates:", templates?.length || 0);
            console.log("📝 Tipo de templates:", typeof templates);
            console.log("🔍 Es array?:", Array.isArray(templates));

            if (!templates) {
                console.log("❌ templates es NULL o UNDEFINED");
                return []; // ← Nunca retornes null
            }

            if (templates.length === 0) {
                console.log("ℹ️  No hay templates, retornando array vacío");
                return [];
            }

            console.log("✅ Retornando templates:", templates.length);
            return templates;
        } catch (error) {
            console.error("🔴 ERROR en getAllTemplates:", error);
            // console.error("Stack:", error.stack);
            // Nunca retornes null, siempre retorna array vacío
            return [];
        }
    }

    // Obtener templates por usuario
    static async getTemplatesByUser(userId: string): Promise<ITemplate[]> {
        try {
            const templates =  await Template.find({ owner: userId })
                .sort({ createdAt: -1 })
                .exec();
            return templates
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error fetching templates: ${message}`);
        }
    }

    static async getTemplateById(templateId: string): Promise<ITemplate | null> {
        try {
            return await Template.findById(templateId).exec();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error fetching template: ${message}`);
        }
    }

    // Obtener template por documentGroupId + stage
    static async getTemplateByGroupAndStage(documentGroupId: string, stage: string): Promise<ITemplate | null> {
        try {
            return await Template.findOne({ documentGroupId, stage }).exec();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error fetching template by group and stage: ${message}`);
        }
    }

    // Obtener template por ID y usuario ID 
    static async getTemplateByIdAndUserId(templateId: string, userId: string): Promise<ITemplate | null> {
        try {
            return await Template.findOne({
                _id: templateId,
                $or: [
                    { owner: userId },
                    { 'access.sharedWith': userId },
                    { 'access.isPublic': true }
                ]
            }).exec();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error fetching template: ${message}`);
        }
    }

    // Actualizar template
    static async updateTemplate(
        templateId: string,
        userId: string,
        updateData: Partial<ITemplate>
    ): Promise<ITemplate | null> {
        try {

            if (updateData.sampleData !== undefined) {
                const schema = toJsonSchema(updateData.sampleData, { arrays: { mode: 'all' } });
                updateData.jsonSchema = schema;
            }

            const result = await Template.findOneAndUpdate(
                {
                    _id: templateId,
                    owner: userId  // Solo el owner puede actualizar
                },
                {
                    ...updateData,
                },
                { new: true, runValidators: true }
            ).exec();

            // Propagar cambio de nombre a todas las versiones del grupo
            if (updateData.name && result?.documentGroupId) {
                await Template.updateMany(
                    { documentGroupId: result.documentGroupId, _id: { $ne: templateId } },
                    { $set: { name: updateData.name } }
                ).exec();
            }

            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error updating template: ${message}`);
        }
    }

    // Eliminar todas las versiones de un grupo de documentos
    static async deleteTemplate(templateId: string, userId: string): Promise<boolean> {
        try {
            const template = await Template.findOne({
                _id: templateId,
                owner: userId
            }).exec();

            if (!template) {
                throw new Error('Template not found or access denied');
            }

            // Eliminar todas las versiones del grupo (mismo documentGroupId)
            const result = await Template.deleteMany({
                documentGroupId: template.documentGroupId,
                owner: userId
            }).exec();

            return result.deletedCount > 0;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error deleting template: ${message}`);
        }
    }

    // Buscar templates por tags o nombre
    static async searchTemplates(
        userId: string,
        searchTerm: string,
        tags?: string[]
    ): Promise<ITemplate[]> {
        try {
            const query: any = {
                $or: [
                    { owner: userId },
                    { 'access.sharedWith': userId },
                    { 'access.isPublic': true }
                ]
            };

            if (searchTerm) {
                query.name = { $regex: searchTerm, $options: 'i' };
            }

            if (tags && tags.length > 0) {
                query.tags = { $in: tags };
            }

            return await Template.find(query)
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error searching templates: ${message}`);
        }
    }


    // Obtener templates por folder
    static async getTemplatesByFolder(folderId: string, userId: string): Promise<ITemplate[]> {
        try {
            return await Template.find({
                folderId: folderId,
                $or: [
                    { owner: userId },
                    { 'access.sharedWith': userId },
                    { 'access.isPublic': true }
                ]
            })
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error fetching folder templates: ${message}`);
        }
    }

    // Obtener templates sin folder (root)
    static async getRootTemplates(userId: string): Promise<ITemplate[]> {
        try {
            return await Template.find({
                $and: [
                    {
                        $or: [
                            { folderId: { $exists: false } },
                            { folderId: null }
                        ]
                    },
                    {
                        $or: [
                            { owner: userId },
                            { 'access.sharedWith': userId },
                            { 'access.isPublic': true }
                        ]
                    }
                ]
            })
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error fetching root templates: ${message}`);
        }
    }

    // ── Sistema de Versiones ─────────────────────────────────────────────────────

    // Obtener todas las versiones de un grupo (por documentGroupId)
    static async getTemplateVersions(documentGroupId: string, userId: string): Promise<ITemplate[]> {
        try {
            return await Template.find({
                documentGroupId: documentGroupId,
                $or: [
                    { owner: userId },
                    { 'access.sharedWith': userId },
                    { 'access.isPublic': true }
                ]
            })
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error fetching template versions: ${message}`);
        }
    }

    // Crear un borrador (draft) basado en una version existente
    static async createDraft(templateId: string, userId: string): Promise<ITemplate | null> {
        try {
            const source = await Template.findOne({
                _id: templateId,
                $or: [
                    { owner: userId },
                    { 'access.sharedWith': userId },
                    { 'access.isPublic': true }
                ]
            }).exec();

            if (!source) {
                throw new Error('Template not found or access denied');
            }

            // Si ya existe un draft, retornarlo
            const existingDraft = await Template.findOne({
                documentGroupId: source.documentGroupId,
                stage: 'draft',
                owner: userId
            }).exec();

            if (existingDraft) {
                return existingDraft;
            }

            // Crear nuevo draft copiando los datos del origen
            const draftData = source.toObject();
            delete (draftData as any)._id;
            delete (draftData as any).id;
            delete (draftData as any).createdAt;
            delete (draftData as any).updatedAt;

            const draft = new Template({
                ...draftData,
                documentGroupId: source.documentGroupId,
                stage: 'draft',
                version_tag: 'Borrador',
                comment: `Borrador creado desde ${source.name}`,
                owner: userId
            });

            return await draft.save();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error creating draft: ${message}`);
        }
    }

    // Publicar a produccion (desde draft, QA o histórico)
    static async publishTemplate(documentGroupId: string, userId: string, comment: string, templateId?: string): Promise<ITemplate | null> {
        try {
            let target: ITemplate | null;

            if (templateId) {
                // Publicar una versión específica (QA, histórica o draft)
                target = await Template.findOne({
                    _id: templateId,
                    documentGroupId: documentGroupId,
                    $or: [
                        { owner: userId },
                        { 'access.sharedWith': userId },
                        { 'access.isPublic': true }
                    ]
                }).exec();

                if (!target) {
                    throw new Error('Version not found or access denied');
                }

                if (target.stage === 'production') {
                    throw new Error('This version is already in production');
                }
            } else {
                // Buscar el draft del usuario
                target = await Template.findOne({
                    documentGroupId: documentGroupId,
                    stage: 'draft',
                    owner: userId
                }).exec();

                if (!target) {
                    throw new Error('No draft found to publish');
                }
            }

            // Desmarcar la producción actual y mover a historical
            await Template.updateMany(
                {
                    documentGroupId: documentGroupId,
                    stage: 'production'
                },
                {
                    $set: { stage: 'historical' }
                }
            ).exec();

            // Marcar el target como producción
            target.stage = 'production';
            target.version_tag = `v${Date.now()}`;
            target.comment = comment || target.comment || '';
            target.updatedAt = new Date();

            return await target.save();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error publishing template: ${message}`);
        }
    }

    // Eliminar una version del historial
    static async deleteTemplateVersion(templateId: string, userId: string): Promise<boolean> {
        try {
            const template = await Template.findOne({
                _id: templateId,
                owner: userId
            }).exec();

            if (!template) {
                throw new Error('Template not found or access denied');
            }

            // No permitir eliminar una version de produccion
            if (template.stage === 'production') {
                throw new Error('Cannot delete a production version');
            }

            const result = await Template.deleteOne({
                _id: templateId,
                owner: userId
            }).exec();

            return result.deletedCount > 0;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error deleting template version: ${message}`);
        }
    }

    // Publicar a QA
    static async publishToQA(templateId: string, userId: string): Promise<ITemplate | null> {
        try {
            const source = await Template.findOne({
                _id: templateId,
                $or: [
                    { owner: userId },
                    { 'access.sharedWith': userId },
                    { 'access.isPublic': true }
                ]
            }).exec();

            if (!source) {
                throw new Error('Template not found or access denied');
            }

            // Desmarcar QA de cualquier otro template en el grupo
            await Template.updateMany(
                {
                    documentGroupId: source.documentGroupId,
                    stage: 'qa'
                },
                {
                    $set: { stage: 'historical' }
                }
            ).exec();

            // Clonar el template fuente en un nuevo documento independiente para QA
            const sourceObj = source.toObject();
            delete (sourceObj as any)._id;
            delete (sourceObj as any).id;
            delete (sourceObj as any).createdAt;
            delete (sourceObj as any).updatedAt;

            const qaDoc = new Template({
                ...sourceObj,
                documentGroupId: source.documentGroupId,
                stage: 'qa',
                version_tag: new Date().toISOString(),
            });

            return await qaDoc.save();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error publishing to QA: ${message}`);
        }
    }

    // ── Fin Sistema de Versiones ─────────────────────────────────────────────────

    // Compartir template con otros usuarios
    static async shareTemplate(
        templateId: string,
        userId: string,
        targetUserIds: string[],
        isPublic: boolean = false
    ): Promise<ITemplate | null> {
        try {
            return await Template.findOneAndUpdate(
                {
                    _id: templateId,
                    owner: userId  // Solo el owner puede compartir
                },
                {
                    $addToSet: { 'access.sharedWith': { $each: targetUserIds } },
                    'access.isPublic': isPublic
                },
                { new: true, runValidators: true }
            ).exec();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Error sharing template: ${message}`);
        }
    }
}
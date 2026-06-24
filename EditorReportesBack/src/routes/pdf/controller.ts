// src/routes/pdf/controller.ts
import { Request, Response } from 'express';
import fs from 'fs';

import { AppDataSource } from '../../config/typeorm.config';
import { FileStatus, GeneratedFile } from '../../entities/GeneratedFIles.entity';
import { StorageManager } from '../../manager/storage.manager';
import { handlePdfEnqueue } from './shared.handler';
import { GeneratePDFByGroupRequest } from './types';


export const generatePdfLink  = async (req: Request, res: Response) => {
  console.log('[PDF Controller] generatePdfLink llamado', { bodyKeys: Object.keys(req.body) });
  return handlePdfEnqueue(req, res, { responseType: 'sse' });
}

export const generatePdfWebhook = async (req: Request, res: Response) => {
  const { apiKey, id, webhookUrl } = req.body;

  if (!apiKey) {
    const response = { success: false, error: 'Missing required field: apiKey is required' };
    console.log('[PDF Controller] generatePdfWebhook retornando:', response);
    return res.status(400).json(response);
  }
  if (!id) {
    const response = { success: false, error: 'id is required' };
    console.log('[PDF Controller] generatePdfWebhook retornando:', response);
    return res.status(400).json(response);
  }
  if (!webhookUrl) {
    const response = { success: false, error: 'webhookUrl is required for this endpoint' };
    console.log('[PDF Controller] generatePdfWebhook retornando:', response);
    return res.status(400).json(response);
  }

  req.body.documentId = id;
  req.body.documentGroupId = undefined;
  req.body.stage = undefined;

  console.log('[PDF Controller] generatePdfWebhook delegando a handlePdfEnqueue', { documentId: id, webhookUrl });
  return handlePdfEnqueue(req, res, { responseType: 'webhook' });
};

export const generatePdfWebhookByGroup = async (req: Request, res: Response) => {
  const { apiKey, idGroup, stage, webhookUrl } = req.body;

  if (!apiKey) {
    const response = { success: false, error: 'Missing required field: apiKey is required' };
    console.log('[PDF Controller] generatePdfWebhookByGroup retornando:', response);
    return res.status(400).json(response);
  }
  if (!idGroup) {
    const response = { success: false, error: 'idGroup is required' };
    console.log('[PDF Controller] generatePdfWebhookByGroup retornando:', response);
    return res.status(400).json(response);
  }
  if (!stage) {
    const response = { success: false, error: 'stage is required' };
    console.log('[PDF Controller] generatePdfWebhookByGroup retornando:', response);
    return res.status(400).json(response);
  }
  if (!['draft', 'qa', 'production', 'historical'].includes(stage)) {
    const response = { success: false, error: 'Invalid stage. Must be: draft, qa, production or historical' };
    console.log('[PDF Controller] generatePdfWebhookByGroup retornando:', response);
    return res.status(400).json(response);
  }
  if (!webhookUrl) {
    const response = { success: false, error: 'webhookUrl is required for this endpoint' };
    console.log('[PDF Controller] generatePdfWebhookByGroup retornando:', response);
    return res.status(400).json(response);
  }

  req.body.documentGroupId = idGroup;
  req.body.stage = stage;
  req.body.documentId = undefined;

  console.log('[PDF Controller] generatePdfWebhookByGroup delegando a handlePdfEnqueue', { documentGroupId: idGroup, stage, webhookUrl });
  return handlePdfEnqueue(req, res, { responseType: 'webhook' });
};

export const generatePdfByGroup = async (req: Request, res: Response) => {
  const { apiKey, id, stage, data } = req.body;

  if (!apiKey || !id || !stage || !data) {
    const response = { success: false, error: 'Missing required fields: apiKey, id, stage and data are required' };
    console.log('[PDF Controller] generatePdfByGroup retornando:', response);
    return res.status(400).json(response);
  }

  if (!['draft', 'qa', 'production', 'historical'].includes(stage)) {
    const response = { success: false, error: 'Invalid stage. Must be: draft, qa, production or historical' };
    console.log('[PDF Controller] generatePdfByGroup retornando:', response);
    return res.status(400).json(response);
  }

  // Mapear id → documentGroupId y stage para el queue
  req.body.documentGroupId = id;
  req.body.stage = stage;
  req.body.documentId = undefined;
  req.body.data = data;
  req.body.webhookUrl = undefined;

  console.log('[PDF Controller] generatePdfByGroup delegando a handlePdfEnqueue', { documentGroupId: id, stage, hasData: !!data });
  return handlePdfEnqueue(req, res, { responseType: 'sse' });
};



export const servePdfFile = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const fileRepository = AppDataSource.getRepository(GeneratedFile);

    if (!slug) {
        const response = { message: "Slug is required" };
        console.log('[PDF Controller] servePdfFile retornando:', response);
        res.status(400).json(response);
        return;
    }

    try {
        // 1. Find the record
        const fileRecord = await fileRepository.findOne({ where: { slug } });

        if (!fileRecord) {
            const response = { message: "File not found" };
            console.log('[PDF Controller] servePdfFile retornando:', response);
            res.status(404).json(response);
            return;
        }

        // 2. Check Expiration
        const now = new Date();
        if (now > fileRecord.expires_at || fileRecord.status === FileStatus.EXPIRED) {
            
            // Solo eliminar si no está ya eliminado
            if (fileRecord.status !== FileStatus.EXPIRED) {
                const storageProvider = StorageManager.getProvider();
                await storageProvider.delete(fileRecord.slug + '.pdf', 'pdf');
                
                // Update DB status
                fileRecord.status = FileStatus.EXPIRED;
                await fileRepository.save(fileRecord);
            }

            const response = { message: "The file has already expired" };
            console.log('[PDF Controller] servePdfFile retornando:', response);
            res.status(410).json(response);
            return;
        }

        // 3. Serve the file
        const storageProvider = StorageManager.getProvider();
        const filePath = await storageProvider.getSignedUrl(fileRecord.slug + '.pdf', 'pdf');

        res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', `inline; filename="${fileRecord.original_name}"`);
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileRecord.original_name)}"`);
        
        // Prevenir caché
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // 4. Handle "Delete Immediately" logic
        if (fileRecord.delete_immediately) {
            const performDeletion = async () => {
                try {
                    const currentRecord = await fileRepository.findOne({ where: { slug } });
                    if (currentRecord && currentRecord.status !== FileStatus.EXPIRED) {
                        const storageProvider = StorageManager.getProvider();
                        await storageProvider.delete(fileRecord.slug + '.pdf', 'pdf');
                        
                        currentRecord.status = FileStatus.EXPIRED;
                        currentRecord.delete_immediately = false;
                        await fileRepository.save(currentRecord);
                        console.log(`🗑️ Physical file ${fileRecord.slug} deleted after serving.`);
                    }
                } catch (e) {
                    console.error("Cleanup error:", e);
                }
            };

            // No marcar como EXPIRADO inmediatamente
            fileRecord.delete_immediately = false;
            await fileRepository.save(fileRecord);

            setTimeout(performDeletion, 3000);
        }

        // 5. Stream the file (solo modo local)
        console.log('[PDF Controller] sirviendo archivo PDF:', { slug: fileRecord.slug, originalName: fileRecord.original_name, filePath });
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error("Download Error:", error);
        const response = { message: "Internal server error" };
        console.log('[PDF Controller] servePdfFile retornando:', response);
        res.status(500).json(response);
        return;
    }
};



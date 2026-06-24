// src/routes/pdf/shared.handler.ts
import { Request, Response } from 'express';
import { addPdfToQueue } from '../../queues/pdf.queue';
import { ApiKeyService } from '../../services/apiKey.service';
import { TemplateService } from '../../services/template.service';
import { RateLimitService } from '../../services/rateLimit.service';

export const handlePdfEnqueue = async (req: Request, res: Response, options: {
  responseType: 'sse' | 'webhook' 
}) => {
  const { apiKey, documentId, documentGroupId, stage, deleteImmediately = false, webhookUrl, data, expiresInMinutes } = req.body;

  // 1. Common Validation
  if (!apiKey) {
    const response = { success: false, error: 'Missing required field: apiKey is required' };
    console.log('[Shared Handler] Retornando:', response);
    return res.status(400).json(response);
  }
  if (!documentId && !(documentGroupId && stage)) {
    const response = { success: false, error: 'Either documentId or documentGroupId+stage are required' };
    console.log('[Shared Handler] Retornando:', response);
    return res.status(400).json(response);
  }

  // 2. SSRF Protection: Basic URL validation for webhooks
  if (options.responseType === 'webhook') {
    if (!webhookUrl) {
      const response = { success: false, error: 'webhookUrl is required for this endpoint' };
      console.log('[Shared Handler] Retornando:', response);
      return res.status(400).json(response);
    }
    try {
      new URL(webhookUrl);
    } catch {
      const response = { success: false, error: 'Invalid webhookUrl format' };
      console.log('[Shared Handler] Retornando:', response);
      return res.status(400).json(response);
    }
  }

  try {
    // 3. API Key validation (401)
    const apiKeyValidated = await ApiKeyService.validateApiKey(apiKey);
    if (!apiKeyValidated.valid) {
      const response = { success: false, error: 'Invalid API key' };
      console.log('[Shared Handler] Retornando:', response);
      return res.status(401).json(response);
    }

    // 4. Rate limit check (429) - solo en modo SaaS
    if (process.env.PROJECT_MODE !== 'local') {
      const LIMIT_PER_HOUR = Number(process.env.PDF_LIMIT_PER_HOUR) || 500;
      const rateLimit = RateLimitService.checkAndIncrement(apiKey, LIMIT_PER_HOUR, 3600000);
      if (!rateLimit.allowed) {
        const response = {
          success: false,
          error: `Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`
        };
        console.log('[Shared Handler] Retornando:', response);
        return res.status(429).json(response);
      }
    }

    // 5. Validar que el documento existe (404)
    if (documentGroupId && stage) {
      const doc = await TemplateService.getTemplateByGroupAndStage(documentGroupId, stage);
      if (!doc) {
        const response = { success: false, error: 'Document not found' };
        console.log('[Shared Handler] Retornando:', response);
        return res.status(404).json(response);
      }
    } else if (documentId) {
      const doc = await TemplateService.getTemplateById(documentId);
      if (!doc) {
        const response = { success: false, error: 'Document not found' };
        console.log('[Shared Handler] Retornando:', response);
        return res.status(404).json(response);
      }
    }

    const job = await addPdfToQueue({ 
      apiKey, 
      documentId,
      documentGroupId,
      stage,
      deleteImmediately,
      webhookUrl,
      data,
      expiresInMinutes
    });

    const responsePayload: any = {
      success: true,
      jobId: job.id,
      status: 'queued',
      message: `PDF generation started`,
      dataSource: data ? 'provided' : 'default',
    };

    if (options.responseType === 'sse') {
      responsePayload.sseUrl = `/api/sse/pdf-status/${job.id}`;
    }

    console.log('[Shared Handler] Retornando:', responsePayload);
    return res.status(202).json(responsePayload);
    
  } catch (error: any) {
    console.error("❌ Enqueue Error:", error.message);
    const status = error.status === 429 ? 429 : 500;
    const response = { success: false, error: error.message };
    console.log('[Shared Handler] Retornando:', response);
    return res.status(status).json(response);
  }
};
import { Worker, Job } from 'bullmq';
import crypto from 'node:crypto';
import https from 'node:https';
import { connection } from '../queues/pdf.queue';
import { generatePDFDirectService, generatePDFService } from '../services/pdf.service';
import { SSEService } from '../services/sse.service';
import { environment } from '../config/enviroment';
import { PDFJobData } from '../types/pdfJob';

const worker = new Worker('pdf-tasks', async (job: Job<PDFJobData>) => {
  const { apiKey, documentId, documentGroupId, stage, deleteImmediately = false, webhookUrl, data, expiresInMinutes } = job.data;
  const jobId = job.id;
  
  if (!jobId) {
    throw new Error('Job ID is undefined');
  }
  
  console.log(`🔄 Procesando job ${jobId} para documento ${documentId ?? documentGroupId} (stage: ${stage ?? '—'}, deleteImmediately: ${deleteImmediately})`);
  
  try {
    // Notificar inicio
    await SSEService.publish(jobId, 'progreso', { 
      etapa: 'iniciado', 
      porcentaje: 10,
      mensaje: 'Comenzando generación del PDF...'
    });
    
    // Función de progreso común para ambos servicios
    const reportProgress = async (etapa: string, porcentaje: number, mensaje: string) => {
      await SSEService.publish(jobId, 'progreso', { etapa, porcentaje, mensaje });
    };

    let result;

    result = await generatePDFService(
      { apiKey, ...(documentId !== undefined && { documentId }), ...(documentGroupId !== undefined && { documentGroupId }), ...(stage !== undefined && { stage }) },
      reportProgress,
      data,
      deleteImmediately,
      expiresInMinutes
    );

    console.log('[PDF Worker] Resultado de generatePDFService:', { jobId, success: result.success, slug: result.slug, message: result.message });

    if (webhookUrl) {
      const payload = {
        event: 'pdf.completed',
        jobId,
        slug: result.slug,
        url: `${environment.baseUrl}/api/pdf/v/${result.slug}`,
        timestamp: new Date().toISOString()
      };

      const secret = process.env.WEBHOOK_SECRET || 'fallback_secret';
      const signature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      const body = JSON.stringify(payload);
      const commonHeaders = {
        'Content-Type': 'application/json',
        'X-SaaS-Signature': signature,
      };

      const useSelfSigned = process.env.WEBHOOK_ALLOW_SELFSIGNED === 'true';
      const isHttps = webhookUrl.startsWith('https://');

      if (useSelfSigned && isHttps) {
        await new Promise<void>((resolve, reject) => {
          const req = https.request(webhookUrl, {
            method: 'POST',
            headers: commonHeaders,
            rejectUnauthorized: false,
            timeout: 10000,
          }, (res) => {
            res.resume();
            resolve();
          });
          req.on('error', reject);
          req.on('timeout', () => { req.destroy(); reject(new Error('Webhook timeout')); });
          req.write(body);
          req.end();
        });
      } else {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: commonHeaders,
          body,
          signal: AbortSignal.timeout(10000),
        });
      }
    }
    
    console.log(`✅ PDF generado exitosamente para job ${jobId}, slug: ${result.slug}`);
    
    // Notificar completado con slug/url
    await SSEService.publish(jobId, 'completado', {
      success: true,
      slug: result.slug,
      url: `${environment.baseUrl}/api/pdf/v/${result.slug}`,
      message: 'PDF generado correctamente'
    });
    
    return result;
    
  } catch (error: any) {
    console.error(`❌ Error en job ${jobId}:`, error);
    
    // Notificar error
    await SSEService.publish(jobId, 'error', {
      success: false,
      message: error.message || 'Error generando PDF',
      status: error.status || 500
    });
    
    throw error;
  }
}, { 
  connection,
  lockDuration: Number(process.env.QUEUE_DURATION) || 60000,
  concurrency: Number(process.env.QUEUE_CONCURRENCY) || 5,
  lockRenewTime: Number(process.env.QUEUE_LOCK_RENEW_TIME) || 15000,
});

worker.on('completed', (job: Job) => {
  console.log(`✅ Worker: Job ${job.id} completado`);
});

worker.on('failed', (job: Job | undefined, error: Error) => {
  console.log(`❌ Worker: Job ${job?.id} falló:`, error.message);
});

console.log('🚀 Worker de PDF iniciado con Redis Pub/Sub');

export default worker;

import { writeFileSync } from "node:fs";
import { AppDataSource } from "../config/typeorm.config";
import { buildPageCss } from "../dto/pdf-generation.dto";
import { FileStatus, GeneratedFile } from "../entities/GeneratedFIles.entity";
import { PdfAuditLog } from "../entities/PdfAuditLog.entity";
import { isLocalMode } from "../helpers/general.helpers";
import { withTransaction } from "../helpers/transaction.helper";
import { StorageManager } from "../manager/storage.manager";
import { generateSecureSlug } from "../utils/file.util";
import { generateHtml } from "../utils/generateHtml";
import { inlineImages } from "../utils/inlineImages";
import { applyWatermark } from "../utils/watermark";
import Handlebars from 'handlebars';
import { setupHandlebarsHelpers } from "../helpers/handlebars.helpers";
import { ApiKeyService } from "./apiKey.service";
import { QuotaService } from "./quota.service";
import { RateLimitService } from "./rateLimit.service";
import { SubscriptionService } from "./subscriptions.service";
import { TemplateService } from "./template.service";


type ProgressCallback = (etapa: string, porcentaje: number, mensaje: string) => Promise<void>;

type AfterPDFGenerated<T> = (
  pdfBuffer: Buffer, 
  document: any, 
  apiKeyValidated: any,
  subscription: any
) => Promise<T>;


async function basePDFGeneration<T>(
  payload: IGeneratePDFService,
  onProgress: ProgressCallback,
  jsonDataVar: Record<string, any> | undefined,
  afterPDFGenerated: AfterPDFGenerated<T>
) {
  const { apiKey, documentId, documentGroupId, stage } = payload;

  await onProgress('validando API key', 10, 'Verificando credenciales...');

  // Validar API Key
  const apiKeyValidated = await ApiKeyService.validateApiKey(apiKey);
  if (!apiKeyValidated.valid) {
    throw new Error('Invalid API key');
  }

  let subscription = undefined;
  if ( !isLocalMode() ) {
    // [DISABLED] Subscription and quota checks
    /*
    // Obtener subscription
    subscription = await SubscriptionService.getActiveSubscription(apiKeyValidated.user!.id);
    if (!subscription) {
      try {
        await withTransaction(async (queryRunner) => {
          const { createFreeSubscription } = await import("../helpers/subscription.helper");
          await createFreeSubscription(queryRunner, apiKeyValidated.user!);
        });
        subscription = await SubscriptionService.getActiveSubscription(apiKeyValidated.user!.id);
      } catch (e) {
        console.error('Error auto-creating free subscription:', e);
      }
    }

    if (!subscription) {
      throw new Error('Subscription not found');
    }
  
    // Validar quota (EN TRANSACCIÓN)
    const quotaCheck = await withTransaction(async (queryRunner) => {
      return await QuotaService.checkAndIncrementPDFQuota(
          apiKeyValidated.apiKeyEntity!, // la entidad completa
          documentId,
          queryRunner
      );
    });
  
  
    // Si no tiene permisos (allowed = false) pero tiene overage, continuamos pero registramos
    // Si no tiene permisos Y no tiene overage cost, lanzamos error
    if (!quotaCheck.allowed && !quotaCheck.overageCost) {
      const error: any = new Error('Daily quota exceeded');
      error.status = 429;
      error.quotaInfo = {
          used: quotaCheck.currentUsage,
          limit: quotaCheck.limit,
          overageUsed: quotaCheck.overageUsage
      };
      throw error;
    }
  
      // Agregar quotaInfo al payload para usarlo después
      payload.quotaInfo = {
          used: quotaCheck.currentUsage,
          limit: quotaCheck.limit,
          overageUsed: quotaCheck.overageUsage,
          overageCost: quotaCheck.overageCost ?? undefined
      };
    */
  
    await onProgress('API validada', 20, 'API Key verificada correctamente');
  
    // Rate limit
    const LIMIT_PER_HOUR = Number(process.env.PDF_LIMIT_PER_HOUR) || 500;
    const ONE_HOUR_MS = 60 * 60 * 1000;
  
    const rateLimit = RateLimitService.checkAndIncrement(
      apiKey, 
      LIMIT_PER_HOUR, 
      ONE_HOUR_MS
    );
  
    if (!rateLimit.allowed) {
      const error: any = new Error(`Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`);
      error.status = 429;
      error.retryAfter = rateLimit.retryAfter;
      throw error;
    }
  
    await onProgress('rate limit ok', 30, 'Límite de uso verificado');
    
  }


  // Validar Documento — por documentGroupId+stage o por documentId
  let document;
  if (documentGroupId && stage) {
    document = await TemplateService.getTemplateByGroupAndStage(documentGroupId, stage);
  } else if (documentId) {
    document = await TemplateService.getTemplateById(documentId);
  } else {
    throw new Error('documentId or documentGroupId+stage is required');
  }
  if (!document) {
    throw new Error('Document not found');
  }


  await onProgress('documento cargado', 40, 'Documento encontrado');

  // Watermark solo para API keys de desarrollo
  if (apiKeyValidated.type === 'development') {
    applyWatermark(document);
  }

  await onProgress('generando HTML', 50, 'Procesando plantilla...');

  const templateData = jsonDataVar || document.sampleData;
  const renderedHtml = generateHtml({ 
    html: document.html, 
    css: document.css, 
    json: templateData
  });
  console.log('[PDF] HTML rendered:', {
    length: renderedHtml.length,
    hasCss: !!document.css,
  });

  setupHandlebarsHelpers();
  const compiledHeader = document.htmlHeader
    ? Handlebars.compile(document.htmlHeader)(templateData)
    : '';
  const compiledFooter = document.htmlFooter
    ? Handlebars.compile(document.htmlFooter)(templateData)
    : '';

  console.log('[PDF] Raw pageConfig:', JSON.stringify(document.pageConfig, null, 2));

  const pageCss = buildPageCss(document.pageConfig);
  const rawPageCssContent = pageCss
    ? pageCss.replace(/^@page\s*\{\s*/, '').replace(/\s*\}\s*$/, '').trim()
    : '';

  const unit = document.pageConfig?.unit || 'mm';

  // Extraer margin-top y margin-bottom del @page
  let userMarginTop = '0';
  let userMarginBottom = '0';
  let marginRight = '0';
  let marginLeft = '0';

  const marginShorthand = rawPageCssContent.match(/margin:\s*([^\s;]+)\s+([^\s;]+)\s+([^\s;]+)\s+([^\s;]+)\s*;/i);
  if (marginShorthand) {
    userMarginTop = marginShorthand[1]!;
    marginRight = marginShorthand[2]!;
    userMarginBottom = marginShorthand[3]!;
    marginLeft = marginShorthand[4]!;
  } else {
    userMarginTop = rawPageCssContent.match(/margin-top:\s*([^\s;]+)/i)?.[1] || '0';
    userMarginBottom = rawPageCssContent.match(/margin-bottom:\s*([^\s;]+)/i)?.[1] || '0';
  }

  // Convertir valor numérico de un string como "10mm" → 10
  const parseVal = (val: string): number => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  // Convertir mm a la unidad configurada
  const toUnit = (mmVal: number): number => {
    switch (unit) {
      case 'cm': return mmVal / 10;
      case 'in': return +(mmVal / 25.4).toFixed(2);
      case 'px': return Math.round(mmVal * 96 / 25.4);
      default: return mmVal; // mm
    }
  };

  const HEADER_MIN_MM = 20;
  const FOOTER_MIN_MM = 15;

  // Calcular márgenes @page con altura de encabezado/pie para que aplique en TODAS las páginas
  let pageCssContent = rawPageCssContent;

  let headerMarginVal: string | null = null;
  let footerMarginVal: string | null = null;

  if (document.htmlHeader) {
    const userTop = parseVal(userMarginTop);
    const configH = document.pageConfig?.headerHeight;
    const headerTarget = (configH && configH > 0) ? configH : toUnit(HEADER_MIN_MM);
    headerMarginVal = `${Math.max(userTop, headerTarget)}${unit}`;

    const currentShorthand = pageCssContent.match(/margin:\s*([^\s;]+)\s+([^\s;]+)\s+([^\s;]+)\s+([^\s;]+)\s*;/i);
    if (currentShorthand) {
      pageCssContent = pageCssContent
        .replace(/margin:\s*([^\s;]+)\s+([^\s;]+)\s+([^\s;]+)\s+([^\s;]+)\s*;/gi,
          `margin: ${headerMarginVal} ${currentShorthand[2]} ${currentShorthand[3]} ${currentShorthand[4]};`);
    }
    pageCssContent = pageCssContent
      .replace(/margin-top:\s*[^;]+;/gi, `margin-top: ${headerMarginVal};`);
  }

  if (document.htmlFooter) {
    const userBottom = parseVal(userMarginBottom);
    const configF = document.pageConfig?.footerHeight;
    const footerTarget = (configF && configF > 0) ? configF : toUnit(FOOTER_MIN_MM);
    footerMarginVal = `${Math.max(userBottom, footerTarget)}${unit}`;

    const currentShorthand = pageCssContent.match(/margin:\s*([^\s;]+)\s+([^\s;]+)\s+([^\s;]+)\s+([^\s;]+)\s*;/i);
    if (currentShorthand) {
      pageCssContent = pageCssContent
        .replace(/margin:\s*([^\s;]+)\s+([^\s;]+)\s+([^\s;]+)\s+([^\s;]+)\s*;/gi,
          `margin: ${currentShorthand[1]} ${currentShorthand[2]} ${footerMarginVal} ${currentShorthand[4]};`);
    }
    pageCssContent = pageCssContent
      .replace(/margin-bottom:\s*[^;]+;/gi, `margin-bottom: ${footerMarginVal};`);
  }

  const headerExplicit = document.pageConfig?.headerHeight != null && document.pageConfig.headerHeight > 0;
  const footerExplicit = document.pageConfig?.footerHeight != null && document.pageConfig.footerHeight > 0;

  const buildFixedRule = (
    className: string,
    position: string,
    explicit: boolean,
    heightValue: string | null
  ): string => {
    const parts = [`position: fixed`, position, 'left: 0', 'right: 0', 'z-index: 100'];
    if (!explicit && heightValue) {
      parts.push(`max-height: ${heightValue}`);
      parts.push('overflow: hidden');
    }
    return `.${className} { ${parts.join('; ')}; }`;
  };

  let finalHtml = renderedHtml;
  if (document.htmlHeader || document.htmlFooter) {
    const headerPart = compiledHeader;
    const footerPart = compiledFooter;

    const headerFooterCss = [
      document.cssHeader || '',
      document.cssFooter || '',
      buildFixedRule('pdf-header', headerMarginVal ? `top: -${headerMarginVal}` : 'top: 0', headerExplicit, headerMarginVal),
      buildFixedRule('pdf-footer', footerMarginVal ? `bottom: -${footerMarginVal}` : 'bottom: 0', footerExplicit, footerMarginVal),
      '.pageNumber::before { content: counter(page); }',
      '.totalPages::before { content: counter(pages); }',
    ].filter(Boolean).join('\n');

    const hfStyles = `
      <style>
        ${headerFooterCss}
        @page {
          ${pageCssContent}
        }
      </style>`;

    finalHtml = renderedHtml.replace(
      '</head>',
      `${hfStyles}</head>`
    );

    const bodyOpen = finalHtml.match(/<body[^>]*>/i);
    if (bodyOpen) {
      const insertIdx = bodyOpen.index! + bodyOpen[0].length;
      finalHtml = finalHtml.slice(0, insertIdx)
        + (headerPart ? `<div class="pdf-header">${headerPart}</div>` : '')
        + (footerPart ? `<div class="pdf-footer">${footerPart}</div>` : '')
        + finalHtml.slice(insertIdx);
    }
  } else {
    if (pageCss) {
      finalHtml = finalHtml.replace('</head>', `<style>${pageCss}</style></head>`);
    }
  }
  console.log('[PDF] Page config applied via CSS');

  await onProgress('generando PDF', 70, 'Llamando al servicio de PDF...');


  const htmlWithInlinedImages = await inlineImages(finalHtml);

  writeFileSync('debug-output.html', htmlWithInlinedImages, 'utf-8');
  
  const pdfBuffer = await callPdfApi(htmlWithInlinedImages);

  // Aquí llamamos al callback con el resultado
  return await afterPDFGenerated(pdfBuffer, document, apiKeyValidated, subscription);
}

// export const generatePDFService = async ( apikey: string, documentId: string ): 
export const generatePDFService = async ( 
    payload: IGeneratePDFService, 
    onProgress: ProgressCallback,
    jsonDataVar?: Record<string, any>,
    deleteImmediately: boolean = false,
    expiresInMinutes?: number
): Promise<{ 
    success: boolean, 
    pdfBase64: string, 
    slug: string,
    message: string
}> => {
    
    return basePDFGeneration(
        payload,
        onProgress,
        jsonDataVar,
        async (pdfBuffer, document, apiKeyValidated, subscription) => {
            
            await onProgress('guardando archivo', 85, 'Almacenando PDF...');

            // [DISABLED] Subscription feature value check
            const defaultExpiration = 5;
            const minutes = expiresInMinutes ?? defaultExpiration;
            const retentionSeconds = Math.max(1, minutes) * 60;

            // 1. Prepare Metadata
            const slug = generateSecureSlug(12);
            const fileName = `${slug}.pdf`;
            const storageProvider = StorageManager.getProvider();

            // 2. Save Physical File
            const storagePath = await storageProvider.save(pdfBuffer, fileName, 'pdf');

            // 3. Save to Database
            const fileRepository = AppDataSource.getRepository(GeneratedFile);
            const newFile = fileRepository.create({
                slug,
                original_name: document.name || 'document.pdf',
                storage_path: storagePath,
                status: FileStatus.COMPLETED,
                created_at: new Date(Date.now()),
                // expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
                expires_at: new Date(Date.now() + (retentionSeconds * 1000)),
                delete_immediately: deleteImmediately,
                apiKey: apiKeyValidated.apiKeyEntity,
                user: apiKeyValidated.user
            });

            await fileRepository.save(newFile);

            const auditLogRepo = AppDataSource.getRepository(PdfAuditLog);
            const auditLog = auditLogRepo.create({
                user: apiKeyValidated.user,
                apiKey: apiKeyValidated.apiKeyEntity,
                generation_time_ms: 0, // calcula esto
                source_ip: '', // necesitas pasar la IP desde el request
                file_size_bytes: pdfBuffer.length,
                document_id: payload.documentGroupId || payload.documentId || ''
            });
            await auditLogRepo.save(auditLog);

            return {
                success: true,
                pdfBase64: pdfBuffer.toString('base64'),
                slug,
                message: 'PDF generated and stored successfully'
            };
        }
    );
};

export const generatePDFDirectService = async ( 
    payload: IGeneratePDFService, 
    onProgress: ProgressCallback,
    jsonDataVar?: Record<string, any>,
): Promise<{ 
    success: boolean, 
    pdfBase64: string, 
    message: string
}> => {
    
    return basePDFGeneration(
        payload,
        onProgress,
        jsonDataVar,
        async (pdfBuffer, document, apiKeyValidated) => {
            
            await onProgress('PDF generado', 100, 'PDF listo para descargar');

            return {
                success: true,
                pdfBase64: pdfBuffer.toString('base64'),
                message: 'PDF generated successfully'
            };
        }
    );
};

const callPdfApi = async (html: string): Promise<Buffer> => {

    // 1. Crear un controlador para abortar la petición
    const controller = new AbortController();

    // 2. Configurar un timeout de 30 segundos
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {

        let fetchResponse: Response;

        console.log('[PDF] Payload to pdf-service:', {
          htmlLen: html.length,
        });

        const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:3001';
        const targetUrl = `${PDF_SERVICE_URL}/api/pdf/file`;
        console.log('[PDF Service] Enviando solicitud a:', { url: targetUrl, htmlLength: html.length });
        fetchResponse = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                html: html,
            }),
            signal: controller.signal
        });
        
        console.log('[PDF Service] Respuesta recibida:', { status: fetchResponse.status, statusText: fetchResponse.statusText });
        
        if (!fetchResponse.ok) {
            throw new Error(`Failed to generate PDF: ${fetchResponse.status} - ${JSON.stringify(fetchResponse)}`);
        }


        const arrayBuffer = await fetchResponse.arrayBuffer();
        const pdfBuffer = Buffer.from(arrayBuffer);
        console.log('[PDF Service] PDF generado exitosamente:', { bufferSize: pdfBuffer.length });
        return pdfBuffer;
        // const response = await fetchResponse.json() as { pdfBase64: string };
        // return response.pdfBase64;


    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error('PDF generation timed out after 30 seconds');
        }
        throw error;
    } finally {
        // 3. Limpiar el temporizador siempre
        clearTimeout(timeout);
    }
    

}
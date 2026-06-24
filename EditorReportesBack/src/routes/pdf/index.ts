// src/routes/pdf/index.ts
import { Router } from 'express';
// import { validateApiKey } from './middleware';
import { servePdfFile, generatePdfLink, generatePdfWebhook, generatePdfWebhookByGroup, generatePdfByGroup } from './controller';

const router = Router();

router.post('/generatePdf', generatePdfLink ); //encola y responde con jobId (flujo SSE)
router.post('/generatePdfWebhook', generatePdfWebhook ); //encola por id del documento (webhook)
router.post('/generatePdfWebhookByGroup', generatePdfWebhookByGroup ); //encola por idGroup + stage (webhook)
router.post('/generatePdfByGroup', generatePdfByGroup ); //encola por idGroup + stage (SSE)
router.get('/v/:slug', servePdfFile); //sirve el PDF

// GET /api/pdf/templates (opcional, para listar templates disponibles)
// router.get('/templates', validateApiKey, (req, res) => {
//   res.json({
//     success: true,
//     templates: [
//       { id: 'invoice', name: 'Invoice Template', description: 'Standard invoice' },
//       { id: 'report', name: 'Report Template', description: 'Monthly report' },
//       // Agrega más templates según necesites
//     ]
//   });
// });

export default router;
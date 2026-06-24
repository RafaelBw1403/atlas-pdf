import { Router } from "express";
import { createPdf, createPdfBase64 } from "../controllers/pdf.controller.js";
import { validate } from "../middleware/validate.js";
import { PdfRequestSchema } from "../validation/pdf.schema.js";

export const pdfRouter = Router();

pdfRouter.post("/file", validate(PdfRequestSchema), createPdf);
pdfRouter.post("/base64", validate(PdfRequestSchema), createPdfBase64);

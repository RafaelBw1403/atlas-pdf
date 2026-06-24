import type { RequestHandler } from "express";
import { generatePdf } from "../services/pdf.service.js";
import type { PdfRequest } from "../validation/pdf.schema.js";

export const createPdf: RequestHandler = async (req, res, next) => {
    try {
        const { html } = req.body as PdfRequest;
        const pdf = await generatePdf(html);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'inline; filename="document.pdf"');
        res.send(pdf);
    } catch (err) {
        console.log("ERROR : ", err)
        next(err);
    }
};


export const createPdfBase64: RequestHandler = async (req, res, next) => {
    try {
        const { html } = req.body as PdfRequest;
        const pdf = await generatePdf(html);

        if (!pdf || !Buffer.isBuffer(pdf)) {
            throw new Error('Invalid PDF buffer received');
        }

        const base64 = pdf.toString("base64");
        
        res.json({ 
            ok: true,
            pdfBase64: base64 
        });
    } catch (err) {
        next(err);
    }
};
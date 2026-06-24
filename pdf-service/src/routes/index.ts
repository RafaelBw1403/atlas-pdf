import { Router } from "express";
import { pdfRouter } from "./pdf.routes.js";

export const routes = Router();

routes.use("/pdf", pdfRouter);

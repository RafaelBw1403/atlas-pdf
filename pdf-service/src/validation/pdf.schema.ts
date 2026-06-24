import { z } from "zod";

export const PdfRequestSchema = z.object({
    html: z.string().min(1, "html is required"),
});
export type PdfRequest = z.infer<typeof PdfRequestSchema>;

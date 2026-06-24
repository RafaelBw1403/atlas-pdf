
import { z } from "zod";

export const PdfOptionsDtoSchema = z.object({
    format: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    landscape: z.boolean().optional(),
    pageRanges: z.string().optional(),
    margin: z.object({
        top: z.string().optional(),
        right: z.string().optional(),
        bottom: z.string().optional(),
        left: z.string().optional(),
    }).partial().optional(),
});

export function normalizePdfOptions(raw: Record<string, any>): PdfOptionsDto {
    const result: Record<string, any> = {};
    const unit = raw.unit || 'mm';

    if (raw.format) result.format = raw.format;
    if (raw.landscape !== undefined) result.landscape = raw.landscape;
    if (raw.pageRanges) result.pageRanges = raw.pageRanges;

    if (raw.width !== undefined) {
        result.width = typeof raw.width === 'number' ? `${raw.width}${unit}` : raw.width;
    }
    if (raw.height !== undefined) {
        result.height = typeof raw.height === 'number' ? `${raw.height}${unit}` : raw.height;
    }

    if (raw.margin) {
        result.margin = {};
        for (const key of ['top', 'right', 'bottom', 'left'] as const) {
            const val = raw.margin[key];
            if (val !== undefined) {
                result.margin[key] = typeof val === 'number' ? `${val}${unit}` : val;
            }
        }
    }

    return PdfOptionsDtoSchema.parse(result);
}

export const GeneratePDFDtoSchema = z.object({
    html: z.string(),
    pdfOptions: PdfOptionsDtoSchema,
});

export function buildPageCss(raw: Record<string, any>): string {
    const rules: string[] = [];
    const unit = raw.unit || 'mm';

    const sizeParts: string[] = [];
    if (raw.format && raw.format !== 'custom') {
        sizeParts.push(raw.format);
    } else {
        if (raw.width !== undefined && raw.height !== undefined) {
            const w = typeof raw.width === 'number' ? `${raw.width}${unit}` : raw.width;
            const h = typeof raw.height === 'number' ? `${raw.height}${unit}` : raw.height;
            sizeParts.push(`${w} ${h}`);
        } else if (raw.width !== undefined) {
            const w = typeof raw.width === 'number' ? `${raw.width}${unit}` : raw.width;
            sizeParts.push(w);
        } else if (raw.height !== undefined) {
            const h = typeof raw.height === 'number' ? `${raw.height}${unit}` : raw.height;
            sizeParts.push(h);
        }
    }
    if (raw.landscape) {
        sizeParts.push('landscape');
    }
    if (sizeParts.length > 0) {
        rules.push(`  size: ${sizeParts.join(' ')};`);
    }

    if (raw.margin) {
        const parts: string[] = [];
        for (const key of ['top', 'right', 'bottom', 'left'] as const) {
            const val = raw.margin[key];
            parts.push(val !== undefined
                ? (typeof val === 'number' ? `${val}${unit}` : val)
                : '0');
        }
        if (parts.some(p => p !== '0')) {
            rules.push(`  margin: ${parts.join(' ')};`);
        }
    }

    if (rules.length === 0) return '';
    return `@page {\n${rules.join('\n')}\n}`;
}

export type PdfOptionsDto = z.infer<typeof PdfOptionsDtoSchema>;
export type GeneratePDFDto = z.infer<typeof GeneratePDFDtoSchema>;
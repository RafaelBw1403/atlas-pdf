import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const status = (err as any)?.status ?? 400;
    const message =
        (err as any)?.message ??
        (Array.isArray((err as any)?.issues) ? "Validation error" : "Unexpected error");
    res.status(status).json({ error: message, details: (err as any)?.issues });
};

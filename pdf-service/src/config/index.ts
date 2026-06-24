export const config = {
    port: Number(process.env.PORT ?? 3001),
    nodeEnv: process.env.NODE_ENV ?? "development",
    weasyPrintPath: process.env.WEASYPRINT_PATH ?? "weasyprint",
    weasyPrintTimeout: Number(process.env.WEASYPRINT_TIMEOUT ?? 60000),
};

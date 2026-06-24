import express from 'express';
import cors from 'cors';
import { createApp } from "./app.js";
import { config } from "./config/index.js";


const app = createApp();
const server = app.listen(config.port, () => {
    console.log(`PDF service listening on :${config.port}`);
    console.log(`✅ Health check disponible en: http://localhost:${config.port}/health`);
});

async function shutdown() {
    console.log("Shutting down...");
    server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ No se pudo iniciar el servidor en el puerto ${config.port}`);
        console.error(`❌ Puerto ${config.port} ya en uso!`);
        console.error('Ejecuta uno de estos comandos para ver qué lo usa:');
        console.error('  Linux/Mac: lsof -i :' + config.port);
        console.error('  Windows: netstat -ano | findstr :' + config.port);
    } else {
        console.error('❌ Error del servidor:', error);
    }
});
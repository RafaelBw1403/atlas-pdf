import { Router, Request, Response } from 'express';
import { SSEService } from '../../services/sse.service';


const router = Router();

router.get('/pdf-status/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  
  if (!jobId) {
    res.status(400).json({ error: 'jobId es requerido' });
    return;
  }
  
  console.log(`📡 Nueva conexión SSE para job ${jobId}`);
  
  // Configurar headers SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
    'X-Accel-Buffering': 'no' // Deshabilitar buffering para nginx
  });
  
  // Enviar mensaje de conexión establecida
  res.write(`event: connected\n`);
  res.write(`data: ${JSON.stringify({ message: 'Conectado al servidor SSE', jobId })}\n\n`);
  
  // Heartbeat para mantener conexión viva
  const heartbeat = setInterval(() => {
    res.write(':\n\n'); // Comentario SSE (mantiene conexión)
  }, 15000);
  
  // Suscribirse a eventos Redis para este job
  const subscriber = SSEService.createSubscriber(jobId, res);
  
  // Timeout de seguridad (5 minutos)
  const timeout = setTimeout(() => {
    console.log(`⏰ Timeout de seguridad para job ${jobId}`);
    res.write(`event: timeout\n`);
    res.write(`data: ${JSON.stringify({ message: 'Tiempo de espera agotado' })}\n\n`);
    res.end();
  }, 300000); // 5 minutos
  
  // Manejar desconexión del cliente
  req.on('close', () => {
    console.log(`🔌 Cliente desconectado de job ${jobId}`);
    clearInterval(heartbeat);
    clearTimeout(timeout);
    
    // Limpiar suscripción Redis
    try {
      subscriber.quit();
    } catch (error) {
      console.error(`Error cerrando subscriber para job ${jobId}:`, error);
    }
    
    res.end();
  });
});

export default router;
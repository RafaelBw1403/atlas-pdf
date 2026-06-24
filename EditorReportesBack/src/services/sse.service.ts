import Redis from 'ioredis';

// Usar la misma conexión que BullMQ o crear una nueva
const redisPublisher = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: Number(process.env.REDIS_DB) || 0,
});

export class SSEService {
  // Publicar un evento para un job específico
  static async publish(jobId: string, event: string, data: any) {
    const channel = `pdf:job:${jobId}`;
    const message = JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString()
    });
    
    console.log(`📢 Publicando evento ${event} para job ${jobId} en canal ${channel}`);
    await redisPublisher.publish(channel, message);
  }

  // Crear un subscriptor para un job (esto lo usa SSE)
  static createSubscriber(jobId: string, res: any) {
    const subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      db: Number(process.env.REDIS_DB) || 0,
    });

    const channel = `pdf:job:${jobId}`;

    subscriber.subscribe(channel, (err) => {
      if (err) {
        console.error(`❌ Error suscribiendo a ${channel}:`, err);
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ message: 'Error interno al conectar' })}\n\n`);
        res.end();
        return;
      }
      console.log(`✅ Suscrito a canal ${channel}`);
    });

    subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        try {
          const { event, data } = JSON.parse(message);
          console.log(`📤 Enviando evento ${event} para job ${jobId}:`, data);
          
          // Enviar evento SSE
          res.write(`event: ${event}\n`);
          res.write(`data: ${JSON.stringify(data)}\n\n`);
          
          // Si es evento final, cerrar conexión
          if (event === 'completado' || event === 'error') {
            setTimeout(async () => {
              console.log(`🔌 Cerrando conexión SSE para job ${jobId} (evento final)`);
              try {
                if (subscriber && subscriber.status === 'ready') {
                    await subscriber.unsubscribe();
                    await subscriber.quit();
                }
            } catch (error) {
                console.log(`🔌 Conexión Redis ya estaba cerrada para job ${jobId}`);
            }
              res.end();
            }, 1000);
          }
        } catch (error) {
          console.error(`❌ Error parseando mensaje para job ${jobId}:`, error);
        }
      }
    });

    subscriber.on('error', (error) => {
      console.error(`❌ Error en subscriber Redis para job ${jobId}:`, error);
    });

    return subscriber;
  }
}
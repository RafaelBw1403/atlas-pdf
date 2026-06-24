// src/queues/pdf.queue.ts
import { Queue, Job } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { PDFJobData } from '../types/pdfJob';



// Exportamos la conexión para reusarla
export const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

export const pdfQueue = new Queue('pdf-tasks', { connection });

export const addPdfToQueue = async (data: PDFJobData): Promise<Job<PDFJobData>> => {

  const customJobId = uuidv4();

  return await pdfQueue.add('generate-pdf', data, {
    jobId: customJobId,
    attempts: Number(process.env.QUEUE_ATTEMPTS) || 3,
    backoff: { 
      type: 'exponential', 
      delay: Number(process.env.QUEUE_DELAY) || 5000 
    },
    removeOnComplete: true
  });
};
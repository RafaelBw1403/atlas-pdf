import 'dotenv/config';
import { BrevoResponse, EmailOptions } from '../../interface/mail';


export const sendEmail = async ({
  toEmail,
  subject,
  htmlContent,
  senderName = "SaaS PDF" // Valor por defecto
}: EmailOptions): Promise<void> => {
  
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY as string,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: { 
          name: senderName, 
          email: process.env.BREVO_SENDER_MAIL
        },
        to: [{ 
          email: toEmail, 
          name: process.env.BREVO_SENDER_NAME 
        }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = (await response.json()) as BrevoResponse;
    console.log("¡Mail enviado con éxito! ID:", data.messageId);
    
  } catch (e) {
    if (e instanceof Error) {
      console.error("Error enviando email:", e.message);
    } else {
      console.error("Error desconocido:", e);
    }
    throw e; // Relanzamos el error para que el controlador lo maneje
  }
};

// Ejemplo de uso:
// sendEmail({
//   toEmail: "rafael.nava.1403@gmail.com",
//   toName: "Rafael Nava",
//   subject: "Tu reporte PDF está listo",
//   htmlContent: "<h1>Hola Rafael</h1><p>Adjunto encontrarás tu documento.</p>"
// });
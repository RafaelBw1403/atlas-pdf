

export interface EmailOptions {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
  senderName?: string; // Opcional
}

// Interfaz para la respuesta de Brevo
export interface BrevoResponse {
  messageId: string;
}

// export interface VerificationParams {
//   toEmail: string;
//   toName: string;
//   link: string;
//   expiresInMinutes?: number;
// }

export interface RecoveryParams {
  toEmail: string;
  toName: string;
  link: string;
  expiresInMinutes?: number;
}
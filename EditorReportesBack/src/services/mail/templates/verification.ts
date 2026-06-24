// import { VerificationParams } from "../../../interface/mail";
// import { sendEmail } from "../brevo.service";



// export const sendVerificationEmail = async ({
//   toEmail,
//   toName,
//   link,
//   expiresInMinutes = 1440
// }: VerificationParams) => {

//   // Convertimos minutos a horas para que el texto sea más humano
//   const expiresText = expiresInMinutes >= 60 
//     ? `${Math.floor(expiresInMinutes / 60)} horas` 
//     : `${expiresInMinutes} minutos`;

//   const htmlContent = `
//     <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 40px auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 40px; color: #333;">
//       <div style="text-align: center; margin-bottom: 30px;">
//         <h2 style="margin: 0; color: #1890ff; font-size: 24px;">Verifica tu cuenta</h2>
//       </div>
      
//       <p style="font-size: 16px; line-height: 1.5;">Hola <strong>${toName}</strong>,</p>
//       <p style="font-size: 16px; line-height: 1.5; color: #555;">
//         Gracias por registrarte. Para completar tu registro y activar tu cuenta, haz clic en el botón de abajo:
//       </p>

//       <div style="text-align: center; margin: 35px 0;">
//         <a href="${link}" style="background-color: #1890ff; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
//           Verificar mi correo
//         </a>
//       </div>

//       <p style="font-size: 13px; color: #888; text-align: center; margin-top: 30px;">
//         Este enlace es válido por <strong>${expiresText}</strong>.
//       </p>
      
//       <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 30px 0;">
      
//       <p style="font-size: 12px; color: #aaa; text-align: center; line-height: 1.4;">
//         Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
//         <span style="color: #1890ff; word-break: break-all;">${link}</span>
//       </p>
//     </div>
//   `;

//   return sendEmail({
//     toEmail,
//     toName,
//     subject: `Enlace de verificación`,
//     htmlContent
//   });
// };


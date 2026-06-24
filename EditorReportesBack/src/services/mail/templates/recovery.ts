import { RecoveryParams } from "../../../interface/mail";
import { sendEmail } from "../brevo.service";


export const sendPasswordRecoveryEmail = async ({
  toEmail,
  toName,
  link,
  expiresInMinutes = 20
}: RecoveryParams) => {
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 40px auto; border: 1px solid #e1e4e8; border-radius: 12px; padding: 40px; color: #24292e; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="background-color: #f6f8fa; width: 56px; height: 56px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; line-height: 56px;">
          <span style="font-size: 28px;">🔐</span>
        </div>
        <h2 style="margin: 0; font-size: 22px; font-weight: 600; color: #1b1f23;">Restablecer contraseña</h2>
      </div>
      
      <p style="font-size: 15px; line-height: 1.6;">Hola <strong>${toName}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6; color: #57606a;">
        Recibimos una solicitud para cambiar la contraseña de tu cuenta. Haz clic en el botón de abajo para elegir una nueva:
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${link}" style="background-color: #0969da; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 14px;">
          Restablecer mi contraseña
        </a>
      </div>

      <p style="font-size: 13px; color: #57606a; text-align: center; margin-top: 24px; background: #fff8c5; padding: 10px; border-radius: 6px;">
        ⚠️ Este enlace es válido por <strong>${expiresInMinutes} minutos</strong>.
      </p>
      
      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #d0d7de; text-align: center;">
        <p style="font-size: 12px; color: #8c959f; line-height: 1.5;">
          Si no solicitaste este cambio, puedes ignorar este correo de forma segura.<br><br>
          Si el botón no funciona, copia este enlace:<br>
          <span style="color: #0969da; word-break: break-all;">${link}</span>
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    toEmail,
    toName,
    subject: "Instrucciones para restablecer tu contraseña",
    htmlContent
  });
};
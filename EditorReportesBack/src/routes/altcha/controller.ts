import { createChallenge } from 'altcha-lib';
import { Request, Response } from 'express';


export const generateAltchaChallenge = async (req: Request, res: Response) => {
    try {
        const challenge = await createChallenge({
            hmacKey: process.env.ALTCHA_HMAC_KEY as string, // La clave de tu .env
            maxNumber: 50000, // Dificultad (puedes subirla si detectas bots persistentes)
        });

        res.json(challenge);
    } catch (error) {
        res.status(500).json({ error: 'No se pudo generar el reto de seguridad' });
    }
}
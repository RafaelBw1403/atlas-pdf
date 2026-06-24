import { verifySolution } from 'altcha-lib';
import { AppError, ErrorCodes } from '../types/errors';
import { isLocalMode } from '../helpers/general.helpers';

export const requireAltcha = (resolver: any) => {
  return async (parent: any, args: any, context: any, info: any) => {
    if (isLocalMode()) {
      return resolver(parent, args, context, info);
    }

    const altchaPayload = context.req.headers['x-altcha-payload'];

    if (!altchaPayload) {
      throw new AppError(ErrorCodes.ALTCHA_VALIDATION_FAILED, {
        message: 'Se requiere validación Altcha'
      });
    }

    try {
      const isValid = await verifySolution(
        altchaPayload as string, 
        process.env.ALTCHA_HMAC_KEY as string
      );

      if (!isValid) {
        throw new AppError(ErrorCodes.ALTCHA_VALIDATION_FAILED, {
          message: 'Validación de seguridad fallida. Inténtalo de nuevo.'
        });
      }

      return resolver(parent, args, context, info);
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(ErrorCodes.ALTCHA_VALIDATION_FAILED, {
            message: 'Error al procesar la validación de seguridad'
        });
    }
  };
};
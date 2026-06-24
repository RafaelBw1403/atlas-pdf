import { ErrorCodes } from "../types/errors";


export const requireAuth = (resolverFunction: Function) => {
  return async (parent: any, args: any, context: any, info: any) => {
    if (!context.user) {

      // if (context.authScope?.error === ErrorCodes.EMAIL_NOT_VERIFIED) {
      //   const error = new Error('Email verification required');
      //   (error as any).extensions = { code: ErrorCodes.EMAIL_NOT_VERIFIED };
      //   throw error;
      // }

      if (context.authScope?.error === ErrorCodes.USER_NOT_FOUND) {
        const error = new Error('User not found');
        (error as any).extensions = { code: ErrorCodes.USER_NOT_FOUND };
        throw error;
      }

      const error = new Error('Authentication required');
      
      // Add error code based on authScope
      if (context.authScope?.error === ErrorCodes.TOKEN_EXPIRED) {
        (error as any).extensions = { code: ErrorCodes.TOKEN_EXPIRED };
        error.message = 'Token expired';
      } else if (context.authScope?.error === ErrorCodes.INVALID_TOKEN) {
        (error as any).extensions = { code: ErrorCodes.INVALID_TOKEN };
      }
      
      throw error;
    }
    return resolverFunction(parent, args, context, info);
  };
};
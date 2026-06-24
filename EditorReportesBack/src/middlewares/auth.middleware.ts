import jwt from 'jsonwebtoken';
import { User } from "../entities/User.entity";
import { Request } from "express";
import { UserService } from '../services/use.service';
import { ErrorCodes, ErrorCodeType } from '../types/errors';

// auth.middleware.ts
export const authenticateTokenMiddleware = async (req: Request): Promise<{
  user: User | null;
  isValid: boolean;
  error?: ErrorCodeType
}> => {

  const authHeader = req.headers.authorization;
  if (!authHeader) return { 
    user: null, 
    isValid: false, 
    error: ErrorCodes.INVALID_TOKEN
  };

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    const user = await UserService.getUserById(decoded.userId);

    if (!user) return { 
      user: null, 
      isValid: false, 
      error: ErrorCodes.USER_NOT_FOUND
    };

    // if (!user.is_verified) {
    //   return {
    //     user: null,
    //     isValid: false,
    //     error: ErrorCodes.EMAIL_NOT_VERIFIED
    //   };
    // }
    
    return { user, isValid: true };
    
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return { 
        user: null, 
        isValid: false, 
        error: 'expired'
      };
    }
    
    return { 
      user: null, 
      isValid: false, 
      error: 'invalid' 
    };
  }
};
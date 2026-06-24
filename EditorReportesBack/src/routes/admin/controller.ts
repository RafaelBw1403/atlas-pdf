import { Request, Response } from 'express';
import { UserService } from '../../services/use.service';
import { isLocalMode } from '../../helpers/general.helpers';


export const generateAdminUser = async (req: Request, res: Response): Promise<void> => {
    try {

        if (!isLocalMode()) {
            res.status(403).json({ 
                message: 'This endpoint is only available in local mode.' 
            });
            return;
        }

        const credentials = await UserService.generateAutoAdmin();
        
        res.status(201).json(credentials);

    } catch (error: any) {
        const isAuthError = error.message.includes('Unauthorized') || error.message.includes('Forbidden');
        res.status(isAuthError ? 403 : 500).json({ message: error.message });
    }
};
import { ApiKeyInfo } from '../routes/pdf/types';

declare global {
    namespace Express {
        interface Request {
            apiKeyInfo?: ApiKeyInfo;
        }
    }
}

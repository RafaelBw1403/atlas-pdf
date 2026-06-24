
import { Router } from 'express';
import pdfRouter from './pdf';
import sseRouter from './sse/sse.routes';
import { generateAdminUser } from './admin/controller';
import { generateAltchaChallenge } from './altcha/controller';
import { isLocalMode } from '../helpers/general.helpers';

const mainRouter = Router();

const adminRouter = Router();
adminRouter.post('/generateAdminUser', generateAdminUser);

if (!isLocalMode()) {
  const altchaRouter = Router();
  altchaRouter.get('/generateAltchaChallenge', generateAltchaChallenge);
  mainRouter.use('/altcha', altchaRouter);
}

mainRouter.use('/pdf', pdfRouter);
mainRouter.use('/admin', adminRouter);

mainRouter.use('/sse', sseRouter);


export default mainRouter;
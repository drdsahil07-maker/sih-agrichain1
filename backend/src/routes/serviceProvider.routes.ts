import { Router } from 'express';
import { getServiceProviders } from '../controllers/serviceProvider.controller';

const router = Router();
router.get('/', getServiceProviders);

export default router;

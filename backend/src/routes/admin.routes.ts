import { Router } from 'express';
import { getAdminMetrics } from '../controllers/admin.controller';

const router = Router();
router.get('/', getAdminMetrics);

export default router;

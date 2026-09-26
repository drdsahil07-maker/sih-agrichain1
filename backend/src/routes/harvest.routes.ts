import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { getHarvests, createHarvest } from '../controllers/harvest.controller';

const router = Router();
router.get('/', requireAuth, getHarvests);
router.post('/', requireAuth, requireRole('farmer'), createHarvest);

export default router;

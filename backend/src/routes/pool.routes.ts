import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getPools,
  getPoolById,
  suggestPools,
  createPool,
  addHarvest,
  removeHarvest,
  updateStatus,
  recalculateSavings
} from '../controllers/pool.controller';

const router = Router();

router.get('/', requireAuth, getPools);
router.get('/:id', requireAuth, getPoolById);
router.post('/suggest', requireAuth, suggestPools);
router.post('/', requireAuth, createPool);
router.post('/:id/members', requireAuth, addHarvest);
router.delete('/:id/members/:harvestId', requireAuth, removeHarvest);
router.patch('/:id/status', requireAuth, updateStatus);
router.post('/:id/recalculate-savings', requireAuth, recalculateSavings);

export default router;

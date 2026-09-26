import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { getGovernmentOverview, getSupplyDemand, getPools, getLogistics } from '../controllers/government.controller';

const router = Router();

// All government endpoints must be authenticated and restricted to government_admin
router.use(requireAuth);
router.use(requireRole('government_admin'));

router.get('/overview', getGovernmentOverview);
router.get('/supply-demand', getSupplyDemand);
router.get('/pools', getPools);
router.get('/logistics', getLogistics);

export default router;

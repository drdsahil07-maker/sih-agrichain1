import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { initiateAiCall, getAiCallDetails } from '../controllers/ai-calls.controller';

const router = Router();

router.post('/', requireAuth, initiateAiCall);
router.get('/:id', requireAuth, getAiCallDetails);

export default router;

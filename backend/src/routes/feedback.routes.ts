import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createFeedback, getFeedback } from '../controllers/feedback.controller';

const router = Router();

router.post('/', requireAuth, createFeedback);
router.get('/', requireAuth, getFeedback);

export default router;

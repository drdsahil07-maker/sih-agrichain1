import { Router } from 'express';
import { getBuyers } from '../controllers/buyer.controller';

const router = Router();
router.get('/demand', getBuyers);

export default router;

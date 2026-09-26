import { Router } from 'express';
import { getBenchmarks } from '../controllers/price.controller';

const router = Router();
router.get('/benchmark', getBenchmarks);

export default router;

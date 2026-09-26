import { Router } from 'express';
import { analyzeQuality } from '../controllers/quality.controller';

const router = Router();
router.post('/analyze', analyzeQuality);

export default router;

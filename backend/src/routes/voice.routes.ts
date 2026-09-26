import { Router } from 'express';
import { processVoice } from '../controllers/voice.controller';

const router = Router();
router.post('/process', processVoice);

export default router;

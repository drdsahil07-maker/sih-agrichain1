import { Router } from 'express';
import { compileChain, getCounterfactual } from '../controllers/chain.controller';

const router = Router();
router.post('/compile', compileChain);
router.get('/counterfactual', getCounterfactual);

export default router;

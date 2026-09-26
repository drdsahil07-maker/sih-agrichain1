import { Router } from 'express';
import { getMandiPrices, getMandiLocations, getStates } from '../controllers/mandi.controller';

const router = Router();

// GET /api/mandi/locations - cascading locations directory
router.get('/locations', getMandiLocations);

// GET /api/mandi/states - list of all Indian states
router.get('/states', getStates);

// GET /api/mandi/prices and GET /api/mandi
router.get('/prices', getMandiPrices);
router.get('/', getMandiPrices);

export default router;

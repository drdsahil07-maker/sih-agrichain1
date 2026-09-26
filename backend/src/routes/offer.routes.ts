import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { getOffers, createOffer, updateOfferStatus } from '../controllers/offer.controller';

const router = Router();
router.get('/', requireAuth, getOffers);
router.post('/', requireAuth, requireRole('buyer', 'distributor', 'consumer'), createOffer);
router.patch('/:id/status', requireAuth, updateOfferStatus);

export default router;

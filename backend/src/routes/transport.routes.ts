import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getTrips,
  getTripById,
  createTrip,
  updateTripStatus,
  matchOptions,
  assignTransport,
  getTransportAnalytics
} from '../controllers/transport.controller';

const router = Router();

router.get('/trips', requireAuth, getTrips); // Changed from /backhaul for standard REST 
router.get('/backhaul', requireAuth, getTrips); // Keep for backwards compatibility
router.get('/trips/:id', requireAuth, getTripById);
router.post('/trips', requireAuth, createTrip);
router.post('/backhaul', requireAuth, createTrip); // Keep for backwards compatibility
router.patch('/trips/:id/status', requireAuth, updateTripStatus);

router.get('/options/:poolId', requireAuth, matchOptions);
router.post('/match', requireAuth, (req, res) => {
  // Can just redirect to matchOptions if they pass poolId in body
  req.params.poolId = req.body.poolId;
  matchOptions(req, res);
});
router.post('/assign/:poolId', requireAuth, assignTransport);

router.get('/analytics', requireAuth, getTransportAnalytics);

export default router;

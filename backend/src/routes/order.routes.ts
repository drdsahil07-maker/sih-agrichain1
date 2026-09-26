import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrderStatus 
} from '../controllers/order.controller';

const router = Router();

router.use(requireAuth);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);

export default router;

import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
} from '../controllers/order.controller';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id', updateOrder);

export default router;

import { Router } from 'express';
import {
  getDashboardStats,
  getSalesAnalytics,
  getUserManagement,
  getOrderManagement,
} from '../controllers/admin.controller';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateToken, authorizeAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getSalesAnalytics);
router.get('/users', getUserManagement);
router.get('/orders', getOrderManagement);

export default router;

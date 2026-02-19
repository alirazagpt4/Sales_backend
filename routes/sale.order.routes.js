import express from 'express';
import { authenticateToken } from '../Middlewares/authMiddleware.js';
import { createSaleOrder  , getAllSaleOrders} from '../controllers/sale.order.controller.js';

const router = express.Router();

router.post('/create-sale-order', authenticateToken, createSaleOrder);

router.get('/', authenticateToken, getAllSaleOrders);

export default router;
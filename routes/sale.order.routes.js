import express from 'express';
import { authenticateToken } from '../Middlewares/authMiddleware.js';
import { createSaleOrder } from '../controllers/sale.order.controller.js';

const router = express.Router();

router.post('/create-sale-order', authenticateToken, createSaleOrder);
export default router;
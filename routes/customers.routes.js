import express from  'express';
import {createCustomer} from '../controllers/customers.controller.js';
const router = express.Router();
import { authenticateToken } from '../Middlewares/authMiddleware.js';


// Route to create a new customer
router.post('/create-customer', authenticateToken, createCustomer);

export default router;
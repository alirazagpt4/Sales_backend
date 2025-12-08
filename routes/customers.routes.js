import express from  'express';
import {createCustomer, getAllCustomers, getCustomerById} from '../controllers/customers.controller.js';
const router = express.Router();
import { authenticateToken } from '../Middlewares/authMiddleware.js';


// Route to create a new customer
router.post('/create-customer', authenticateToken, createCustomer);

// Route to get all customers with optional search
router.get('/' , authenticateToken ,  getAllCustomers);

// Route to get a customer by ID
router.get('/:id', authenticateToken, getCustomerById);

export default router;
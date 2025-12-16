import express from  'express';
import {createCustomer, getAllCustomers, getCustomerById , updateCustomerById ,deleteCustomerById , getAllCustomersByCity} from '../controllers/customers.controller.js';
const router = express.Router();
import { authenticateToken , isAdmin } from '../Middlewares/authMiddleware.js';


// Route to create a new customer
router.post('/create-customer', authenticateToken, createCustomer);

// Route to get all customers with optional search
router.get('/' , authenticateToken ,  getAllCustomers);

// customers by city 
router.get('/by-city' , authenticateToken ,  getAllCustomersByCity);

// Route to get a customer by ID
router.get('/:id', authenticateToken, getCustomerById);

// Route to update a customer by ID
router.patch('/:id', authenticateToken, isAdmin, updateCustomerById);

// Route to delete a customer by ID
router.delete('/:id', authenticateToken, isAdmin, deleteCustomerById);

export default router;
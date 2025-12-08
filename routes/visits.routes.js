import express from 'express';
import { authenticateToken } from '../Middlewares/authMiddleware.js';
import  {createVisit} from '../controllers/visits.controller.js';

const router = express.Router();

// Route to create a new visit
router.post('/create-visit', authenticateToken, createVisit);


export default router;


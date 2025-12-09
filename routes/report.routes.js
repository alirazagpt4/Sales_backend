import {generateReport} from '../controllers/report.controller.js';
import express from 'express';
import {authenticateToken , isAdmin} from '../Middlewares/authMiddleware.js'

const router = express.Router();

router.get('/reports/detailed' , authenticateToken , isAdmin , generateReport);

export default router;

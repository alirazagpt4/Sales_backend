import {generateDailyVisitReport} from '../controllers/report.controller.js';
import express from 'express';
import {authenticateToken , isAdmin} from '../Middlewares/authMiddleware.js'

const router = express.Router();

router.get('/reports/daily-report' , authenticateToken , isAdmin , generateDailyVisitReport);

export default router;

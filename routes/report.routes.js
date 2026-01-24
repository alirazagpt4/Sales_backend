import {generateDailyVisitReport , generateSummaryReport} from '../controllers/report.controller.js';
import express from 'express';
import {authenticateToken , isAdmin} from '../Middlewares/authMiddleware.js'

const router = express.Router();

router.get('/reports/daily-report' , authenticateToken , isAdmin , generateDailyVisitReport);
router.get('/reports/summary-report' , authenticateToken , isAdmin , generateSummaryReport);
export default router;

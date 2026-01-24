import {generateDailyVisitReport , generateSummaryReport} from '../controllers/report.controller.js';
import express from 'express';
import {authenticateToken , isAdmin} from '../Middlewares/authMiddleware.js'

const router = express.Router();

router.get('/reports/daily-report' , authenticateToken , isAdmin , generateDailyVisitReport);
router.get('/reports/summary-report' , authenticateToken , isAdmin , generateSummaryReport);
<<<<<<< HEAD

=======
>>>>>>> 02e6b2b03e9a0807786a1d878554213a80f79503
export default router;

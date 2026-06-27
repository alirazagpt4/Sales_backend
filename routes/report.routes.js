import { generateDailyVisitReport, generateSummaryReport, generateMyReport, generateMeterReadingReport, generateVisitVerificationReport , getVisitCountReport} from '../controllers/report.controller.js';
import express from 'express';
import { authenticateToken, isAdmin } from '../Middlewares/authMiddleware.js'

const router = express.Router();

router.get('/reports/daily-report', authenticateToken, generateDailyVisitReport);
router.get('/reports/summary-report', authenticateToken, generateSummaryReport);
router.get('/reports/my-report', authenticateToken, generateMyReport);
router.get('/reports/meterreading-report', authenticateToken, generateMeterReadingReport);
router.get('/reports/test-route', (req, res) => res.send("Router is working!"));
router.get('/reports/visit-verification-report', authenticateToken, generateVisitVerificationReport)
router.get('/reports/visit-count-report',authenticateToken, getVisitCountReport);
export default router;


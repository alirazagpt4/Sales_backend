import {kpis} from '../controllers/kpi.controller.js'
import express from 'express';
import { authenticateToken, isAdmin } from '../Middlewares/authMiddleware.js';
const router = express.Router();

router.get('/kpis' , authenticateToken , isAdmin , kpis);

export default router;
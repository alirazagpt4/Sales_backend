import express from 'express';
import {Cities} from '../controllers/cities.controller.js'

const router = express.Router();

router.get('/' , Cities);

export default router;
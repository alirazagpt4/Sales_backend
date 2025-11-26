import { createStartday } from "../controllers/startday.controller.js";
import express from "express";
const router = express.Router();
import { authenticateToken } from "../Middlewares/authMiddleware.js";
import {upload} from "../Middlewares/multerMiddleware.js";

// Route to create a new Startday record
router.post('/startday' , authenticateToken , upload.fields([{
    name: 'image', maxCount: 1
},
{  name: 'data', maxCount:1}
]), createStartday);

export default router;
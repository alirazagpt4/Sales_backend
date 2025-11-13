import express from "express";
const router = express.Router();

import { createUser , loginUser } from "../controllers/User.controller.js";

// Route to create a new user
router.post('/register' , createUser);

// Route to login user
router.post('/login' , loginUser);

export default router;
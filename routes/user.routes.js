import express from "express";
const router = express.Router();
import { authenticateToken } from "../Middlewares/authMiddleware.js";

import { createUser , loginUser } from "../controllers/User.controller.js";

// Route to create a new user
router.post('/register' , createUser);

// Route to login user
router.post('/login' , loginUser);

// Protected route example
router.get('/protected' , authenticateToken , (req , res) =>{
    res.json({
        message : "This is a protected route",
        user : req.user
    });
});


export default router;
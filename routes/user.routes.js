import express from "express";
const router = express.Router();
import { authenticateToken, isAdmin } from "../Middlewares/authMiddleware.js";

import { createUser , loginUser , loginAdmin, getAllUsers, updateUser, deleteUser } from "../controllers/User.controller.js";

// Route to create a new user
router.post('/register' ,authenticateToken , isAdmin, createUser);

// Route to login user
router.post('/login' , loginUser);


// Admin login 
router.post('/admin/login', loginAdmin);

router.get('/' , authenticateToken , isAdmin , getAllUsers);


router.patch('/:id' , authenticateToken , isAdmin , updateUser);


router.delete('/:id' , authenticateToken , isAdmin , deleteUser);
// Protected route example
router.get('/protected' , authenticateToken , (req , res) =>{
    res.json({
        message : "This is a protected route",
        user : req.user
    });
});


export default router;
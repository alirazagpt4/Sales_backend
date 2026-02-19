import express from "express";
const router = express.Router();
import { authenticateToken, isAdmin, isSuperAdmin } from "../Middlewares/authMiddleware.js";

import { createUser , loginUser , loginAdmin, getAllUsers, updateUser, deleteUser, viewUser } from "../controllers/User.controller.js";

// Route to create a new user
router.post('/register' ,  createUser);

// Route to login user
router.post('/login' , loginUser);


// Admin login 
router.post('/admin/login', loginAdmin);

router.get('/' , authenticateToken , getAllUsers);




router.get('/:id' , authenticateToken , isAdmin , viewUser);

router.patch('/:id' , authenticateToken , isSuperAdmin , updateUser);


router.delete('/:id' , authenticateToken , isSuperAdmin , deleteUser);
// Protected route example
router.get('/protected' , authenticateToken , (req , res) =>{
    res.json({
        message : "This is a protected route",
        user : req.user
    });
});


export default router;
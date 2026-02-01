import express from 'express';
import { authenticateToken, isSuperAdmin } from '../Middlewares/authMiddleware.js';
import { createItem  , getAllItems , getItemById, deleteItemById , updateItemById} from '../controllers/items.controller.js';

const router = express.Router();

// Route to create a new item
router.post('/create-items', authenticateToken, isSuperAdmin, createItem);

router.get('/' , getAllItems);

router.get('/:id'  , getItemById);



router.patch('/:id' , authenticateToken , isSuperAdmin , updateItemById);

router.delete('/:id' , authenticateToken , isSuperAdmin , deleteItemById);

export default router;
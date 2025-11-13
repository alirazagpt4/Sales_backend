import express from 'express';
const router = express.Router();


// Route to get sales data
router.get('/' , (req , res) =>{
     res.json({
        message : "Sales App is Running"
     })
});


export default router;